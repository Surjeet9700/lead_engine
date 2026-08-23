// Shared types between worker and web. Single source of truth.
// When worker changes a route, this file changes — CI fails if web drifts.

export type LeadRoute = 'wa_now' | 'wa_defer_digest' | 'human' | 'silent_spam';

export type LeadOutcome =
	| 'received'
	| 'sent'
	| 'delivered'
	| 'read'
	| 'replied'
	| 'deferred'
	| 'spam_skipped'
	| 'failed_permanent'
	| 'retrying'
	| 'dead_lettered';

export interface LeadRow {
	dedupKey: string;
	leadId: string;
	sellerId: string;
	product: string;
	city: string;
	priority: number;
	route: LeadRoute;
	outcome: LeadOutcome;
	attempts: number;
	refundDraftFiled: boolean;
	lastErrorCode: number | null;
	createdAtMs: number;
}

export interface SellerSummary {
	sellerId: string;
	company: string;
	totalLeads: number;
	hotLeads: number;
	spamLeads: number;
	sentCount: number;
	recoveredInr: number;
	avgResponseSec: number;
}
