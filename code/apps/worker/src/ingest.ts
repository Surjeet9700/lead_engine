// ingestLead: parse -> claim -> enqueue -> state. IMPORTS: domain, ports, errors, schemas.
// Ack budget invariant: no awaited WA/Sheets I/O here. Sequential commit: queue FIRST, then D1.
import type { DedupPort, QueuePort, EnqueuedLead } from './ports';
import { dedupKeysFor, type NormalizedLead } from './domain';
import { parsePushBody, normalizeLead } from './schemas/lead';

export type IngestOutcome =
	| { disposition: 'acked_enqueued'; leadId: string; dedupKey: string }
	| { disposition: 'duplicate_ignored'; leadId: string; dedupKey: string }
	| { disposition: 'rejected_unauthorized' }
	| { disposition: 'rejected_bad_payload'; reason: string };

export async function ingestLead(
	rawBody: string,
	token: string,
	expectedToken: string,
	sellerId: string,
	catalog: EnqueuedLead['catalog'],
	ports: { dedup: DedupPort; queue: QueuePort },
): Promise<IngestOutcome> {
	if (token !== expectedToken) return { disposition: 'rejected_unauthorized' };

	let lead: NormalizedLead;
	try {
		const raw = parsePushBody(rawBody);
		lead = normalizeLead(raw, sellerId, 'push');
	} catch (e) {
		return { disposition: 'rejected_bad_payload', reason: e instanceof Error ? e.message : 'parse_failed' };
	}

	const { exact } = dedupKeysFor(lead);
	const isNew = await ports.dedup.claim(exact, lead.leadId, lead.sellerId);
	if (!isNew) return { disposition: 'duplicate_ignored', leadId: lead.leadId, dedupKey: exact };

	try {
		await ports.queue.send({ v: 1, lead, catalog, dedupKey: exact });
	} catch (e) {
		// Queue failed: dedup claim already committed is acceptable — IndiaMart retry hits
		// duplicate_ignored and the consumer-side reconciler recovers via LeadState absence check.
		throw e;
	}

	return { disposition: 'acked_enqueued', leadId: lead.leadId, dedupKey: exact };
}
