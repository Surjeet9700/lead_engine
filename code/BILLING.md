# BILLING.md — IndiaMart Lead Speed Engine
**Payment system for Indian MSME sellers | Razorpay + UPI AutoPay + GST invoicing**

---

## 1. Payment Architecture

```
Seller clicks "Subscribe" on /onboard
    │
    ▼
Razorpay Checkout (UPI AutoPay mandate)
    │  Seller approves ₹999/month UPI mandate in their UPI app
    │
    ▼
Razorpay fires webhook: subscription.charged
    │
    ▼
Worker POST /api/billing/webhook/razorpay
    ├── Verify HMAC signature (razorpay_signature)
    ├── Upsert subscriptions table (status=active, plan, next_billing_at)
    ├── Generate GST invoice → store in invoices table
    └── Send WhatsApp confirmation to seller

Payment failure flow:
Day 0: subscription.failed → WA notification to seller
Day 3: retry charge → if fail again → email reminder
Day 5: service pause (leads still ingested but no WA sent)
Day 7: auto-cancel subscription → status=cancelled
```

---

## 2. Razorpay Plan Configuration

| Field | Value |
|---|---|
| Plan name | Lead Speed Engine — Base |
| Billing cycle | Monthly |
| Amount | ₹999.00 (99900 paise) |
| Currency | INR |
| Trial period | 7 days (₹999 pilot week credited) |
| Notes | `{ gst_applicable: true, hsn_code: "998313" }` |

**Additional plans:**

| Plan ID | Name | Amount | Cycle |
|---|---|---|---|
| `plan_base_monthly` | Base + Recovery | ₹999/mo +12% variable | Monthly |
| `plan_lite_annual` | Lite Annual | ₹19,990/yr | Yearly |
| `plan_scale_monthly` | Scale | ₹7,499/mo | Monthly |

---

## 3. Webhook Events to Handle

| Event | Action | Retry |
|---|---|---|
| `subscription.charged` | Mark active, generate invoice, reset dunning counter | 3× exponential backoff |
| `subscription.failed` | Increment failure_count, send WA notification | No retry needed (Razorpay retries) |
| `subscription.cancelled` | Set status=cancelled, pause lead processing | — |
| `subscription.completed` | Year-end: generate annual summary invoice | — |
| `payment.failed` | Log for dunning tracker | — |
| `refund.processed` | Update recovery ledger, adjust recoveredInr | — |

**Webhook verification:** Every webhook MUST verify `x-razorpay-signature` HMAC-SHA256 against `RAZORPAY_WEBHOOK_SECRET`. Reject unsigned requests with 400.

---

## 4. GST Invoice Generation

### Compliance requirements

| Field | Value | Legal basis |
|---|---|---|
| HSN/SAC Code | **998313** (IT consulting & computer-related services) | GST Notification 1/2017 |
| GST Rate | **18%** (9% CGST + 9% SGST for Telangana intra-state) | GST Act Section 9 |
| Place of Supply | Telangana (code 36) | IGST Act Section 12 |
| Invoice prefix | `LSE/2026-27/` | Rule 46, CGST Rules |
| GSTIN of supplier | Your GSTIN (register on GST portal) | — |

### Invoice data model

```typescript
interface GstInvoice {
  id: string;                    // LSE/2026-27/00001
  sellerId: string;
  razorpaySubscriptionId: string;
  razorpayPaymentId: string;
  amountExGst: number;           // ₹999.00 in paise = 99900
  cgst: number;                  // ₹89.91 (9%)
  sgst: number;                  // ₹89.91 (9%)
  totalAmount: number;           // ₹1178.82 in paise
  hsnCode: '998313';
  placeOfSupply: '36';           // Telangana
  status: 'generated' | 'sent' | 'paid';
  pdfUrl?: string;               // Generated via Apps Script or Razorpay invoice API
  createdAtMs: number;
}
```

### Generation approach (MVP)

Phase 1: Google Apps Script generates PDF from Sheets row → uploads to Drive → shares link via WhatsApp.
Phase 2: Razorpay Invoices API (`POST /v1/invoices`) auto-generates compliant PDF.
Phase 3: Custom PDF generation via CF Workers + `pdf-lib`.

---

## 5. Dunning Ladder

```
subscription.failed event received
    │
    ├─ Day 0: WhatsApp template msg to seller
    │   "Your Lead Speed Engine payment failed. Please update your UPI mandate."
    │   → increment dunning_day = 0
    │
    ├─ Day 3: If still failed
    │   → Email to registered address
    │   → increment dunning_day = 3
    │
    ├─ Day 5: If still failed
    │   → PAUSE service (set seller.status = 'paused')
    │   → Leads still ingested to D1 but queue consumer skips WA sending
    │   → WA notification: "Service paused. Pay to resume."
    │
    └─ Day 7: If still failed
        → CANCEL subscription (status = 'cancelled')
        → Seller keeps historical data, can re-subscribe anytime
        → Final email with export link (CSV of all leads)
```

Implementation: CF Workflows cron at 03:30 UTC checks `subscriptions` where `status='past_due'` and increments `dunning_day`.

---

## 6. Database Schema

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    seller_id TEXT NOT NULL,
    razorpay_subscription_id TEXT UNIQUE NOT NULL,
    razorpay_plan_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'created'
        CHECK (status IN ('created','active','past_due','paused','cancelled','completed')),
    current_period_start_ms INTEGER,
    current_period_end_ms INTEGER,
    next_billing_at_ms INTEGER,
    dunning_day INTEGER NOT NULL DEFAULT 0,
    failure_count INTEGER NOT NULL DEFAULT 0,
    recovery_percentage REAL NOT NULL DEFAULT 12.0,
    created_at_ms INTEGER NOT NULL,
    updated_at_ms INTEGER NOT NULL
);

CREATE INDEX idx_subs_seller ON subscriptions (seller_id);
CREATE INDEX idx_subs_status ON subscriptions (status);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    seller_id TEXT NOT NULL,
    subscription_id TEXT NOT NULL REFERENCES subscriptions (id),
    razorpay_payment_id TEXT,
    amount_ex_gst_paise INTEGER NOT NULL,
    cgst_paise INTEGER NOT NULL,
    sgst_paise INTEGER NOT NULL,
    total_paise INTEGER NOT NULL,
    hsn_code TEXT NOT NULL DEFAULT '998313',
    place_of_supply TEXT NOT NULL DEFAULT '36',
    status TEXT NOT NULL DEFAULT 'generated'
        CHECK (status IN ('generated','sent','paid','overdue')),
    pdf_url TEXT,
    created_at_ms INTEGER NOT NULL
);

CREATE INDEX idx_invoices_seller ON invoices (seller_id, created_at_ms);
```

---

## 7. API Endpoints

### POST `/api/billing/subscribe`
Creates a Razorpay Subscription and returns checkout URL.

```typescript
// Request body
{ sellerId: string; planId: 'plan_base_monthly' | 'plan_lite_annual' | 'plan_scale_monthly'; }

// Response 200
{ checkoutUrl: string; subscriptionId: string; }
```

Flow:
1. Look up seller by sellerId
2. Call Razorpay `POST /v1/subscriptions` with plan_id + `customer_notify: 1`
3. Store subscription record with status='created'
4. Return Razorpay short_url for checkout

### GET `/api/billing/status/:sellerId`
Returns current subscription state for dashboard display.

```typescript
// Response 200
{
  status: 'active' | 'past_due' | 'paused' | 'cancelled' | 'none';
  planName: string;
  nextBillingAtMs: number | null;
  amountPaise: number;
  daysUntilDue: number | null;
}
```

### POST `/api/billing/webhook/razorpay`
Receives Razorpay webhook events.

```typescript
// Verify x-razorpay-signature header before processing
// Handle: subscription.charged, subscription.failed, subscription.cancelled
// Return 200 immediately (process async via queue)
```

---

## 8. Implementation Phases

### Phase 1 — Manual MVP (Week 1–2) [₹0 cost]
- Generate UPI QR code (PhonePe Business / GPay Business)
- Track payments in Google Sheets manually
- Send GST invoices via WhatsApp Business App (manual PDF)
- Acceptable for first 5 sellers

### Phase 2 — Razorpay Subscriptions (Week 3–4)
- Create Razorpay account + plans
- Implement webhook handler + signature verification
- Wire into Worker as new routes
- Auto-generate GST invoices via Razorpay Invoices API
- Dunning ladder via CF Workflows cron

### Phase 3 — Self-serve portal (Month 2+)
- `/billing` page in Next.js dashboard
- Show current plan, usage, invoices list
- Upgrade/downgrade buttons
- Download invoice PDFs
- Update UPI mandate link

---

## 9. Environment Variables

```
RAZORPAY_KEY_ID=rzp_live_xxxxx        # from dashboard.razorpay.com
RAZORPAY_KEY_SECRET=xxxxx             # never expose client-side
RAZORPAY_WEBHOOK_SECRET=xxxxx         # set when creating webhook
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx  # client-side checkout only
```

Set via: `bunx wrangler secret put RAZORPAY_KEY_ID` etc.
