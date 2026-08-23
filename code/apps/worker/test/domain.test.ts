// Invariant 2: decide is pure. Invariant 4: quiet-hours hold. Table tests.
import { describe, test, expect } from 'bun:test';
import { decide, isInQuietHours, nextDigestMs, istMinutes, type NormalizedLead, type Catalog } from '../src/domain';

const CATALOG: Catalog = {
	sellerId: 'seller_bj01',
	company: 'All Flow Pumps',
	ownerName: 'Ramesh',
	ownerWaPhone: '919999999999',
	skuPatterns: [/pump.*(HP|kW|GPM|capacitor)/i],
	homeCity: 'Hyderabad',
	quietStartMinIst: 1320, // 22:00
	quietEndMinIst: 420, // 07:00
	digestMinIst: 485, // 08:05
};

const lead = (over: Partial<NormalizedLead> = {}): NormalizedLead => ({
	leadId: 'Q1',
	sellerId: 'seller_bj01',
	mobile: '919876543210',
	productName: 'Slurry Pump 7.5HP',
	queryMessage: 'Need 2 units for chemical plant Hyderabad urgent',
	city: 'Hyderabad',
	callDurationSec: 0,
	source: 'push',
	receivedAtMs: Date.UTC(2026, 7, 21, 5, 30), // 11:00 IST
	...over,
});

// 11:00 IST = 05:30 UTC. Quiet window 22:00-07:00 IST => 16:30-01:30 UTC.
const businessUtc = new Date(Date.UTC(2026, 7, 21, 5, 30)); // 11:00 IST
const quietUtc = new Date(Date.UTC(2026, 7, 21, 17, 0)); // 22:30 IST

describe('decide: routing table', () => {
	test('hot lead business hours -> wa_now', () => {
		const d = decide(lead(), CATALOG, businessUtc);
		expect(d.route).toBe('wa_now');
		expect(d.priority).toBeGreaterThanOrEqual(70);
		expect(d.templateKey).toBe('enquiry_ack_utility');
		expect(d.slaSec).toBe(300);
	});

	test('spam keyword -> silent_spam + refundDraft', () => {
		const d = decide(lead({ queryMessage: 'college project ppt please' }), CATALOG, businessUtc);
		expect(d.route).toBe('silent_spam');
		expect(d.refundDraft).toBe(true);
		expect(d.templateKey).toBeNull();
	});

	test('vague short message no city -> silent_spam', () => {
		const d = decide(lead({ queryMessage: 'hi', city: '' }), CATALOG, businessUtc);
		expect(d.route).toBe('silent_spam');
	});

	test('cold lead -> human route', () => {
		// no spec match (+0), no call (+0), non-home city (+0) = base 40 -> human (threshold 55)
		const cold = decide(
			lead({
				productName: 'random thing',
				queryMessage: 'what is the price of this item exactly',
				city: 'Delhi',
				callDurationSec: 0,
			}),
			CATALOG,
			businessUtc,
		);
		expect(cold.route).toBe('human');
		expect(cold.priority).toBe(40);
		expect(cold.reasons).toContain('cold');
	});
});

describe('quiet hours (invariant 4)', () => {
	test('quiet lead -> wa_defer_digest at next 08:05 IST', () => {
		const d = decide(lead(), CATALOG, quietUtc);
		expect(d.route).toBe('wa_defer_digest');
		expect(d.deferUntilMs).not.toBeNull();
		const deferIst = istMinutes(new Date(d.deferUntilMs!));
		expect(deferIst).toBe(CATALOG.digestMinIst);
	});

	test('sweep all 1440 minutes: in-window never wa_now', () => {
		for (let m = 0; m < 1440; m += 15) {
			const utcMidnight = Date.UTC(2026, 7, 21, 0, 0) - 330 * 60_000;
			const now = new Date(utcMidnight + m * 60_000);
			const d = decide(lead(), CATALOG, now);
			if (isInQuietHours(CATALOG, now)) {
				expect(d.route).toBe('wa_defer_digest');
			}
		}
	});

	test('boundary 05:29 UTC (=10:59 IST) allowed; 16:31 UTC (=22:01 IST) deferred', () => {
		expect(isInQuietHours(CATALOG, new Date(Date.UTC(2026, 7, 21, 5, 29)))).toBe(false);
		expect(isInQuietHours(CATALOG, new Date(Date.UTC(2026, 7, 21, 16, 31)))).toBe(true);
	});

	test('purity: same inputs -> deep-equal decision (spot check)', () => {
		const a = decide(lead(), CATALOG, businessUtc);
		const b = decide(lead(), CATALOG, businessUtc);
		expect(a).toEqual(b);
	});
});
