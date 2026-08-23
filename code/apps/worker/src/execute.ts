// executeDecision: shallow switch on route -> port calls. IMPORTS: domain, ports, errors.
// Total function invariant: never rejects for any port failure except programmer bug.
import type { Decision } from './domain';
import type { Ports, WaSendResult } from './ports';
import { TerminalError, RetryableError } from './errors';

export type ExecOutcome =
	| { disposition: 'sent'; leadId: string; waMessageId: string; latencyMs: number }
	| { disposition: 'deferred_to_digest'; leadId: string; deferUntilMs: number }
	| { disposition: 'skipped_spam'; leadId: string; refundDraft: boolean }
	| { disposition: 'failed_permanent'; leadId: string; waCode: number | null }
	| { disposition: 'retryable_failure'; leadId: string; attempt: number; detail: string };

function mapWaResult(r: WaSendResult): { kind: 'ok'; id: string } | { kind: 'terminal'; waCode: number | null } | { kind: 'retry'; detail: string } {
	switch (r.kind) {
		case 'sent':
			return { kind: 'ok', id: r.waMessageId };
		case 'reengagement_blocked':
			return { kind: 'terminal', waCode: 131049 };
		case 'not_on_whatsapp':
			return { kind: 'terminal', waCode: 131026 };
		case 'template_invalid':
			return { kind: 'terminal', waCode: 132001 };
		case 'rate_limited':
			return { kind: 'retry', detail: 'throttled' };
		case 'transient':
			return { kind: 'retry', detail: r.detail };
	}
}

export async function executeDecision(d: Decision, ports: Ports): Promise<ExecOutcome> {
	switch (d.route) {
		case 'silent_spam':
			await ports.log.write({
				at: Date.now(),
				kind: 'decided',
				sellerId: d.sellerId,
				leadId: d.leadId,
				route: d.route,
				data: { refundDraft: true },
			});
			return { disposition: 'skipped_spam', leadId: d.leadId, refundDraft: true };

		case 'human':
			await ports.log.write({ at: Date.now(), kind: 'decided', sellerId: d.sellerId, leadId: d.leadId, route: d.route });
			return { disposition: 'skipped_spam', leadId: d.leadId, refundDraft: false };

		case 'wa_defer_digest': {
			const until = d.deferUntilMs ?? Date.now() + 12 * 3600_000;
			await ports.state.markDeferred(d.leadId, until);
			await ports.log.write({
				at: Date.now(),
				kind: 'deferred',
				sellerId: d.sellerId,
				leadId: d.leadId,
				route: d.route,
				data: { deferUntilMs: until },
			});
			return { disposition: 'deferred_to_digest', leadId: d.leadId, deferUntilMs: until };
		}

		case 'wa_now': {
			if (!d.templateKey) return { disposition: 'failed_permanent', leadId: d.leadId, waCode: null };
			const t0 = Date.now();
			let result: WaSendResult;
			try {
				result = await ports.wa.sendTemplate({
					to: '', // resolved by adapter from catalog snapshot in consumer
					templateKey: d.templateKey,
					vars: d.templateVars,
				});
			} catch (e) {
				throw new RetryableError('WA_TRANSIENT', e instanceof Error ? e.message : 'network');
			}
			const mapped = mapWaResult(result);
			if (mapped.kind === 'ok') {
				await ports.state.markSent(d.leadId, mapped.id, Date.now());
				await ports.log.write({
					at: Date.now(),
					kind: 'wa_result',
					sellerId: d.sellerId,
					leadId: d.leadId,
					route: d.route,
					data: { latencyMs: Date.now() - t0 },
				});
				return { disposition: 'sent', leadId: d.leadId, waMessageId: mapped.id, latencyMs: Date.now() - t0 };
			}
			if (mapped.kind === 'terminal') {
				await ports.state.markPermanentFailure(d.leadId, mapped.waCode, Date.now());
				await ports.log.write({
					at: Date.now(),
					kind: 'failed',
					sellerId: d.sellerId,
					leadId: d.leadId,
					data: { errorCode: mapped.waCode },
				});
				throw new TerminalError(
					mapped.waCode === 131049 ? 'WA_REENGAGEMENT_BLOCKED' : mapped.waCode === 131026 ? 'WA_NOT_ON_WHATSAPP' : 'WA_TEMPLATE_INVALID',
					`wa terminal ${mapped.waCode}`,
					mapped.waCode,
				);
			}
			await ports.state.bumpAttempts(d.leadId);
			throw new RetryableError('WA_THROTTLED', mapped.detail);
		}
	}
}
