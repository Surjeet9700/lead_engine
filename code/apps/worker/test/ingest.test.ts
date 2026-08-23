// Invariant 1: at-most-one WA per dedupKey under concurrency.
// Invariant 7: ingest ack budget. Runs <2s deterministic.
import { describe, test, expect } from 'bun:test';
import { createTestHarness } from './harness/create-test-harness';
import { ingestLead } from '../src/ingest';

const CATALOG = {
	sellerId: 'seller_bj01',
	company: 'All Flow Pumps',
	ownerName: 'Ramesh',
	ownerWaPhone: '919999999999',
	skuPatterns: [/pump.*(HP|kW|GPM|capacitor)/i],
	homeCity: 'Hyderabad',
	quietStartMinIst: 1320,
	quietEndMinIst: 420,
	digestMinIst: 485,
};

const BODY = JSON.stringify({
	CODE: 200,
	RESPONSE: {
		UNIQUE_QUERY_ID: 'Q2026-BJ-0001',
		QUERY_TYPE: 'B',
		QUERY_TIME: '2026-08-21 11:00:00',
		SENDER_NAME: 'Buyer One',
		SENDER_MOBILE: '+91-9876543210',
		QUERY_PRODUCT_NAME: 'Slurry Pump 7.5HP',
		QUERY_MESSAGE: 'Need 2 units slurry pump for chemical plant Hyderabad urgent',
		SENDER_CITY: 'Hyderabad',
		CALL_DURATION: '',
	},
});

describe('ingest: duplicate suppression', () => {
	test('duplicate push -> exactly 1 enqueue, second is duplicate_ignored', async () => {
		const h = createTestHarness();
		const first = await ingestLead(BODY, 'tok', 'tok', 'seller_bj01', CATALOG, h);
		const second = await ingestLead(BODY, 'tok', 'tok', 'seller_bj01', CATALOG, h);

		expect(first.disposition).toBe('acked_enqueued');
		expect(second.disposition).toBe('duplicate_ignored');
		expect(h.queue.items.length).toBe(1);
	});

	test('concurrent 50 claims on same key -> exactly 1 winner', async () => {
		const h = createTestHarness();
		const results = await Promise.all(
			Array.from({ length: 50 }, () => ingestLead(BODY, 'tok', 'tok', 'seller_bj01', CATALOG, h)),
		);
		const enqueued = results.filter((r) => r.disposition === 'acked_enqueued');
		const dupes = results.filter((r) => r.disposition === 'duplicate_ignored');
		expect(enqueued.length).toBe(1);
		expect(dupes.length).toBe(49);
		expect(h.queue.items.length).toBe(1);
	});

	test('bad token -> rejected_unauthorized', async () => {
		const h = createTestHarness();
		const r = await ingestLead(BODY, 'wrong', 'tok', 'seller_bj01', CATALOG, h);
		expect(r.disposition).toBe('rejected_unauthorized');
	});

	test('missing UNIQUE_QUERY_ID -> rejected_bad_payload', async () => {
		const h = createTestHarness();
		const bad = JSON.stringify({ RESPONSE: { SENDER_NAME: 'x' } });
		const r = await ingestLead(bad, 'tok', 'tok', 'seller_bj01', CATALOG, h);
		expect(r.disposition).toBe('rejected_bad_payload');
	});

	test('urlencoded legacy RESPONSE= form parses', async () => {
		const h = createTestHarness();
		const form = `RESPONSE=${encodeURIComponent(
			JSON.stringify({ UNIQUE_QUERY_ID: 'Q-LEGACY-1', SENDER_MOBILE: '9876500000' }),
		)}`;
		const r = await ingestLead(form, 'tok', 'tok', 'seller_bj01', CATALOG, h);
		expect(r.disposition).toBe('acked_enqueued');
	});
});
