// Invariant 5: bounded retries -> DLQ. Terminal errors ack'd not retried.
import { describe, test, expect } from 'bun:test';
import { executeDecision } from '../src/execute';
import { createTestHarness, type Harness } from './harness/create-test-harness';
import type { Decision, Catalog } from '../src/domain';

const CATALOG: Catalog = {
	sellerId: 's1',
	company: 'C',
	ownerName: 'O',
	ownerWaPhone: '919999999999',
	skuPatterns: [],
	homeCity: 'Hyderabad',
	quietStartMinIst: 1320,
	quietEndMinIst: 420,
	digestMinIst: 485,
};

const dec = (over: Partial<Decision> = {}): Decision => ({
	leadId: 'Q1',
	sellerId: 's1',
	route: 'wa_now',
	priority: 90,
	templateKey: 'enquiry_ack_utility',
	templateVars: ['a', 'b', 'c', 'd'],
	slaSec: 300,
	slaDueAtMs: Date.now() + 300_000,
	deferUntilMs: null,
	refundDraft: false,
	reasons: [],
	...over,
});

// Minimal StatePort fake for execute tests
function fakeState(h: Harness) {
	return {
		upsertReceived: async () => true,
		markSent: async (leadId: string, wamid: string) => {
			h.log.events.push({ at: Date.now(), kind: 'wa_result', sellerId: 's1', leadId, data: { wamid } });
		},
		markDeferred: async () => {},
		markPermanentFailure: async (leadId: string, code: number | null) => {
			h.log.events.push({ at: Date.now(), kind: 'failed', sellerId: 's1', leadId, data: { code } });
		},
		bumpAttempts: async () => 1,
		markDead: async () => {},
	};
}

describe('executeDecision (invariant 3: total)', () => {
	test('happy path -> sent with waMessageId', async () => {
		const h = createTestHarness();
		const r = await executeDecision(dec(), { wa: h.wa, log: h.log, state: fakeState(h) });
		expect(r.disposition).toBe('sent');
		if (r.disposition === 'sent') expect(r.waMessageId).toMatch(/^wamid_/);
	});

	test('spam route -> skipped_spam, zero WA calls', async () => {
		const h = createTestHarness();
		const r = await executeDecision(dec({ route: 'silent_spam', templateKey: null }), {
			wa: h.wa,
			log: h.log,
			state: fakeState(h),
		});
		expect(r.disposition).toBe('skipped_spam');
		expect(h.wa.calls).toBe(0);
	});

	test('deferred route -> deferred_to_digest with deferUntilMs', async () => {
		const h = createTestHarness();
		const until = Date.now() + 3600_000;
		const r = await executeDecision(dec({ route: 'wa_defer_digest', deferUntilMs: until }), {
			wa: h.wa,
			log: h.log,
			state: fakeState(h),
		});
		expect(r.disposition).toBe('deferred_to_digest');
		expect(h.wa.calls).toBe(0);
	});

	test('WA rate_limited -> throws RetryableError (consumer retries)', async () => {
		const h = createTestHarness({ waScript: { failOnCall: 1, result: { kind: 'rate_limited' } } });
		await expect(
			executeDecision(dec(), { wa: h.wa, log: h.log, state: fakeState(h) }),
		).rejects.toThrow('WA_THROTTLED');
	});

	test('WA not_on_whatsapp -> throws TerminalError 131026', async () => {
		const h = createTestHarness({
			waScript: { failOnCall: 1, result: { kind: 'not_on_whatsapp' } },
		});
		try {
			await executeDecision(dec(), { wa: h.wa, log: h.log, state: fakeState(h) });
			expect.unreachable();
		} catch (e) {
			expect((e as Error).name).toBe('TerminalError');
			expect((e as { waCode?: number }).waCode).toBe(131026);
		}
	});
});
