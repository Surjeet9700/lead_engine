// Queue consumer: per-msg ack/retry/DLQ + voice fallback trigger.
// Contract: RetryableError => throw (CF redelivers, max 3); TerminalError => ack + log.
// Voice fallback: after WA sent, schedule voice call if unread after 8 min.
import type { EnqueuedLead, WaPort, LogPort, StatePort, VoicePort } from '../ports';
import { decide } from '../domain';
import { executeDecision } from '../execute';
import { isTerminal } from '../errors';

export interface ConsumerEnv {
	DB: D1Database;
	LEADS_QUEUE: Queue;
	WA_PHONE_ID: string;
	WA_TOKEN: string;
	WHATSAPP_API_VERSION?: string;
}

export interface ConsumerAdapters {
	wa: WaPort;
	log: LogPort;
	state: StatePort;
	voice?: VoicePort;
}

export async function handleQueueBatch(
	batch: MessageBatch<EnqueuedLead>,
	_env: ConsumerEnv,
	adapters: ConsumerAdapters,
): Promise<void> {
	for (const msg of batch.messages) {
		const { lead, catalog } = msg.body;
		try {
			const decision = decide(lead, catalog, new Date());
			const result = await executeDecision(decision, adapters);

			// Voice fallback: hot lead sent on WA → trigger voice if not read in 8 min
			if (
				result.disposition === 'sent' &&
				decision.route === 'wa_now' &&
				decision.priority >= 70 &&
				adapters.voice &&
				lead.mobile
			) {
				try {
					await adapters.voice.call({
						to: catalog.ownerWaPhone,
						buyerPhone: `91${lead.mobile}`,
						ownerName: catalog.ownerName,
						product: lead.productName,
						company: catalog.company,
						lang: lead.city.toLowerCase().includes('hyderabad') || lead.city.toLowerCase().includes('jeedimetla') ? 'te-IN' : 'hi-IN',
						leadDedupKey: msg.body.dedupKey,
					});
				} catch {
					// voice failure should never fail the lead — log and continue
					await adapters.log.write({
						at: Date.now(),
						kind: 'failed',
						sellerId: lead.sellerId,
						leadId: lead.leadId,
						data: { stage: 'voice_trigger_failed' },
					});
				}
			}

			msg.ack();
		} catch (e) {
			if (isTerminal(e)) {
				await adapters.log.write({
					at: Date.now(),
					kind: 'failed',
					sellerId: lead.sellerId,
					leadId: lead.leadId,
					data: { errorCode: e.waCode, stage: 'consumer_terminal' },
				});
				msg.ack();
			} else {
				const attempt = (msg.attempts ?? 0) + 1;
				if (attempt >= 3) {
					await adapters.log.write({
						at: Date.now(),
						kind: 'dead',
						sellerId: lead.sellerId,
						leadId: lead.leadId,
						data: { attempts: attempt },
					});
					msg.ack();
				} else {
					msg.retry({ delaySeconds: Math.min(2 ** attempt * 30, 3600) });
				}
			}
		}
	}
}
