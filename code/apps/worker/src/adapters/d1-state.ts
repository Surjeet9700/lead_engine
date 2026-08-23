// StatePort adapter: raw D1 prepared statements over lead_states table.
import type { StatePort } from '../ports';
import type { NormalizedLead } from '../domain';

export class D1State implements StatePort {
	constructor(private db: D1Database) {}

	async upsertReceived(lead: NormalizedLead, dedupKey: string, nowMs: number): Promise<boolean> {
		const result = await this.db
			.prepare(
				`INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, sla_due_at_ms, created_at_ms, updated_at_ms)
				 VALUES (?1, ?2, ?3, ?4, ?5, 'pending', 'received', ?6, ?7, ?8)
				 ON CONFLICT (dedup_key) DO NOTHING`,
			)
			.bind(
				dedupKey,
				`fz:${lead.sellerId}:${lead.mobile ?? 'nomob'}:${Math.floor(lead.receivedAtMs / 60000)}`,
				lead.leadId,
				lead.sellerId,
				lead.source,
				nowMs + 300_000,
				nowMs,
				nowMs,
			)
			.run();
		return (result.meta?.changes ?? 0) === 1;
	}

	async markSent(leadId: string, _waMessageId: string, atMs: number): Promise<void> {
		await this.db
			.prepare(`UPDATE lead_states SET outcome = 'sent', updated_at_ms = ?2 WHERE lead_id = ?1`)
			.bind(leadId, atMs)
			.run();
	}

	async markDeferred(leadId: string, deferUntilMs: number): Promise<void> {
		await this.db
			.prepare(
				`UPDATE lead_states SET route = 'wa_defer_digest', defer_until_ms = ?2, outcome = 'deferred', updated_at_ms = ?3 WHERE lead_id = ?1`,
			)
			.bind(leadId, deferUntilMs, Date.now())
			.run();
	}

	async markPermanentFailure(leadId: string, errorCode: number | null, atMs: number): Promise<void> {
		await this.db
			.prepare(
				`UPDATE lead_states SET outcome = 'failed_permanent', last_error_code = ?2, updated_at_ms = ?3 WHERE lead_id = ?1`,
			)
			.bind(leadId, errorCode, atMs)
			.run();
	}

	async bumpAttempts(leadId: string): Promise<number> {
		await this.db
			.prepare(`UPDATE lead_states SET attempts = attempts + 1, outcome = 'retrying', updated_at_ms = ?2 WHERE lead_id = ?1`)
			.bind(leadId, Date.now())
			.run();
		const row = await this.db
			.prepare(`SELECT attempts FROM lead_states WHERE lead_id = ?1`)
			.bind(leadId)
			.first<{ attempts: number }>();
		return row?.attempts ?? 0;
	}

	async markDead(leadId: string, attempts: number): Promise<void> {
		await this.db
			.prepare(`UPDATE lead_states SET outcome = 'dead_lettered', attempts = ?2, updated_at_ms = ?3 WHERE lead_id = ?1`)
			.bind(leadId, attempts, Date.now())
			.run();
	}
}
