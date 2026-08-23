# ARCHITECTURE.md — IndiaMart Lead Speed Engine

**Design method:** staff-engineer (interface twice, seam test, deletion test) + first-principles (floor, bracket) + dillon-mulroy (failure modes explicit) + rauchg (round trips). Research base: rafoworks (event pipeline), TyposBro (vertical slice), entix (CSR rules), CF docs (Queues/D1/AE), Meta error docs.

---

## 0. Verdict

**Design B wins:** pure `decide()` + shallow `executeDecision()` + `ingestLead()`. Not Design A (one deep `handleLead`) because the platform splits into three runtimes — webhook handler (<100ms ack), queue consumer, digest cron — and a single-entry signature must grow a mode flag to serve all three, which is the exact "flag that exists because two callers wanted different things" smell. Design B's split mirrors the deployment topology exactly.

Design C (plugin rule pipeline) deleted: deletion test fails outright — 5 rules collapse into 5 if-statements inside `decide()`, nothing reappears across callers. Seam test fails: zero rule implementations have ever varied.

---

## 1. System overview

```
IndiaMart Push POST ──▶ Hono /webhook/:sellerId?token=
                          │ zod parse (JSON primary, urlencoded fallback)
                          │ normalize → NormalizedLead
                          ▼
                     ingestLead()
                          │ DedupPort.claim(dedupKey)     ← D1 UNIQUE, atomic
                          │   ├─ dup → Outcome{duplicate_ignored} → 200
                          │   └─ new
                          │ QueuePort.send(EnqueuedLead)  ← await FIRST
                          │ StatePort.upsertReceived()    ← then D1 commit
                          ▼
                       200 <100ms (ack budget: no awaited WA/Sheets I/O)

leads-queue ──▶ queue consumer (per-msg ack/retry/DLQ)
                  │ decide(lead, catalog, now)      ← PURE, no I/O
                  │ executeDecision(decision, ports)
                  │   ├─ wa_now    → WaPort.sendTemplate → StatePort.markSent
                  │   ├─ defer     → StatePort.markDeferred(until 08:05 IST)
                  │   ├─ spam      → skip WA + refundDraft=true
                  │   └─ failure   → TerminalError=ack+log | RetryableError=msg.retry()
                  ▼
             LogPort.write → Analytics Engine (awaited) + Sheets (best-effort)

cron 30 3 * * * (03:30 UTC = 08:05 IST) ──▶ release held leads + daily digest
```

**Latency floor (bracketed):** IndiaMart push 0.8s best / 45s bucketed worst + Worker 15ms + WA 0.6-2.2s = **1.5s best, ~48s worst end-to-end**. Arrival rate 100/mo = 0.000038 req/s — no queue backlog problem; it is a wake-up problem.

---

## 2. Interface (the agreed contract)

```ts
// src/domain.ts — PURE. Zero imports. No Date.now, Math.random, fetch.
export type Route = 'wa_now' | 'wa_defer_digest' | 'human' | 'silent_spam';

export interface NormalizedLead {
  leadId: string;           // UNIQUE_QUERY_ID (documented dedup key)
  sellerId: string;
  mobile: string | null;    // normalized "919999999999"; masked kept verbatim
  productName: string;
  queryMessage: string;
  city: string;
  callDurationSec: number;  // GMT missed-call duration; 0 if web lead
  source: 'push' | 'gmail' | 'pull';
  receivedAtMs: number;
}

export interface Catalog {
  sellerId: string;
  company: string;
  ownerName: string;
  ownerWaPhone: string;     // E.164 digits
  skuPatterns: RegExp[];    // /pump.*(HP|kW|GPM|capacitor)/i
  homeCity: string;
  quietStartMinIst: number; // 1320 = 22:00
  quietEndMinIst: number;   // 420  = 07:00
  digestMinIst: number;     // 485  = 08:05
}

export interface Decision {
  leadId: string;
  sellerId: string;
  route: Route;
  priority: number;         // 0-100 ("priority" not "score")
  templateKey: string | null;
  templateVars: string[];
  slaSec: number;           // HOT 300, WARM 900
  slaDueAtMs: number;
  deferUntilMs: number | null;
  refundDraft: boolean;
  reasons: string[];
}

export declare function decide(lead: NormalizedLead, catalog: Catalog, now: Date): Decision;

// src/ports.ts — interfaces only
export type WaSendResult =
  | { kind: 'sent'; waMessageId: string }
  | { kind: 'rate_limited' }         // 130429/429/80007 → retry
  | { kind: 'reengagement_blocked' } // 131049 → park 24h, never retry sooner
  | { kind: 'not_on_whatsapp' }      // 131026 → terminal
  | { kind: 'template_invalid' }     // 132001 → terminal + founder alert
  | { kind: 'transient'; detail: string };

export interface WaPort { sendTemplate(i: {to: string; templateKey: string; vars: string[]}): Promise<WaSendResult>; }
export interface DedupPort { claim(key: string): Promise<boolean>; }  // atomic by contract
export interface QueuePort { send(msg: EnqueuedLead): Promise<void>; } // throws => ingest 500
export interface LogPort { write(event: LeadEvent): Promise<void>; }
export interface ScorePort { score(l: NormalizedLead, c: Catalog): Promise<{priority: number; reason: string}>; }

// src/outcome.ts — total function, never rejects except programmer bug
export type Outcome =
  | { disposition: 'acked_enqueued'; leadId: string; dedupKey: string }
  | { disposition: 'duplicate_ignored'; leadId: string; dedupKey: string }
  | { disposition: 'rejected_unauthorized' }
  | { disposition: 'rejected_bad_payload'; reason: string }
  | { disposition: 'sent'; leadId: string; waMessageId: string; latencyMs: number }
  | { disposition: 'deferred_to_digest'; leadId: string; deferUntilMs: number }
  | { disposition: 'skipped_spam'; leadId: string; refundDraft: boolean }
  | { disposition: 'failed_permanent'; leadId: string; waCode: number | null }
  | { disposition: 'retryable_failure'; leadId: string; attempt: number; detail: string }
  | { disposition: 'dead_lettered'; leadId: string; attempts: number };
```

---

## 3. Seam map

| Dependency | Class | Port? | Fake? | Reason |
|---|---|---|---|---|
| Rule scoring | pure computation | **No port** | table tests | Port here = seam test failing in expensive direction |
| D1 dedup | remote-yours | `DedupPort.claim` | `InMemoryDedup` | D1↔IdempotencyDO candidates + determinism |
| CF Queues | remote-yours | `QueuePort.send` | `InMemoryQueue` | thin, exists for harness |
| WhatsApp API | genuinely external | `WaPort.sendTemplate` | `FakeWA` scripted per code | determinism, not swapping |
| Analytics Engine | remote-yours | inside `LogPort` (primary, awaited) | `InMemoryLog` | sink not module |
| Google Sheets | genuinely external | inside `LogPort` (secondary, swallowed) | same | best-effort |
| OpenAI/Sarvam | external ×2 | `ScorePort` optional | `FakeScore` | two named providers = real seam |
| IndiaMart Push | transport = caller | none | n/a | parse at edge |
| Voice/Pull | hypothetical | stub declarations only | none | second-use rule |

---

## 4. Data model (Drizzle, D1-safe)

Full schema in agent output §2. Key decisions:
- **INTEGER epoch-ms timestamps** (not TEXT), **INTEGER 0/1 booleans** via `mode:'boolean'` (D1 has no BOOLEAN)
- `lead_states.dedupKey` PRIMARY KEY — claim = `INSERT ... ON CONFLICT DO NOTHING`, winner iff `rowsChanged === 1`
- `priceMicroInr INTEGER` — ₹0.115 → 115000, no float money
- `fuzzyKey` column + composite index `(fuzzyKey, createdAtMs)` implements 10-min guard with query predicate — no TTL sweeper
- Indexes: `(sellerId, createdAtMs)`, `(route, deferUntilMs)` for digest scan, `(outcome)`
- Migrations: drizzle-kit generate → **hand-review SQL** (PRAGMA foreign_keys trap, issue #3065) → wrangler apply. Additive-only during dev.

---

## 5. Error taxonomy

| Source | Signal | Disposition | Retried? |
|---|---|---|---|
| Push token mismatch | 401 | `rejected_unauthorized` | No |
| Push bad body / missing ID | zod fail | `rejected_bad_payload` | No |
| D1 SQLITE_CONSTRAINT on dedupKey | race won by other | `duplicate_ignored` | No — P0-1 working |
| Queue.send throws | infra | ingest returns 500, dedup NOT committed | IndiaMart 3 retries |
| WA 131049 re-engagement | policy | `failed_permanent`, park 24h | Never <24h |
| WA 131026 not on WA | user | `failed_permanent` | Terminal |
| WA 80007 undeliverable | permanent | `failed_permanent` | Terminal |
| WA 130429/429 throttle | transient | `retryable_failure` | ≤3 backoff |
| WA 132001 template invalid | config | `failed_permanent` + founder alert | Terminal |
| WA 5xx/network | transient | `retryable_failure` | ≤3 |
| Consumer attempts >3 | exhausted | `dead_lettered` + Telegram + replay CLI | Manual |
| Sheets 429 | swallowed | none — sent unaffected | next batch |
| AE binding error | degraded | gap metric | No |

Consumer contract: `retryable_failure` → throw (CF redelivers); everything else → ack. Batch gotcha: ack each success individually — one unhandled failure redelivers all 10.

---

## 6. Observability

**Analytics Engine schema (positional, stable forever):**
```
blob1=event(kind)  blob2=stage  blob3=error_code  blob4=wa_template
double1=latency_ms double2=count
index1=leadId      (exactly ONE index — multiple = silent drop)
```
Free tier 100K writes/day covers funnel. Fire-and-forget, max 250 points/invocation.

**Alerts:** sla miss >5m · dup rate >0 · DLQ depth >0 · WA block rate >5% · unmapped WA code count >0.

**Structured logs:** JSON with `rid` from CF Ray ID (`requestId({generator: c => c.req.raw.cf?.rayId})`).

---

## 7. File tree + dependency direction

```
src/
├── domain.ts          # PURE types + decide(). IMPORTS: nothing
├── errors.ts          # TerminalError | RetryableError taxonomy. IMPORTS: nothing
├── ports.ts           # interfaces only. IMPORTS: domain
├── schemas/lead.ts    # zod Raw→NormalizedLead. IMPORTS: domain types
├── ingest.ts          # parse→claim→enqueue. IMPORTS: domain, ports, errors, schemas
├── execute.ts         # shallow switch on route→port calls. IMPORTS: domain, ports, errors
├── routes/webhook.ts  # Hono routes. IMPORTS: ingest, errors
├── queue/consumer.ts  # per-msg ack/retry/DLQ. IMPORTS: execute, ports, errors
├── cron/digest.ts     # 03:30 UTC release+digest. IMPORTS: ports, errors
├── adapters/          # d1-dedup, d1-state, wa-cloud, cf-queue, ae-log, sheets-log, score-openai
│                      #   IMPORTS: domain, ports, errors ONLY
├── voice/stub.ts      # ADR-006 seam reserve
└── index.ts           # COMPOSITION ROOT. IMPORTS: everything
test/
├── harness/           # create-test-harness, in-memory-{dedup,queue,log}, fake-wa
├── conformance/dedup-conformance.test.ts   # SAME suite vs InMemory AND D1
├── domain.test.ts  ingest.test.ts  consumer.test.ts  quiet-hours.test.ts
└── integration/d1-dedup.test.ts            # vitest-pool-workers real D1
migrations/0001_schema.sql
```

Rule L0-L5 enforced by depcruise: `domain/errors ← nothing · ports/schemas ← L0 · ingest/execute ← ≤L1 · routes/queue/cron ← ≤L2 · adapters ← L0-L1 · index ← all`.

---

## 8. Invariants (each has a named test)

| # | Invariant | Test |
|---|---|---|
| 1 | At-most-one WA per dedupKey under concurrency | `concurrentInject(payload, 50)` → 1 sent, 49 dup, `waMessages.count===1`. <2s deterministic |
| 2 | `decide` is pure | import-graph lint bans symbols + property test 10k random inputs deep-equal on repeat |
| 3 | `executeDecision` total — never rejects on port failure | every port replaced by rejecting fake → always resolves to well-formed Outcome |
| 4 | Quiet-hours hold | sweep now across 1440 min × {HOT,WARM} → in-window always `wa_defer_digest` at next 08:05 IST |
| 5 | Bounded retries ≤3 → DLQ | FakeWA always rate_limited → sequence retry×3→dead_lettered, replay CLI lists it |
| 6 | Spam ⇒ no WA + refund draft | labeled corpus 100 rows → 100% silent_spam, waMessages.count===0 |
| 7 | Ack budget — no awaited WA/Sheets in ingest | wall-clock <50ms with fakes + static import assertion |
| 8 | State-before-send ordering | FakeWA records call sequence; insert precedes send in trace |

Fuzzy 10-min phone guard is explicitly **advisory** (masked numbers make it heuristic) — never part of at-most-once claim.

---

## 9. ADR index

| ADR | Decision | Rejected |
|---|---|---|
| 001 | Workers free tier over VPS/n8n-Oracle | VPS ₹500+/mo patch burden; Oracle reclaims idle |
| 002 | D1 UNIQUE over KV for dedup | KV eventually consistent across PoPs — both claims can win |
| 003 | Hono over raw fetch/itty-router | raw OK at 2 routes but hand-rolled router by route five; itty untyped params |
| 004 | Vertical slice + seams only at real ports | hexagonal-everywhere = pass-through adapters failing deletion test |
| 005 | Bun 1.3.11 pinned | Node+npm = three tools slower loop; revisit if enterprise team operates |
| 006 | No voice MVP; `VoicePort` stub only | flag-gated ship = permanently-ready-never-committed |
| 007 | Official WA Cloud v25.0 over Baileys | unofficial = ban risk = business death; headless browser impossible on Workers anyway |

---

## 10. P0 build order (acceptance criteria per step)

| Step | Files | Done when |
|---|---|---|
| **0 harness** | ports, errors, test/harness/*, ingest.test | `bun run test:loop` green <2s ×10 runs; duplicate→1 WA; concurrent 50→0 dup |
| **1 decide pure** | domain.ts, domain.test, quiet-hours.test | domain.ts zero imports (grep); all Decision actions covered; <50ms suite |
| **2 D1 dedup** | migrations/0001, adapters/d1-dedup, conformance suite | InMemory and D1 pass IDENTICAL conformance suite; local migrate clean |
| **3 Queue DLQ** | queue/consumer, execute, consumer.test | happy→ack; Retryable→retry(); Terminal→ack not retried; exhausted→DLQ; poison→terminal ack |
| **4 LogPort** | ae-log, sheets-log, cron/digest, log.test | AE mapping exact; Sheets throw swallowed; cron fires 03:30 UTC |
| **5 WaPort** | wa-cloud, errors finalize, wa.test | every Cloud API class mapped; unmapped defaults safe; FakeWA scripted from real payloads |

Then tracer bullet: curl POST → 200 <100ms → D1 row → queue → decide → FakeWA → log.

---

## 11. Ops notes (from research)

- **IndiaMart payload:** JSON `{CODE, STATUS, RESPONSE:{...}}` primary (urlencoded legacy fallback). `QUERY_TIME` IST-naive — parse with +05:30 or quiet-hours skews 5.5h. Empty strings not null. Landline `SENDER_PHONE` present ≠ WA-reachable — gate on mobile. No HMAC: unguessable token path + optional IP allowlist.
- **WA signature verify (inbound callbacks):** HMAC the RAW bytes before JSON.parse; re-serialized objects fail every time.
- **Cron UTC-only:** `30 3 * * *` = 08:05 IST. Claim-time Intl gate handles inbound; cron releases outbound backlog.
- **vitest-pool-workers:** `fileParallelism: false` (workerd hang bug #14903); platform does NOT enforce idempotency locally (#14836) — self-test double-delivery.
- **DLQ retention 4 days** without consumer — replay CLI or lose them.
