// VoicePort state adapter: CRUD on voice_calls table.
import type { VoiceCallStatus } from '../ports';

export interface VoiceState {
	insertQueued(leadDedupKey: string, sellerId: string, buyerPhone: string, ownerPhone: string): Promise<string>;
	updateStatus(callId: string, status: VoiceCallStatus, exotelSid?: string, durationSec?: number, dtmf?: string): Promise<void>;
	getRecent(sellerId: string, limit: number): Promise<Record<string, unknown>[]>;
}

export class D1VoiceState implements VoiceState {
	constructor(private db: D1Database) {}

	async insertQueued(leadDedupKey: string, sellerId: string, buyerPhone: string, ownerPhone: string): Promise<string> {
		const id = crypto.randomUUID();
		await this.db
			.prepare(
				`INSERT INTO voice_calls (id, lead_dedup_key, seller_id, buyer_phone, owner_phone, status, triggered_at_ms, created_at_ms)
				 VALUES (?1, ?2, ?3, ?4, ?5, 'queued', ?6, ?6)`,
			)
			.bind(id, leadDedupKey, sellerId, buyerPhone, ownerPhone, Date.now())
			.run();
		return id;
	}

	async updateStatus(
		callId: string,
		status: VoiceCallStatus,
		exotelSid?: string,
		durationSec?: number,
		dtmf?: string,
	): Promise<void> {
		await this.db
			.prepare(
				`UPDATE voice_calls SET
					status = ?2,
					exotel_call_sid = COALESCE(?3, exotel_call_sid),
					duration_sec = COALESCE(?4, duration_sec),
					dtmf_response = COALESCE(?5, dtmf_response),
					answered_at_ms = CASE WHEN ?2 IN ('answered','connected') THEN ?6 ELSE answered_at_ms END,
					ended_at_ms = CASE WHEN ?2 IN ('connected','skipped','no_answer','failed') THEN ?6 ELSE ended_at_ms END
				WHERE id = ?1`,
			)
			.bind(callId, status, exotelSid ?? null, durationSec ?? null, dtmf ?? null, Date.now())
			.run();
	}

	async getRecent(sellerId: string, limit: number): Promise<Record<string, unknown>[]> {
		const rows = await this.db
			.prepare(`SELECT * FROM voice_calls WHERE seller_id = ?1 ORDER BY triggered_at_ms DESC LIMIT ?2`)
			.bind(sellerId, Math.min(limit, 50))
			.all();
		return (rows.results ?? []) as Record<string, unknown>[];
	}
}
