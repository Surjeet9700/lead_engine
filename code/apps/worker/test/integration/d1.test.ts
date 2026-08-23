// Integration tests: D1Dedup + D1State against real local D1 via vitest-pool-workers.
// Platform does NOT enforce idempotency locally (#14836) — we test double-delivery explicitly.
import { env } from 'cloudflare:test';
import { describe, test, expect } from 'vitest';
import { D1Dedup } from '../../src/adapters/d1-dedup';
import { D1State } from '../../src/adapters/d1-state';

describe('D1Dedup (invariant 1)', () => {
	test('first claim true', async () => {
		const dedup = new D1Dedup(env.DB);
		expect(await dedup.claim('test:key-1', 'Q1', 'seller_test')).toBe(true);
	});

	test('same key returns false', async () => {
		const dedup = new D1Dedup(env.DB);
		await dedup.claim('test:key-2', 'Q2', 'seller_test');
		expect(await dedup.claim('test:key-2', 'Q2', 'seller_test')).toBe(false);
	});

	test('different key returns true', async () => {
		const dedup = new D1Dedup(env.DB);
		await dedup.claim('test:key-3a', 'Q3a', 'seller_test');
		expect(await dedup.claim('test:key-3b', 'Q3b', 'seller_test')).toBe(true);
	});

	test('concurrent 10 claims on same key -> exactly 1 true', async () => {
		const dedup = new D1Dedup(env.DB);
		const results = await Promise.all(Array.from({ length: 10 }, () => dedup.claim('test:concurrent', 'QC', 'seller_test')));
		expect(results.filter(Boolean).length).toBe(1);
	});
});

const lead = {
	leadId: 'Q-INTEG-1',
	sellerId: 'seller_test',
	mobile: '919876543210',
	productName: 'Slurry Pump 7.5HP',
	queryMessage: 'Need 2 units for chemical plant Hyderabad',
	city: 'Hyderabad',
	callDurationSec: 0,
	source: 'push' as const,
	receivedAtMs: Date.now(),
};

describe('D1State', () => {
	test('upsertReceived inserts and returns true, second returns false', async () => {
		const state = new D1State(env.DB);
		expect(await state.upsertReceived(lead, 'test:state-key-1', Date.now())).toBe(true);
		expect(await state.upsertReceived(lead, 'test:state-key-1', Date.now())).toBe(false);
	});

	test('markSent updates outcome to sent', async () => {
		const state = new D1State(env.DB);
		const dedup = new D1Dedup(env.DB);
		await dedup.claim('test:state-sent');
		await state.upsertReceived({ ...lead, leadId: 'Q-SENT-1' }, 'test:state-sent', Date.now());
		await state.markSent('Q-SENT-1', 'wamid_123', Date.now());
		const row = await env.DB.prepare(`SELECT outcome FROM lead_states WHERE lead_id = ?1`).bind('Q-SENT-1').first();
		expect(row?.outcome).toBe('sent');
	});

	test('markDeferred sets route and defer_until_ms', async () => {
		const state = new D1State(env.DB);
		const dedup = new D1Dedup(env.DB);
		await dedup.claim('test:state-defer');
		await state.upsertReceived({ ...lead, leadId: 'Q-DEFER-1' }, 'test:state-defer', Date.now());
		const until = Date.now() + 3600_000;
		await state.markDeferred('Q-DEFER-1', until);
		const row = await env.DB.prepare(`SELECT route, defer_until_ms FROM lead_states WHERE lead_id = ?1`).bind('Q-DEFER-1').first();
		expect(row?.route).toBe('wa_defer_digest');
		expect(row?.defer_until_ms).toBe(until);
	});

	test('bumpAttempts increments and returns count', async () => {
		const state = new D1State(env.DB);
		const dedup = new D1Dedup(env.DB);
		await dedup.claim('test:state-retry');
		await state.upsertReceived({ ...lead, leadId: 'Q-RETRY-1' }, 'test:state-retry', Date.now());
		expect(await state.bumpAttempts('Q-RETRY-1')).toBe(1);
		expect(await state.bumpAttempts('Q-RETRY-1')).toBe(2);
	});

	test('markDead sets outcome to dead_lettered', async () => {
		const state = new D1State(env.DB);
		const dedup = new D1Dedup(env.DB);
		await dedup.claim('test:state-dead');
		await state.upsertReceived({ ...lead, leadId: 'Q-DEAD-1' }, 'test:state-dead', Date.now());
		await state.markDead('Q-DEAD-1', 3);
		const row = await env.DB.prepare(`SELECT outcome, attempts FROM lead_states WHERE lead_id = ?1`).bind('Q-DEAD-1').first();
		expect(row?.outcome).toBe('dead_lettered');
		expect(row?.attempts).toBe(3);
	});
});
