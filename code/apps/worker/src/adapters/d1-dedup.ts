// DedupPort adapter: D1 INSERT..ON CONFLICT DO NOTHING. Winner iff rowsChanged === 1.
// ADR-002: KV eventual consistency rejected — two PoPs can both observe absent and both win.
import type { DedupPort } from '../ports';

export class D1Dedup implements DedupPort {
	constructor(private db: D1Database) {}
	async claim(key: string, leadId: string, sellerId: string): Promise<boolean> {
		const result = await this.db
			.prepare('INSERT INTO lead_states (dedup_key, lead_id, seller_id, source, created_at_ms, updated_at_ms) VALUES (?1, ?2, ?3, ?4, ?5, ?6) ON CONFLICT (dedup_key) DO NOTHING')
			.bind(key, leadId, sellerId, 'push', Date.now(), Date.now())
			.run();
		return (result.meta?.changes ?? 0) === 1;
	}
}
