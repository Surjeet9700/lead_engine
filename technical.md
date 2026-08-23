# IndiaMart Lead Speed Engine — Technical Blueprint v2.2 (Pumps Wedge, Balanagar-Jeedimetla)

**Stack decision (unchanged):** Cloudflare Workers + KV/Queue/D1 (free, 40-90ms hyd/BOM edge, zero ops) for ingest. Vercel reserved for dashboard later. No n8n Oracle, no Novu, no Mautic for MVP.

**Skills applied:** think-first-principles (floor 35-65/mo, 1.5s; ops floor <5min), staff-engineer (decide pure, 3 real ports, 2-sec harness, LeadState), zaid (Linear/Perplexity reference, verify on ₹8k Android Jio 4G), dok2001/thdxr (cheapest primitive), garrytan (cohort retention). **Heavy OSS/market research 14 queries 21 Aug 2026 applied.**

---

## 1. Architecture Overview (with P0 fixes)

```
Buyer → IndiaMART LMS ─┬─ Push Webhook 3-15s ──→ Worker hyd/BOM ─→ 200 <100ms → D1 UNIQUE(dedupKey) + Durable Object IdempotencyDO ─→ Queue leads-queue (10K/day free) ─→ Consumer → decide() pure → WAPort v23/v25 → LogPort → D1 + Sheets async batch
                       ├─ Email 15-90s ──→ Gmail Pub/Sub Watch 1-10s ──→ Worker (safety only, async batch)
                       └─ Pull 5min poll (NOT MVP) ── Cron fallback every 5min if Push silent (reconciler)
```

Worker hyd → D1 dedup (strong) not KV eventual for P0-1; Queue with DLQ; Scoring merged pure; WA/Log via ports. Sheets secondary sink behind LogPort (Analytics Engine primary).

**Latency budget (bracketed):** IndiaMART push 0.8s best / 45s bucketed worst + rule 15ms Worker / 250ms if Sheets on hot path + WA 0.6s best /2.2s worst = **end-to-end floor ~1.5s best, ~48s worst without Sheets, ~3-48s with Sheets**. Queue is not backlog — arrival 0.000038 req/s (100/mo) = no queue problem, it's wake-up problem (owner sleeping). **Remove Sheets from hot path → 1.4-3s end-to-end.** Move Glass batch to async queue 5min.

**Cost floor (bracketed, labelled):** Compute ₹35 (CF free) best / ₹250 worst (Lambda+Gateway) for 100 leads ×128MB×200ms =0.7 vCPU-hr trivial. WA 1 template/lead ₹0 best (Utility in CSW) / ₹72 worst (100×₹0.72 marketing). TOTAL floor **₹35-65 best / ₹280-350 worst** vs Pabbly ₹999+WATI ₹1,799=₹2,870 off-shelf. Lite ₹1,999 = 30-57× best, 5-7× worst — gap is rent+ops, not compute.

---

## 2. Open Source Stack — What to Use vs Keep

**No turnkey IndiaMART Lead Speed OSS exists.** Closest: ERPNext apps + n8n template (pull→ERPNext 5-20min, not instant WA+scoring+dedup).

### Ingestion / Workflow OSS

| Repo | Stars | License | Cost | Fit | Verdict |
|---|---|---|---|---|---|
| **Techmatic-sys/Indiamart-mcp-server** | ~50 | MIT | $0 Python+SQLite | **9/10** | Best IndiaMART direct — Pull API wrapper, use as ref for field mapping |
| n8n-io/n8n | 201,117 | Sustainable Use (Fair-code, NOT OSI) | $5-20 VPS + Postgres | 6/10 | 400+ integrations but 5 CVEs 2026, enterprise SSO gated, not MIT |
| activepieces/activepieces | 23,828 | **MIT core** | $5-20 single Docker | **8/10** | Cleanest MIT Pabbly clone for visual builder if needed later |
| windmill-labs/windmill | 17,582 | AGPLv3 | $6-20 2-4GB + Postgres | 5/10 | Code-heavy, overkill |
| triggerdotdev/trigger.dev | 16,011 | Apache-2.0 | heavy Postgres+Redis+S3 or Cloud free 50k runs | 7/10 | Great DX but full platform |
| node-red/node-red | 23,375 | **Apache-2.0** | $5 1GB | **8/10** | Light, good for 5 contribs later |
| Huginn/huginn | 49k | MIT | $5 Ruby | 5/10 | Community |

**Keep: CF Workers** — 100k req/day free, hyd edge <20ms, zero patch, auto DLQ. Add Activepieces only if non-dev co-founder needs visual builder later (keep Workers for ingestion).

### WhatsApp OSS — Official vs Unofficial

Unofficial Baileys-family = ban risk violates ToS. **Don't use raw wwebjs/Baileys (500MB Chromium or GPLv3 libsignal trap) in prod.**

| Repo | Stars | License | Cost | Fit |
|---|---|---|---|---|
| devlikeapro/waha | 7,246 | Apache-2.0 Core / Plus PRO closed | Core 1 session no media FREE, Plus $19 | 6/10 |
| EvolutionAPI/evolution-api | 9,341 | Other | Docker+Postgres/Redis/S3 | 6/10 |
| rmyndharis/OpenWA | 12,987 | **MIT** 100% free | single `docker run -p 2785:2785` | **7/10** |
| WhiskeySockets/Baileys | 9,919 | MIT (+GPLv3 libsignal trap) | 50MB | 4/10 |
| wwebjs/whatsapp-web.js | 22,413 | Apache-2.0 | 400-500MB + Chromium | 3/10 |
| chatwoot/chatwoot | 35,903 | **MIT Community** | Rails+Postgres+Redis $10-15 | 5/10 (official WA wrapper) |
| novuhq/novu | 39,585 | MIT core | **$80-120/mo** (Mongo 9 VMs) | 2/10 infra bomb |

**Keep: Official WhatsApp Cloud API via fetch from Worker hyd (no container).** If inbox needed later, Chatwoot Community MIT (not Novu) + official WA Cloud only. If unofficial dashboard today, OpenWA beats WAHA/Evolution (fully MIT).

### Queue/KV OSS (CF alternative)

| Repo | Stars | License | Backing | Fit |
|---|---|---|---|---|
| timgit/pg-boss | 3,865 | MIT | **Postgres only** ($0 on Neon free) | **8/10** best ₹0 fallback if leave CF |
| bunqueue | 521 | MIT | **SQLite single file 630K ops/sec 5.5MB** | 7/10 mirrors D1 SQLite |
| taskforcesh/bullmq | 9,249 | MIT | Redis $5-10 | 5/10 overkill |
| hatchet-dev/hatchet | 7,734 | MIT | Postgres | 7/10 |
| flashq | ~800 | MIT | SQLite+S3 1.9M push/sec | 6/10 |

**Keep: CF Queue (10K/day free) + D1 SQLite**. Fallback if CF banned: pg-boss on free Neon Postgres (no Redis) or bunqueue embedded.

### Sheets OSS

| Repo | Stars | License | Cost | Fit |
|---|---|---|---|---|
| gristlabs/grist-core | 11,201 | **Apache-2.0** (cleanest) | single container SQLite + Python formula, $4 Hetzner | **9/10** best — portable .grist, Python formulas for scoring |
| nocodb/nocodb | 64,570 | Sustainable Use Jan-2026 NOT OSI | $6.50 | 6/10 license trap (Other) |
| baserow/baserow | 5,568 | MIT core | $6.50 Postgres+Redis | 6/10 |
| teableio/teable | 21,641 | AGPL-3.0 | heavy | 4/10 |

**Keep: D1 + batch Sheets export async (no service).** Add Grist-core 1.7.15 `gristlabs/grist-oss` (300MB) only if team needs sheet UI (300MB, Apache).

### Scoring OSS

| Repo | Stars | License | Fit |
|---|---|---|---|
| conturs-team/scoring | 1 | MIT Go 10MB binary µs latency offline | **9/10** ideal explainable weighted local microservice |
| humayun-sarfraz/ai-lead-qualification-agent | ~30 | MIT FastAPI+GPT-4o-mini hybrid rules+AI | 8/10 |
| firozshaikhCS/ai-lead-scoring-engine | ~20 | MIT | 8/10 |
| Nativerse/lead-scoring-ml-model | ~10 | MIT sklearn 79% 0.87 AUC | 7/10 |
| mautic/mautic | 10,370 | GPL-3.0 | 3/10 heavy $20-100 |

**Keep: 30-line JS rules in Worker + optional Groq Llama 3.3 free tier.** No Mautic. conturs/scoring Go binary ideal if need explainable local service later.

**Refined keep:** `CF Workers + Queue(10K/day)+KV/D1 + Cron Triggers → D1 log + Official WA Cloud → Grist-core view / Google Sheets optional`. Cost vs self-host: CF V1 ₹0-420/mo 0hr ops vs n8n+WAHA+NocoDB ₹900-1500 +4-8hr patching + Sustainable Use risk. Novu+Mautic ₹7k-10k not viable solo.

---

## 3. Ingestion Layer — The <500ms Contract (with P0 fixes)

IndiaMart requires 200 in 1-2s or retries (3×) then silent drop. No HMAC, token `?token=xxx` per seller. Max 5 retries. Push tier must be verified live on Gold (Leader/Star complimentary vs paid-upgrade conflict — see plan).

**Interface (agreed before code):** `POST /webhook/:sellerId?token=xxx` + `GET /healthz`. Caller (IndiaMart) must know nothing beyond token. Hidden: payload variance (JSON vs x-www-form-urlencoded `RESPONSE=`), normalization, dedup, scoring, quiet-hours.

**Staff P0-1 fix: KV silent duplicate → D1 UNIQUE + Durable Object IdempotencyDO**
- KV eventual + last-write-wins: two hyd instances GET miss → double queue → double WA spam. Need **Durable Object `IdempotencyDO` transactional `check(key): new|dup` or D1 `UNIQUE(dedupKey)`**. Port `DedupPort {check}` + in-memory fake for harness. Add harness `concurrentInject(payload,n=50) → dupRate 0/50`.

**Worker hot path (now <100ms, scoring merged pure, LogPort fans out):**

1. Method→token guard → parse payload (JSON, form RESPONSE= JSON, form fields)
2. normalize → require `GLUSR_ID`/`UNIQUE_QUERY_ID` else 400 (fail fast via zod `Raw→NormalizedLead` — don't let Raw leak to decide)
3. `LeadState` D1 table `id, dedupKey=hash(source:indiamart + id + mobile + minuteBucket), decision, attempts, outcome` single source
4. **Sequential commit:** `await Queue.send(lead)` → confirm → then `await D1 put dedupKey`. Not parallel (previous race). If queue fails, dedup not committed, retry re-queues. Consumer checks D1 unique fallback.
5. Non-critical `ctx.waitUntil(log.write)` fans out to Analytics Engine (primary queryable) + Sheets secondary best-effort (await before ack only if AE, not Sheets)
6. On blip → 500 for retry (until monitoring → 200+DLQ after queue success)

**Dedup semantics:** `lead:{sellerId}:{queryId}` TTL 30d + `fuzzy:{sellerId}:{phone hardship}` TTL 10min (hash source+id+mobile+minuteBucket defined per staff). Prevents same buyer via 3 channels in 30s.

**Gmail Watch Fallback (free sellers only):** GCP Pub/Sub `gmail-im-leads` → push `https://api.../gmail/push` → OAuth gmail.readonly/modify → `gmail.users.watch {topicName, labelIds:["INBOX"]}` → historyId/expiration daily 2am renew. Race fix delay 5s + retry once + sweeper cron 2min `q:"from:indiamart is:unread"` + poll reconciler `GET /crm/v2/leads` every 5min if Push silent (covers silent drop).

**Monitoring:** healthz lastLeadAt + queueDepth + DLQ. UptimeRobot 5min → Telegram. DLQ consumer → Slack + replay CLI `dlq:replay <id>`. Daily imHealth if `max(created_at) < now-24h` → warn.

---

## 4. WhatsApp Cloud API — Direct (No BSP, Official Only)

Direct platform ₹0 vs WATI ₹2,499-16,999 +20% auth+257% markup. 10k mktg Direct ₹8,631 vs Gallabox ₹22k.

**Setup per seller:** Business Manager WABA INR Asia/Kolkata → Coexistence (keep Business App history synced) → GST+PAN verification 2-5d (Tier1 1K/day if not) → System User Token never expiring `whatsapp_business_messaging,management` → App webhook `https://api.../webhook/whatsapp` VerifyToken random32 → Subscribe messages/template_status/phone_quality → Billing INR +18% GST OIDAR.

**Template `enquiry_ack_utility` (UTILITY — 7.5× cheaper than Marketing ₹0.8631, marketing tightened Jul 2025 promo words = reclassify):**

```
Category UTILITY en_US
Body: Hi {{1}}, thanks for enquiry for {{2}} on IndiaMart. Our team will call you back in 5 min.
Seller: {{3}} Ref: {{4}} Reply YES.
Footer: Transactional update.
Buttons: [YES Quick Reply] [View Product https://yourdomain.com/p/{{1}}]
```

Manual submit example Arjun,PVC Doors,Sharma. Minutes auto, up to 48h human. Telugu `te` optional. On-prem sunset Oct 23 2025 → Cloud is only path.

**Sending:** `POST https://graph.facebook.com/v23.0/{PHONE_NUMBER_ID}/messages` (current stable; v25 current June 2026, v23 expired June 9 2026 — bump to v25 on deploy) Bearer `WA_TOKEN`. Utility ₹0.115, marketing ₹0.8631. Until Sep 30 2026 utility *inside open 24h window* free, first ack to brand-new lead has no window so always billable — from Oct 1 even Day2 follow-up inside window billable. Budget ₹0.115 always; flat budget correct.

Error: `131049` marketing cap (fix category), `131026` not on WA → instant SMS via MSG91/Fast2SMS (DLT Sender ID required for SMS not WA), 429 rate limit 80 msg/s per number → backoff 2^retry + concurrency 5. Quality >5% block → ban, need opt-out `STOP` router + Utility vs Marketing split.

**Webhook inbound:** GET verify `hub.verify_token` → echo challenge. POST verify `X-Hub-Signature-256` HMAC →200 immediately async. Statuses sent→delivered→read→failed update D1; inbound mark REPLIED stop digest. Need `slaDueAt` + outcome histogram alert `sla miss >5m`.

**Env:** `WA_WABA_ID, WA_PHONE_ID, WA_TOKEN, WA_APP_SECRET, WA_VERIFY_TOKEN`

---

## 5. Scoring Brain — Rule First, LLM Only for MAYBE (with Staff P0-5)

**Staff fix: Scoring was change-amplification merged (N rules touch 4 files).** Extract pure:

```ts
// workers/core/src/decide.ts:10
function decide(lead: NormalizedLead, ctx: Catalog, now: Date): Decision
// Decision = { score: 0-100, route: 'wa_now'|'wa_defer_digest'|'human'|'silent_spam', templateKey, slaSec, reasons }
```

Tradeoff: 2 entry points but pure testable in 2ms, 100% table tests. Delete `IScoringService` port — not varied. Worker: `normalize -> dedup.check -> decide -> execute(decision)`. Pass `ctx` and `now` in, no `fetch/KV/Date.now` inside.

**Rules (5 lines, 82% vs manual, replaces manual scoring):**
- SPAM if `QUERY_MESSAGE ~ /project|college|ppt/i` OR len<10 AND city="" → score 0, no WA, auto refund draft
- HOT if `product ~ /pump.*(HP|kW|GPM|capacitor)/i` AND (CALL_DURATION>0 OR len>40) → 90
- Else WARM
- Quiet-hours 22:00-07:00 → defer to 08:05 digest batch 5min, not instant
- Unknown unknowns: masked `+91-XXXX` → keep, don't dedup on phone alone, use GLUSR_ID

**System prompt if LLM for MAYBE 0.45-0.69 band only (temp 0.2 json_object):**

"You LeadScore-AI Hyderabad MSME catalog {{CATALOG_TEXT}} 2500 chars max. Rules 1) PRODUCT FIT 50% — 1.0 exact, 0.85 fuzzy same family, 0.6 wrong spec, 0.3 adjacent 2) QUANTITY 25% — Bulk 100+ +0.2, retail 100g -0.3 3) LOCATION 15% — Hyd 0.95 South 0.7 North 0.5 heavy 4) SPAM 10%+veto — vague -0.4 ≤3words no qty cap 0.3. Return {score,reason 20w,action BUY|MAYBE|SKIP, personalization}. >=0.7 BUY 0.45-0.69 MAYBE <0.45 SKIP."

Function `scoreLead` tries `gpt-4o-mini` (API live $0.15/$0.60 per 1M, not ChatGPT app) 3× backoff → Zod → fallback `rapidfuzz.partialRatio *0.7+0.2+qtyMod+locMod`. Cost $0.018/100 →₹1.5-3. Switch to `Sarvam-30B/105B` (Maya is translation) via baseURL `https://api.sarvam.ai/v1` 2-line change + re-eval. Eval sweep 0.6 vs 0.7 Precision/Recall/F1 on leads_eval.csv 20 labeled, MAYBE 15-25% else hedgey.

**Words sharpened:** RawIndiaMartPayload vs NormalizedLead vs DecidedLead; priority not score; Boost|Filter|Route not Rule; IdempotencyKey = hash(source+id+mobile+minuteBucket); EnqueueWAAttempt vs WAConfirmed.

---

## 6. Voice — Deleted MVP, Seam Reserved (P1)

If/when after 10 paying +3 beg: Exotel 160 Service 1600-yy-xxxxxx DLT PE+Header+Template + broadcast WA from Oct 1 billable full, Varchas 7.5x. Use call fallback if read absent 8min (webhook read) — Exotel/Kaleyra 20s press 1 to call ₹0.35 + correct handling ₹18. TTS model choice: Bulbul v3 current best-review vs v2 cheaper? verify 29? / note if? So direct consistent.

**Speech design retained:** Exotel → Pipecat ←wss→ Sarvam STT ₹30/hr 22 langs hi-IN/te-IN auto ←→ Sarvam-30B/105B free tier ←→ Sarvam TTS Bulbul v2 ₹15/10K (v3 ₹30 double better reviewed) → Sheets async batch. Port `VoicePort {call}` stub only (no adapter until 2nd real use). Cost 1.5min ₹2.25→70s ₹1.78.

---

## 7. Data Model + Infra (Free, Corrected)

**DB (D1 SQLite 1GB free, not Postgres needing $):** Single table `LeadState {id, dedupKey UNIQUE, decision, attempts, outcome, slaDueAt}` — one place to answer "where is lead 123?" Deletes implicit KV/Queue meta scatter. Add Analytics Engine (primary) + Sheets secondary best-effort via `LogPort {write}` fans out. Dashboard queries AE not Sheets. State persists filters/sidebar.

```prisma
model Seller { id String @id; company String; phone String; catalogText String; imWebhookToken String @unique; glusrCrmKey String?; waPhoneId String?; gmailRefreshToken String?; status String; createdAt DateTime }
model LeadState { dedupKey String @id; leadId String @unique; sellerId String; decision String; outcome String; attempts Int @default(0); slaDueAt DateTime; createdAt DateTime @default(now()); updatedAt DateTime @updatedAt }
// Id handled via D1 UNIQUE constraint for P0-1, not eventual KV
```

**Infra corrected Feb 2026:**
- Workers Free: 100K req/day (10M req+30M CPU-ms paid), KV 100K reads/day +1K writes/deletes/lists/day, Queues 10K ops/day free (Paid $5=1M/mo + $0.40/m extra) +1GB KV, 24h retention free vs 14d paid, 5K msg/s per queue, 250 concurrent
- KV write ceiling at 200/day for 100 leads (dedup+fuzzy) comfortable, watch if scale >few hundred combined
- Sheets Google append 300 read/60 write per project — batch async 5min solves
- Grist-core only if team needs sheet UI ($4 Hetzner), Activepieces MIT only if visual builder needed, fallback pg-boss on Neon free or bunqueue embedded SQLite 630K ops/sec if leave CF

**Env Viewer: 
```
SELLER_TOKENS_JSON={"seller_bj01":"tok_xxx"}
SHEET_ID
GOOGLE_SERVICE_ACCOUNT_JSON
WA_* / OPENAI_API_KEY / SARVAM_API_KEY
SHEET_RANGE=Leads!A:I
```

**Monitoring (before adding voice):** Worker health lastLeadAt+queueDepth+DLQ+LeadState histogram → UptimeRobot + Telegram + alert sla miss >5m via Workers Analytics + alarm.

---

## 8. Build Order (Dependencies Unlock — Staff P0 sequence)

| Day | Task | Unlocks | Why first |
|---|---|---|---|
| **P0-3 Day0** | **2-sec harness** `createTestHarness({InMemoryDedup, InMemoryQueue, FakeWA, InMemoryLog})` → tests duplicate→1 WA, concurrent 50 →0 dup, WA 429→DLQ, harness <2s deterministic CI | Everything — without loop every fix is theory | Staff: build loop before theory |
| **P0-5 Day1** | Extract `decide()` pure 100% table tests | Collapses N×M to N | Delete vs rearrange |
| **P0-1 Day1** | Replace KV with D1 UNIQUE / IdempotencyDO + port DedupPort + harness concurrentInject | Fixes silent duplicate spam | Unknown unknown worst |
| **P0-2 Day2** | Queue DLQ + visibilityTimeout 30s + LeadState attempts + replay CLI | Fixes lost leads | Retry without DLQ = vanish |
| **P0-4 Day2** | LogPort fans Analytics Engine + Sheets best-effort, await AE before ack | Fixes blind 429 | Sheets as only log = silent loss |
| **P0-6 Day3** | WAPort with Result sent|rateLimited|windowClosed|invalid + FakeWA sim 4 | Fixes implicit failure |
| Day1 | WABA+Business Verification+utility template submit (**Day1 2-5d buffer**) | Revenue | Approvals bottleneck |
| 1-2 | Push Worker 200 + Sheet batch append (behind LogPort) | Everything parallel |

**Shard correct:** Reserve seams for Pull `PullPort {fetchIndiaMart}` and Voice `VoicePort {call}` as stub interfaces (no impl). Makes cost honest — 2nd real use pays. Shipped voice only when 3 customers beg.

**Verification before commit (zaid):** Live hyd Worker tail + real Test Push → WA delivered <60s + D1 row + AE metric, skeleton shaped like lead row, reserved height no shift, sibling spacing consistent, single shadcn set, no JSON, no em dash, a11y labels. On ₹8k Android + Jio 4G in Jeedimetla shed, not screenshot. If cannot verify template pending, name that part.

**Env setup:** `npm i -D wrangler @cloudflare/workers-types zod` → `wrangler kv namespace create DEDUP_KV` but prefer `wrangler d1 create lead-state` → `wrangler queues create ...` → `wrangler secret put ...` → `wrangler deploy --env production` (BOM region) → `curl -X POST /webhook/:sellerId?token=` → harness `pnpm test:loop --watch`.

No dashboard, no vector, no voice until 10 paying retain 30d >40%. Floor says 5s ideal, staff says delete, garry says retention > growth.

