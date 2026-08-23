# STACK.md — IndiaMart Lead Speed Engine

Per `think-like-zaid:73` — prefer current versions with stability check. Bun over Node where it earns its keep.

## Runtime
- **Bun 1.3.11** (`bun --version`) — package manager + test runner. Node 24 kept as fallback for wrangler compat.
- **Cloudflare Workers** `compatibility_date 2026-08-21` + `nodejs_compat` flag — V8 isolates, hyd/BOM edge.
- **TypeScript 5.9.3** (`strict: true`, `isolatedModules: true`)

## Platform bindings (free tier Feb 2026 verified)
| Binding | Free | Paid | Note |
|---|---|---|---|
| Workers | 100K req/day | 10M req + 30M CPU-ms | hyd PoP preferred |
| Queues | **10K ops/day** | 1M/mo + $0.40/m | 24h retention free, 14d paid |
| KV | 100K reads / 1K writes+deletes+lists /day, 1GB | — | Fallback only; D1 is primary |
| D1 SQLite | 5GB, 5M rows read / 100K rows written /day | — | Primary dedup + LeadState |
| Analytics Engine | free | — | Primary observability, Sheets secondary |

## Data layer
- **D1 SQLite** `LeadState` table — single source `dedupKey UNIQUE`. No KV eventual on hot path.
- **Google Sheets** append-only via `LogPort` fanout — secondary best-effort, batch 5min, not awaited before 200.
- **Google Sheets API** `300 read / 60 write per project per 60s` — batch solves.

## Validation / Schemas
- `zod 3.23.8` — `RawIndiaMartPayload -> NormalizedLead` fail-fast at edge. No Raw leaks to decide().

## External APIs
- **IndiaMart Push** `form-urlencoded RESPONSE=` or JSON — token `?token=xxx` per seller, no HMAC
- **WhatsApp Cloud API v23.0** (bump to v25.0 on deploy — v23 expired Jun 9 2026, current v25 per Meta docs). Utility ₹0.115, Marketing ₹0.8631, free inside 24h window until Sep 30 2026 then billable.
- **OpenAI gpt-4o-mini** `$0.15/$0.60 per 1M` — API live, ChatGPT app sunset does not affect. Sarvam-30B/105B via `https://api.sarvam.ai/v1` as fallback (Mayura is translation, not chat).
- **Sarvam STT ₹30/hr / TTS Bulbul v2 ₹15/10K (v3 ₹30)** — if voice re-enabled.

## Tooling
- **wrangler 4.125.0** — `bunx wrangler dev/deploy`, `bunx wrangler types`, `bunx wrangler d1 create`, `bunx wrangler kv namespace create`
- **vitest 4.1.11 + @cloudflare/vitest-pool-workers 0.22.0** — loop harness <2s deterministic
- **prettier 3.4.2** — format, no eslint for MVP (add `eslint 9` after 10 paying)

## Conventions
- One icon set if UI added later: **Remix Icons** (zaid default where nothing installed). No second set.
- Components from `shadcn/ui` stock only. No hand-rolled. No cards-in-cards, no shadows/glassmorphism.
- Reference: **Linear** for leads table, **Vercel** for marketing 1-pager. Match restraint, not decoration.
- Region: `BOM` (Mumbai) for IndiaMart DC proximity, save 400ms. hyd alias for Workers.
- Data layer: server state through single D1/Queue; no ad-hoc fetch per surface.

## Stability check
- Bump TS `5.5 -> 5.9` earned (this change needs it). Not bumping wrangler major inside unrelated review.
- Bun over Node chosen because this change *is* the work (new repo, no team operates it yet). If enterprise team operates later, Node stability outranks.

## Commands (Bun official)
```bash
bun install
bun run dev        # hyd/BOM edge local
bun run test       # vitest
bun run test:loop  # 2-sec harness
bunx wrangler d1 create lead-state
bunx wrangler kv namespace create DEDUP_KV_FALLBACK
bunx wrangler queues create leads-queue
bunx wrangler queues create leads-dlq
bun run cf-typegen
bun run check      # tsc --noEmit
```
