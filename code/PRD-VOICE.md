# PRD: Voice AI Fallback System
**Product:** IndiaMart Lead Speed Engine — Voice Module
**Version:** 1.0 | **Status:** DESIGNED, NOT BUILT
**Trigger to build:** See §1 Go/No-Go Gates
**Owner:** Founder

---

## 1. Go/No-Go Gates (ALL must pass)

| # | Gate | Metric | Threshold | Measured how |
|---|---|---|---|---|
| G1 | Sellers asked | Unprompted requests for voice/call fallback | ≥3 of 10 active | Call notes / WhatsApp log |
| G2 | Speed engine retained | 30-day cohort retention (paying + sent ≥1 WA in last 7d) | >40% | D1 query `lead_states` |
| G3 | Revenue threshold | MRR from Base+Recovery tier | >₹15,000 | Razorpay/UPI ledger |
| G4 | WA open rate ceiling | % leads where owner opened WA within 10 min but didn't act | >30% | WA delivery/read webhook data |
| G5 | IndiaMart Push tier confirmed | Gold seller has Push API access | Yes (verified live) | Seller screen share |

If any gate fails → voice stays deleted. Revisit next quarter.

---

## 2. Problem Statement

IndiaMart pump dealers in Balanagar-Jeedimetla miss hot leads because:
1. Owner is on the factory floor or driving — can't check WhatsApp
2. WA notification arrives but owner doesn't open it (notification fatigue)
3. Buyer calls 4-5 sellers simultaneously; first to *speak* (not text) wins the trust call
4. 22:00–07:00 enquiries sit until morning digest; buyer may have purchased by then

Voice bridges the gap between "delivered" and "acted upon" — a 20-second AI call that says *"Sir, hot pump enquiry, press 1 to connect"* converts passive awareness into action.

---

## 3. Solution Overview

```
Lead arrives → decide() routes wa_now → WA template sent
                                          │
                                    Wait 8 minutes
                                          │
                              Owner opened WA? (read receipt)
                                    │           │
                                   YES         NO
                                    │           │
                               Stop (done)   VoicePort.call()
                                              │
                                     Exotel 160 series
                                              │
                                Sarvam TTS: "Namaste [Owner], hot lead..."
                                              │
                                     Press 1 → connect to buyer's mobile
                                     No response → retry once after 30 min
```

Not an AI conversation agent. A **one-shot notification bridge** with DTMF routing.

---

## 4. User Stories

| # | As a | I want | So that | Priority |
|---|---|---|---|---|
| U1 | Pump dealer owner | Get a phone call when a hot lead arrives and I haven't opened WA in 8 min | I don't lose deals while working on the floor | P0 |
| U2 | Pump dealer owner | Press 1 to instantly connect to the buyer | Zero-friction callback without opening any app | P0 |
| U3 | Pump dealer sales staff | Receive the voice call if owner doesn't answer in 2 rings | Backup coverage during lunch/travel | P1 |
| U4 | Pump dealer owner | Set quiet hours when I don't want voice calls | Not disturbed at night | P0 (inherited from decide()) |

---

## 5. Technical Architecture

### 5.1 Stack

| Layer | Technology | Cost per call (1.5 min avg) |
|---|---|---|
| **Telephony** | Exotel 160-series Service number | ₹1.35 (₹0.90/min × 1.5) |
| **TTS** | Sarvam Bulbul v2 (hi-IN, te-IN) | ₹0.06 (~400 chars @ ₹15/10k) |
| **STT** | Sarvam Saaras v2 (for DTMF confirmation only) | ₹0 (DTMF, no speech needed) |
| **LLM** | None — pre-recorded script, not conversational | ₹0 |
| **Orchestration** | Cloudflare Workflows (durable, resumable) | ~₹0.09 amortized |
| **Total** | | **~₹1.50/call** |

### 5.2 Why Exotel (not Twilio/Bolna/Vapi)

| Factor | Exotel | Twilio | Bolna/Vapi |
|---|---|---|---|
| TRAI compliance | Native DLT PE+Header+Template UI | Self-manage DLT | Not TRAI-compliant |
| 160-series number | ✅ Service route, bypasses NCPR | ❌ Only 140 promo | ❌ N/A |
| Per-minute cost (India) | ₹0.85–1.00 | $0.014 (~₹1.18)+GST | $0.06–0.14 (~₹5–12) |
| WebSocket media stream | ✅ ExoML `<Stream>` | ✅ Media Streams | ✅ Built-in |
| Setup time | 7 days (DLT approval) | 14 days (DLT via partner) | Instant but illegal |

### 5.3 Why Sarvam Bulbul v2 (not v3/ElevenLabs)

| Factor | Bulbul v2 | Bulbul v3 | ElevenLabs |
|---|---|---|---|
| Cost | ₹15/10k chars | ₹30/10k chars | $0.30/1k chars (~₹25/10k) |
| Hinglish quality | Good | Better | Best but expensive |
| Telugu support | ✅ Anushka voice | ✅ Improved | Weak |
| Latency (streaming) | <250ms | <200ms | ~500ms from US |

v2 wins for MVP: half the cost, adequate quality, both languages covered.

### 5.4 Why NOT a conversational AI agent

| Conversational agent | One-shot notification bridge |
|---|---|
| ₹5–12/min (LLM + STT + TTS per turn) | ₹1.50 total (one TTS render + telephony) |
| Hallucination risk on price/specs | Pre-approved script, zero hallucination |
| 30s+ latency per turn | Instant playback (<250ms) |
| Needs prompt engineering per seller | Same script for all sellers |
| Complex state machine | Simple: play → wait DTMF → route |
| Sellers distrust AI talking to buyers | Seller hears notification, seller talks to buyer |

**Decision: one-shot notification with DTMF routing. Never let AI talk directly to the buyer.**

---

## 6. Call Flow (State Machine)

```
IDLE → TRIGGERED (WA read absent after 8 min)
     → DIALLING (Exotel API POST)
        ├─ BUSY → wait 2h → retry (max 3 attempts total)
        ├─ NO_ANSWER → wait 2h → retry
        └─ ANSWERED
           → PLAY_INTRO (Sarvam TTS, 10 sec)
             "Namaste {owner_name}, {company} se AI assistant bol raha hai.
              Aapke liye ek hot {product} enquiry aayi hai.
              Baat karne ke liye 1 dabaiye. Skip karne ke liye 2 dabaiye."
           → WAIT_DTMF (timeout 8 seconds)
              ├─ PRESS_1 → CONNECT_BUYER (bridge to buyer's mobile)
              │            → Log outcome='connected'
              ├─ PRESS_2 → SKIP → Log outcome='skipped'
              ├─ TIMEOUT → RETRY_PROMPT (play again once)
              │             → still timeout → HANGUP → Log outcome='no_response'
              └─ INVALID_KEY → REPLAY_PROMPT (max 2 times)
           → CALL_ENDED → Log duration + outcome to Analytics Engine + Sheets
```

### Disclosure requirement (TRAI IT Rules 2026 draft)

First 3 seconds MUST include: *"Main ek AI assistant bol raha hoon"* — non-negotiable legal requirement.

---

## 7. Data Model Changes

```sql
-- New table: voice_calls
CREATE TABLE IF NOT EXISTS voice_calls (
    id TEXT PRIMARY KEY,
    lead_dedup_key TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    exotel_call_sid TEXT,
    to_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued'
        CHECK (status IN ('queued','dialling','answered','connected','skipped',
                          'no_answer','busy','failed','cancelled')),
    attempts INTEGER NOT NULL DEFAULT 0,
    duration_sec INTEGER,
    dtmf_response TEXT,          -- '1' | '2' | null
    recording_url TEXT,
    triggered_at_ms INTEGER NOT NULL,
    answered_at_ms INTEGER,
    ended_at_ms INTEGER,
    created_at_ms INTEGER NOT NULL
);

CREATE INDEX idx_voice_seller_time ON voice_calls (seller_id, triggered_at_ms);
CREATE INDEX idx_voice_lead ON voice_calls (lead_dedup_key);

-- Alter lead_states: track voice status
ALTER TABLE lead_states ADD COLUMN voice_call_id TEXT;
ALTER TABLE lead_states ADD COLUMN voice_triggered INTEGER NOT NULL DEFAULT 0;
```

---

## 8. API Design

### 8.1 Trigger endpoint (internal, called by queue consumer)

```
POST /internal/voice/trigger
Authorization: Worker internal service binding
Body: { leadDedupKey: string, sellerId: string }
Response: { callId: string, status: 'queued' }
```

Called after WA send succeeds. Sets a timer via CF Workflows:
- Step 1: `step.sleepUntil(createdAt + 8*60*1000)` — wait 8 min
- Step 2: Check WA read receipt (`wa_messages.read_at_ms IS NOT NULL`)
- Step 3: If not read → `VoicePort.call()`

### 8.2 Exotel webhook (callback from Exotel)

```
POST /webhook/voice/exotel
Headers: X-Exotel-Signature (HMAC verification)
Body: { CallSid, Status, Duration, DtmfDigit, RecordingUrl }
```

Updates `voice_calls` row + emits Analytics Engine event.

### 8.3 Dashboard endpoint

```
GET /api/voice/:sellerId/recent?limit=20
Response: [{ id, leadId, productName, status, duration_sec, triggered_at_ms }]
```

---

## 9. Compliance Checklist (TRAI + DPDP)

| # | Requirement | Implementation | Penalty if missed |
|---|---|---|---|
| C1 | DLT Principal Entity registration | Register on Jio/Airtel/Vi DLT portal (₹5,500 one-time) | ₹10K–50K/violation |
| C2 | Header registration (160-series) | 6-char header via Exotel dashboard | Header block |
| C3 | Template registration (voice script) | Exact-match script on DLT portal | ₹10K/call mismatch |
| C4 | NCPR scrub before dial | Exotel auto-scrub toggle ON | ₹5K/NCPR violation |
| C5 | Calling window 9AM–9PM IST | Hard gate in Workflows scheduler | ₹10K/off-hours call |
| C6 | AI disclosure in first 3 sec | Script starts with "AI assistant bol raha hai" | Legal exposure |
| C7 | Consent proof stored | IndiaMart enquiry timestamp + IP logged | DPDP Act ₹250Cr fine |
| C8 | Max 3 attempts per lead, 24h gap | Counter in `voice_calls.attempts` | Harassment complaint |
| C9 | Opt-out honour ("STOP") | Immediate DNC list update, never call again | TRAI blacklist 2 years |
| C10 | Call recording disclosure | "Ye call record ho rahi hai" in intro | DPDP consent violation |

---

## 10. Cost Model

### Per-call breakdown

| Component | Rate | Avg usage | Cost |
|---|---|---|---|
| Exotel telephony | ₹0.90/min PAYG | 1.5 min | ₹1.35 |
| Sarvam TTS (Bulbul v2) | ₹15/10k chars | ~400 chars | ₹0.06 |
| Infrastructure (CF Workers + Workflows) | Free/Paid | amortized | ₹0.09 |
| **Total per call** | | | **₹1.50** |

### Monthly projection at scale

| Scenario | Leads/mo | Voice calls (30% fallback) | Voice cost | Revenue impact |
|---|---|---|---|---|
| 1 seller | 60 | 18 calls | ₹27 | +1 extra deal = ₹10–80k margin |
| 10 sellers | 600 | 180 calls | ₹270 | +10 deals |
| 25 sellers (₹1L MRR) | 1500 | 450 calls | ₹675 | +25 deals |

**Fixed costs:**
- Exotel 160-number rental: ₹1,500–2,500/mo (shared across sellers)
- DLT PE registration: ₹5,500 one-time
- Total fixed: ~₹2,000/mo + ₹5,500 one-time

**Break-even:** 2 extra deals/month covers all voice infrastructure.

---

## 11. Pricing Impact

| Tier | Without voice | With voice add-on |
|---|---|---|
| Base+Recovery | ₹999 +12% recovered | +₹999/mo voice pack |
| Included calls | — | 100 calls/mo (₹1.50 each = ₹150 COGS) |
| Overage | — | ₹2/call |
| Margin | 92% | 85% (voice pack) |

Alternative: include 50 free voice calls/mo in Base tier at ₹1,499 flat (up from ₹999).

---

## 12. Build Plan (When Triggered)

### Sprint 1 (Week 1–2): Telephony foundation
| Day | Task | Done when |
|---|---|---|
| 1–2 | DLT PE registration on Jio/Airtel portal | PE ID received |
| 3–4 | Exotel account + 160-number purchase + header registered | Test call works |
| 5–7 | Voice template submitted on DLT (exact match required) | Template approved |
| 8–10 | `VoicePort` adapter: Exotel API client + Sarvam TTS integration | Unit tests green |
| 11–14 | CF Workflow: 8-min timer → read-check → trigger voice | Integration test: simulated flow passes |

### Sprint 2 (Week 3): Production wiring
| Day | Task | Done when |
|---|---|---|
| 15–17 | Exotel webhook handler + signature verify | Real test call updates D1 |
| 18–19 | Dashboard: voice calls tab + timeline | Seller sees call history |
| 20–21 | Compliance: NCPR scrub, calling window, opt-out handling | Checklist §9 all green |
| 22 | Load test: 50 concurrent triggers | No dropped calls, SLA met |

### Acceptance criteria
- [ ] Hot lead → WA sent → 8 min unread → phone rings in <30 sec
- [ ] Press 1 connects to buyer in <5 sec
- [ ] AI disclosure audible in first 3 seconds
- [ ] Quiet hours respected (no calls 22:00–07:00 IST)
- [ ] Max 3 attempts per lead, 24h cooldown
- [ ] All calls logged to `voice_calls` + Analytics Engine
- [ ] Dashboard shows voice call history per lead

---

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| DLT approval delayed >14 days | Medium | Blocks launch | Start DLT day 1, build in parallel |
| Exotel rate limits at scale | Low | Missed calls | Queue-based throttling, batch sends |
| Sarvam TTS quality poor in Telugu | Medium | Bad UX | Fallback to English-only script, A/B test |
| Sellers report AI calls as spam | Low | TRAI penalty | Disclosure + opt-out + frequency caps |
| WA read receipts unreliable | Medium | Unnecessary voice calls | Use delivered + 8min timer as baseline |
| Buyer's number not reachable by voice | Medium | Wasted call | Check `SENDER_MOBILE` validity before triggering |

---

## 14. Success Metrics

| Metric | Target (30 days post-launch) | Source |
|---|---|---|
| Voice trigger rate | ≤30% of total leads (not too many) | `voice_calls` count |
| Answer rate | >60% | `status IN ('answered','connected','skipped')` |
| Press-1 connection rate | >40% of answered | `dtmf_response = '1'` |
| Extra deals attributed to voice | ≥2/month across cohort | Attribution link (V2 feature) |
| Cost per connected call | <₹3.00 | Total voice spend / connected calls |
| Seller satisfaction (WA survey) | ≥4/5 | Post-week pulse |

---

## 15. What We Are NOT Building

| Explicitly out of scope | Reason |
|---|---|
| AI conversational agent talking to buyers | Hallucination risk, ₹5–12/min cost, seller distrust |
| Multi-language TTS beyond hi/te | YAGNI — Balanagar speaks Hindi/Telugu |
| Speech-to-text for buyer responses | One-shot DTMF, not conversational |
| Custom voice cloning per seller | ₹50k+ setup, zero validated demand |
| Voice broadcast/marketing calls | Different product, different compliance regime |
