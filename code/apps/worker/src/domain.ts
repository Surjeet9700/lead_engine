// PURE. Zero imports. No Date.now, Math.random, fetch, or I/O in this module graph.
// Invariant 2 tested by import-graph lint + property test.

export type SellerId = string;
export type LeadSource = 'push' | 'gmail' | 'pull';
export type Route = 'wa_now' | 'wa_defer_digest' | 'human' | 'silent_spam';

export interface NormalizedLead {
	leadId: string;
	sellerId: SellerId;
	mobile: string | null;
	productName: string;
	queryMessage: string;
	city: string;
	callDurationSec: number;
	source: LeadSource;
	receivedAtMs: number;
}

export interface Catalog {
	sellerId: SellerId;
	company: string;
	ownerName: string;
	ownerWaPhone: string;
	skuPatterns: RegExp[];
	homeCity: string;
	quietStartMinIst: number; // 1320 = 22:00
	quietEndMinIst: number; // 420 = 07:00
	digestMinIst: number; // 485 = 08:05
}

export interface Decision {
	leadId: string;
	sellerId: SellerId;
	route: Route;
	priority: number;
	templateKey: string | null;
	templateVars: string[];
	slaSec: number;
	slaDueAtMs: number;
	deferUntilMs: number | null;
	refundDraft: boolean;
	reasons: string[];
}

const SPAM_RE = /\b(project|college|ppt|internship|syllabus)\b/i;

export function istMinutes(now: Date): number {
	return (now.getUTCHours() * 60 + now.getUTCMinutes() + 330) % 1440;
}

export function isInQuietHours(catalog: Catalog, now: Date): boolean {
	const m = istMinutes(now);
	const { quietStartMinIst: s, quietEndMinIst: e } = catalog;
	return s <= e ? m >= s && m < e : m >= s || m < e;
}

export function nextDigestMs(catalog: Catalog, now: Date): number {
	const m = istMinutes(now);
	const digest = catalog.digestMinIst;
	let deltaMin = digest - m;
	if (deltaMin <= 0) deltaMin += 1440;
	return now.getTime() + deltaMin * 60_000;
}

export function dedupKeysFor(lead: NormalizedLead): { exact: string; fuzzy: string } {
	const minuteBucket = Math.floor(lead.receivedAtMs / 60000);
	const mob = lead.mobile ? `mob${lead.mobile.replace(/\D/g, '').slice(-4)}` : 'nomob';
	return {
		exact: `lead:${lead.sellerId}:${lead.leadId}`,
		fuzzy: `fz:${lead.sellerId}:${mob}:${minuteBucket}`,
	};
}

export function decide(lead: NormalizedLead, catalog: Catalog, now: Date): Decision {
	const reasons: string[] = [];
	let priority = 40;

	if (SPAM_RE.test(lead.queryMessage)) {
		return {
			leadId: lead.leadId,
			sellerId: lead.sellerId,
			route: 'silent_spam',
			priority: 0,
			templateKey: null,
			templateVars: [],
			slaSec: 0,
			slaDueAtMs: now.getTime(),
			deferUntilMs: null,
			refundDraft: true,
			reasons: ['spam_keyword'],
		};
	}

	if (lead.queryMessage.length < 10 && !lead.city) {
		return {
			leadId: lead.leadId,
			sellerId: lead.sellerId,
			route: 'silent_spam',
			priority: 5,
			templateKey: null,
			templateVars: [],
			slaSec: 0,
			slaDueAtMs: now.getTime(),
			deferUntilMs: null,
			refundDraft: true,
			reasons: ['vague_no_city'],
		};
	}

	const specMatch = catalog.skuPatterns.some((re) => re.test(lead.productName) || re.test(lead.queryMessage));
	if (specMatch) {
		priority += 35;
		reasons.push('pump_spec_match');
	}
	if (lead.callDurationSec > 0) {
		priority += 15;
		reasons.push('call_duration>0');
	}
	if (lead.city.toLowerCase().includes(catalog.homeCity.toLowerCase())) {
		priority += 10;
		reasons.push('home_city');
	}
	priority = Math.max(0, Math.min(100, priority));

	if (priority >= 70) reasons.push('hot');
	else if (priority >= 45) reasons.push('warm');
	else reasons.push('cold');

	const quiet = isInQuietHours(catalog, now);
	const route: Route = quiet ? 'wa_defer_digest' : priority >= 55 ? 'wa_now' : 'human';
	const slaSec = priority >= 70 ? 300 : 900;

	return {
		leadId: lead.leadId,
		sellerId: lead.sellerId,
		route,
		priority,
		templateKey: route === 'wa_now' || route === 'wa_defer_digest' ? 'enquiry_ack_utility' : null,
		templateVars:
			route === 'wa_now' || route === 'wa_defer_digest'
				? [catalog.ownerName, lead.productName.slice(0, 20), catalog.company, lead.leadId.slice(0, 10)]
				: [],
		slaSec,
		slaDueAtMs: now.getTime() + slaSec * 1000,
		deferUntilMs: quiet ? nextDigestMs(catalog, now) : null,
		refundDraft: false,
		reasons,
	};
}
