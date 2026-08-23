# IndiaMart Lead Speed Engine — Plan v2.2 (Pumps Wedge, Balanagar-Jeedimetla)

**One-liner (unchanged):** Done-for-you 45-second WhatsApp reply for Gold industrial pump sellers in Balanagar-Jeedimetla (11-25 emp, ₹5-25Cr) who pay IndiaMart ₹60k/yr, lose 2 deals/mo to 4.5hr manual reply, and leak 30% credits to fake retail leads — for **base + recovery share** on their own number, with credit-recovery as wedge.

**Base:** Hyderabad, ₹0-10k budget, solo full-time, survival in 14 days.  
**Date:** 21 Aug 2026 | **Lenses applied:** think-first-principles + staff-engineer + garrytan + zaid + thdxr/rauchg/karpathy (installed via `zaidmukaddam/skills` 20 skills) + heavy OSS/market research 22 evidence items

> v2.1 validated per your review 20 Aug (pilot timing, WA cost, Queues, dedup race, Prisma, v23, Sarvam). v2.2 applies 5-agent audit to **fill gaps, correct metric, and fix business survival math** before you commit next 2 weeks. No rebuild — handful of specific fixes.

---

## 0. What v2.1 Got Right (keep)

- Wedge: Pumps numeric specs (HP+Flow+Head) walkable every 100m Balanagar — holds.
- Stack: Cloudflare Workers hyd 40-90ms, free, zero ops — holds (now validated Queues 10K/day free Feb 2026).
- Delete Voice/Pull/Dashboard for MVP — holds.
- Credit-saver as ROI wedge — holds and strengthens.

## 0.1 What 5 Lenses Killed (remove before building)

| Lens | Killed Convention | Why | Replace With |
|---|---|---|---|
| **first-principles A4** | `WA <60s` as SLA | Inherited US myth. Industrial buyer expects call <15min, WA is supplement. Floor is 1.5s, SLA 60s is 40× slack | Quiet-hours digest 08:05, SPAM silent |
| **first-principles A5** | 5km Balanagar-Jeedimetla geo-filter as product filter | Buyer in Nagpur queries Bharat pump → Hyd seller gets it. Density ≠ moat | Keep corridor as **GTM walk street**, filter on **SKU intent (pump spec)** not pincode |
| **first-principles A6/A7** | Sheets as system of record + manual scoring queue | Toil, 200ms hot-path + 429 risk. 5-line rule covers 80% | Rule score inline, batch Sheets export async |
| **garrytan G-1** | Metric `1 extra close/mo` as North Star | Lagging, high-variance, you control <15%. Need 50+ customers to detect | **Primary: Net Credit ROI = (recovered - cost)/cost at 30d cohort**. Leading: % contacted <5min |
| **garrytan G-3** | MRR/logo count as retention | Leaking bucket hidden | Cohort: sellers onboarded same week in corridor, retained = paying + sent ≥1 WA via engine in last 7d |
| **garrytan G-8** | Moat = speed/credit bypass (3-yr arbitrage) | IndiaMart *is* funded beneficiary — credits burn is revenue. They will counter | Moat = 7-yr **WA response graph + ranking data** that compounds per lead. Credit-saver is wedge feature, not moat |
| **zaid Z-2** | Claim you can *prevent* credit burn pre-deduction | Unverified — credit deducted on assignment vs view unknown | Primary-source spike: read IndiaMart Seller Panel Lead Manager + PNS docs, verify can you prevent or only flag post-burn |
| **zaid Z-4** | 3 moats at once (credit + Brain + rank) | Shipped 3 products where 1 proves retention | Ship **Speed Engine only** (GMT→WA digest) v1. Delete Brain/rank until 30-day cohort >40% |

---

## 1. Real Objective (corrected)

**Not:** "add automation". **Objective:** Put **₹1,500-1,950/mo back in seller's wallet in 7 days** from 15 junk leads recovered, plus prove speed value. Metric: `Net Credit ROI per cohort at 30d` and `₹ recovered`. Secondary: `% good leads contacted <5min`.

| Metric | Proves | Latency | Owner | Verdict |
|---|---|---|---|---|
| 1 extra close/mo | seller loves you | 30-60d, variance ±₹10k | Seller | **Lagging — keep as self-report quarterly, don't sell/price on it** |
| % contacted <5min | you did job | minutes | You | Good operational, not value |
| **₹ recovered / ₹ wasted avoided** | **direct cash** | **2-7d deterministic ledger** | **You (if auto-prove)** | **PRIMARY** |

**Math:** Pump credit ₹80-130 (Rate Card capital goods). 80-120 leads/mo = ₹8k-14k spend. ~35-45% junk (students, job seekers, `+91` missing). Recover 15/mo = ₹1,500-1,950 → already Lite price. 1 extra close at 5% close ₹45k ASP = ₹2,250 EV ±10k. Seller feels ₹1,800 wallet tomorrow > probabilistic ₹2,250 next month.

Floor recomputed (bracketed, labelled estimates):

| Line | Best | Worst | You budgeted |
|---|---|---|---|
| Compute (100 leads ×128MB×200ms) | ₹35 (CF Worker free) | ₹250 (Lambda+Gateway) | ₹500 |
| WA Cloud 1 template/lead | ₹0 if Utility in CSW free tier | ₹72 (100×₹0.72 marketing) | — |
| IndiaMart marginal | ₹0 (seller already pays ₹3k membership) | ₹0 | ₹0 |
| TOTAL floor/mo | **₹35-65** | **₹280-350** |  |
| Off-shelf Pabbly ₹999 + WATI ₹1,799 | — | **₹2,870** | Dominant is rent, not compute |
| Your Lite ₹1,999 vs floor | **30-57×** best, **5-7×** worst | Gap is rent+ops, not infra |

Lite on Pabbly+WATI: `1,999-2,870 = -₹871` loss. Pro: 28% margin. Scale only works. Custom inverts margin (96.7% best, 85.6% worst) but adds **ops time floor 155-215 min/seller/mo manual (scoring 75min + Sheets fix 50min + WA health 30-90min)** vs **<5min automated** (rule + batch + no Sheets). At 20 sellers manual = 60 hrs/mo = 1.5 FTE = ₹24k/mo at ₹400/hr wipes Lite. Bottleneck is human attention, not infra.

---

## 2. Exact ICP (Narrowed for Love Test)

> **Gold + TrustSEAL pump dealer, 5-15 employees (not 11-25), 20-60 IndiaMart leads/mo who manually forward GMT missed calls to WA**, Balanagar-Jeedimetla walk street, owner picks call. 60% use personal WA not Business (verify — gating 3-7d GST proof).

**Why 5-15 not 11-25:** GarryTan small-group love test — "would 5 be angry if you shut down tomorrow?" Pumps 200+ sellers ranging 3-man traders to 50-man manufacturers opposite workflows. 5-15 manually forwarding GMT→WA is love-able, 10 design partners not 50 beta.

**Need first-hand:** Founder shadows 20 GMT calls in Balanagar, record time-to-first-WA today (likely 4-12 hrs), credit waste reasons verbatim. No hiring field ops until founder can do job manually 2 weeks.

**Anti-ICP:** Chemicals 100g, fabrication gates, machinery 20 cats, water 1MLD (60-180d), solar 3kW rural, Silver/Free (<15 leads), Platinum (enterprise buying center).

**TAM correction (heavy research):** Jeedimetla 1,500 units spans pharma/chemicals/plastics/electrical/machine-tools. Pumps slice on JustDial 383 pump manufacturers in Jeedimetla Village includes traders. **Real IndiaMart-active pump dealers likely 80-150, TrustSEAL <15%**, not 1,500. Need 2-day field scrape of `dir.indiamart.com/hyderabad/submersible-pumps.html` with login vs YellowPages proxy. Don't budget on 1,500.

To ₹1L: 25×₹3,999 = ₹99,975 but at 10 leads/mo (low season) Lite ₹1,999 = ₹200/lead > credit ₹100 → churn. Hence **Base+recovery pricing** below.

---

## 3. Offer & Pricing (corrected to value metric)

**Anchor:** Gold ₹60k/yr = ₹5k/mo. Effective contacted lead ₹800-1,500 (shared 3-10 sellers, not 3-5). Your fee feels like another IndiaMart unless <₹2,500 entry.

**Rebuilt offer (sell, not 3 tiers by seats — validated 21x/7x/78% speed still true but must beat other AI replies, not just human delay):**

**Pricing tied to value (first-principles):**
- **Base ₹999/mo + 12% of recovered credits (min ₹1,499 cap ₹4,999)** — aligns to cash returned. At 10 leads/mo low volume seller pays ₹999+ small vs flat ₹1,999 Lite that was `₹50/lead` > credit itself. At 120 leads with ₹1,800 recovered you earn ₹999+216=₹1,215 net +₹585 plus speed value → retention.
- Lite flat ₹1,999 retained only as **annual prepay** option.
- Scale anchor vs Pro: keep for framing but sell Base+recovery first.

**Keep tiers for comparison but change primary:**

|  | Lite (annual prepay) | **Base+Recovery [SELL FIRST]** | Scale |
|---|---|---|---|
| Headline | ₹1,999/mo or ₹19,990/yr | **₹999 +12% recovered (min ₹1,499 cap ₹4,999)** | ₹7,499/mo |
| Inbox | 1 Gmail | up to 3 | 10 |
| WA | Instant <60s YOUR number (Utility transactional only) | +Day2 follow-up digest 08:05, quiet-hours batch 22:00-07:00 | multi-number rotation |
| Voice | — | Call fallback if not opened in 8min (₹0.35) | +IVR |
| Recovery | Manual view | **Auto proof + filing T+2h, weekly PDF "₹X recovered, Y hot, avg 4.2min"** | same |
| Support | Email | Founder WA 6h, sheets export async | Priority |

**Survival math added (GarryTan):** Field visit cost ₹400-600 kills Lite margin if CAC >3 months. Rule: **If CAC payback >4 months for 2 consecutive cohorts, freeze field, cut Lite, force self-serve. If 2 bad months, payroll freeze.** No rule = entropy. Churn seasonality: pumps pre-monsoon peak — monthly sub churns off-season, need **annual prepaid or UPI autopay/eNACH with pause/credits**, not monthly postpaid. Recordent: avg overdue 73 days, 3.83cr >360d, 82% pay beyond terms, Telangana MSEFC 2920 cases ₹765cr pending — postpaid SaaS fails.

**Pilot (first 3, Hyderabad, expires 7d, after WA approved):**

> **₹999 Pilot Week** — 15 leads, Base+Recovery live 48h after approval (clock starts after, not Day1). Miss <5min twice → refund. Pilot fee credited to Base. WA live-test ("Mail pampandi") Loom-only until approved Day 3-4.

**Willingness test (10 Gold):** (1) At ₹999+12% for 60 leads WA+voice still consider? (2) At ₹1,999/30 WA-only? (3) Too cheap? Too expensive? (4) If ₹1,800 recovered + speed, is ₹1,499-2k clear yes? Log verbatims.

**Close reworded:** "You're paying ₹5k to buy then losing 78% to first responder. With 15 junk recovered ₹1,800 + speed, net +₹300 even before extra deal. ₹39 overage was seat-think — now pay from recovered."

---

## 4. Product Scope (Delete-Before-Complicate)

**Deep module:** `onNewLead(post)→replied_in_45s?` Remove manual scoring queue, Sheets from hot path, geo-filter, <60s spam ping.

**Rebuilt smallest thing (80 LOC):**
```
IndiaMART Push → Worker (dedupe by GLUSR_ID, rule score 5 lines, quiet-hours check 22-07 batch 08:05)
              ├─ HOT/WARM → WA Cloud Utility template to owner (2s) + CRM note async
              └─ SPAM (35-45%) → skip WA, silent log + auto refund draft filed at T+2h via API
                            └─ async batch: D1/Sheets export, digest
```
Add voice as **fallback**: not read in 8min (webhook read absent) → Exotel 20s "You have hot pump lead, press 1 to call" ₹0.35 (matches how they work, not AI chat).

**Move:** Ingest to BOM edge (IndiaMart DC Mumbai) save 400ms, batch Sheets writes async 5min, pre-register 3 templates (HOT/WARM/SPAM) once.

**KEEP Day14 MVP:** Push Worker 200 <100ms, dedup GLUSR_ID + phone+10min, batch Sheets export async (no read on hot path), rule score (HOT if pump+HP/kW/GPM/capacitor and len>40 or call_duration>0 else SPAM if project/college/ppt or len<10), WA Utility (transactional `Qty? city? timeline?` — promo words = marketing 7.5× cost tightened Jul 2025), poll reconciler `GET /crm/v2/leads` every 5min to catch silent Push drops, quiet-hours digest, Sheets as weekly CSV export only.

**Manual for first 10:** Catalog 5 names+price copy-paste 10min, template submit per seller, voice = WA ping call now, onboarding 15min paste webhook, UPI QR, 1 WA group 2h SLA.

**Tiers:**
*MVP Day14:* above 6 → <60s p95 (rule, not GPT) → ₹999 pilot (after WA approved)
*V1 Day30:* 2nd WA digest + round-robin + Form catalog + UPI autopay/eNACH
*V2 Day60:* Pull cron full + Next.js read-only D1 + voice only if 3 beg + feedback loop + attribution `WA message_id → GLUSR_ID → closed deal` link missing in v2.1

---

## 5. Moat (Corrected for 7 Years)

Incumbent already ships free speed: `60% of seller messages are Suggested Replies` + `IM Insta 3x responsiveness` inside LMS. Speed moat expires in 5 weeks when they copy. **Credit-saver arbitrage expires when IndiaMart throttles bypass.**

**Funded beneficiary named:** 1) IndiaMART itself (junk PNS credits = revenue), 2) PNS ops telecallers, 3) low-effort sellers benefiting when serious are slow. You need counter: what happens when IndiaMart blocks bypass? Answer: build **replacement distribution** buyers prefer (WA catalog) rather than critiquing incumbent (GarryTan build replacement).

**Narrow moat to 1 (delete 2):** Ship **Speed Engine only** v1. Delete Seller Brain/rank until 30-day cohort >40% on speed alone (Zaid). Re-add ranking only with eval. Lock reference **Linear for leads table, Perplexity for transcript** — match density/spacing/Inter, no violet gradient, single icon set (Remix or Lucide), shadcn only, no cards-in-cards, skeleton not spinner, state persists.

**30/60/90 with outcomes:**
*0-30d:* Earn trust with cash — audit 2 weeks free, Sheet Credit Saver, Fri KAM mail, 60min Brain? No — *shadow 5 shops manually via Pabbly free route* as cheapest test (see §7).
Metric D30: **30-day cohort retention** defined as paying + sent ≥1 WA in last 7d (not MRR)
*31-60d:* Own workflow — Quote-to-Cash WA with DLT-registered templates, inventory rule `Stock=No → 7d 30% adv`
*61-90d:* Switching costs — 60-90d history, voice templates, weekly Rank + shared blacklist. If retention <40% after 30 sellers, wedge wrong — don't add AI, pick narrower ICP.

**Time horizon:** Patience is moat at 7 years — WA response graph + ranking data compounds per lead, not credit bypass.

---

## 6. GTM — 20 Quality Touches, First-Hand, Verified in Shed

**2 channels only:** Call→Instant WA 70% (35-43% Hyd connect, Loom-only until WA approved), Field Tue/Thu 30% 3× close. Kill email/IM chat primary.

Golden window 10:30-1:00 IST (10-11am best WA). Never >15 identical WA/15min. 2 phones Jio/Air+WA <40/day.

**Scripts unchanged but live-test gated:** Field SOP 7-12 Demo now "Play Loom; live-test ONLY after WA approved Day3-4". Week table fixed: Mon-Wed Loom-only demos, earliest pilot Thu/Fri after WA.

**Backups if blocked:** Google Maps 20/day, JIA P-27/D Ph III 040-23095565 President 9848152432 400+ mobiles PDF, BMSIA, FTCCI.

**New arbitrage to test:** 72-hr free entry point from Click-to-WA ads remains free after Oct 1 for all categories. Pump CTWA CPL may be ₹18-24 vs BuyLead ₹80-130 on Maximiser — test acquisition mix vs IndiaMart.

**BSP margin:** Interakt 12.4% markup, WATI ~20% auth+257%, Whautomate zero. At 10k marketing msgs 20% = ₹1,726/mo extra vs zero — choose on `effective ₹/marketing msg` not sticker.

**Week1 fixed:** Earlier table had Tue 1 pilot before WA — corrected to Loom-only until approved, pilots Fri/Sat.

---

## 7. Cheapest Test Before Code (48h, ₹0) — Do This First

**#1 Shadow 5 shops manually (GarryTan first-hand + Zaid verify in running shed):**

1. Ask 5 Balanagar sellers for read-only Lead Manager or forward IndiaMart email, or give you Push URL whitelisting. Or forward GMT email.
2. Create **Pabbly free route**: Webhook → Filter (spam rule 5 lines) → WATI sandbox WA + Google Sheet async (batch). 90min.
3. For every lead you also do manual 60s WA to owner and record: `lead_id, rule score vs manual, WA delivered/read, owner replied?, credit refund filed? (manual proof)` + call outcome.
4. After 7 days compute per shop: `Leads, % SPAM, % contacted <5min (you vs baseline), ₹ recovered (file 5 refunds test), WA open rate`.

Cost ₹0 +4hr setup+20min/day. **Gate before Worker code:**

- If SPAM 40%+ and WA open <35% but call pickup 70% → kill WA-primary, pivot to call+refund.
- If ₹ recovered >₹1,500 week → price on recovery (Base+12%).
- If rule vs manual agree >80% → delete manual scoring permanently.
- If 3/5 refuse WA Business verification → GTM block, not product block.

**#2 Measure 100 historic leads:** Pull CSV from Lead Manager, run spam rule, measure WA deliverability if you'd sent, close vs score. 2hr python.

**#3 Spike Worker only if #1+#2 pass:** 80-line Worker dedupe+rule+WA+poll reconciler to BOM, benchmark p95.

**Gaps this catches:** WA ban risk (stop reply without handling = block flag), duplicate masked `+91-XXXX` numbers, quiet-hours mute, no attribution link, no fallback SMS, Sheets quota, churn seasonality, GST invoicing, support load (template rejections/password resets =70% tickets Y2).

---

## 8. Survival Math & Kill Gates

Monthly SaaS 73-day avg overdue proven Telangana (Recordent 1.1 lakh MSMEs, MSEFC 2920 cases ₹765cr). **Sell annual prepaid or UPI autopay/eNACH with auto-pause.**

Kill pivot Kukatpally water lane same engine if: >50% <10 leads/mo, ≥7/10 <5min already, 0/12 willing ₹999 pilot, median latency >5min + no Push, >5hr/week tuning, reply <25% personalized.

Cohort retention <40% at 30d after 30 sellers → wedge wrong, don't add AI.

---

## 9. Next 14 Days (corrected)

Tomorrow 9am: Start #1 shadow (don't code), scrape 20 Gold pumps Balanagar-Jeedimetla for count (TrustSEAL ratio), submit WABA+template **Day1** (2-5d clock), deploy Worker late Week1 only if #1 passes. Wed 10:30 calls Loom-only until WA approved.

Day14 goal: 1 cohort of 5 shadow shops with measured ₹ recovered + contact <5min vs baseline, or clear kill to pivot.

**Files:** `plan.md` + `technical.md` (this + next). Verify on ₹8k Android + Jio 4G in shed, skeleton not spinner, shadcn only, no raw JSON.

