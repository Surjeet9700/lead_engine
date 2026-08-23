// WaPort adapter: WhatsApp Cloud API v25.0 direct (no BSP). Maps HTTP/code -> taxonomy.
// ADR-007: Baileys/whatsapp-web.js rejected — ban risk = business death.
import type { WaPort, WaSendResult } from '../ports';

const GRAPH = (version: string) => `https://graph.facebook.com/${version}`;

export class WaCloud implements WaPort {
	constructor(
		private phoneNumberId: string,
		private token: string,
		private apiVersion = 'v25.0',
	) {}

	async sendTemplate(input: { to: string; templateKey: string; vars: string[] }): Promise<WaSendResult> {
		if (!input.to) return { kind: 'not_on_whatsapp' };
		try {
			const res = await fetch(`${GRAPH(this.apiVersion)}/${this.phoneNumberId}/messages`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messaging_product: 'whatsapp',
					recipient_type: 'individual',
					to: input.to,
					type: 'template',
					template: {
						name: input.templateKey,
						language: { code: 'en_US' },
						components: [{ type: 'body', parameters: input.vars.map((text) => ({ type: 'text', text })) }],
					},
				}),
			});
			const data = (await res.json().catch(() => ({}))) as {
				messages?: { id: string }[];
				error?: { code?: number; message?: string };
			};
			if (!res.ok) return this.mapError(res.status, data.error?.code ?? null, data.error?.message ?? 'unknown');
			const wamid = data.messages?.[0]?.id;
			return wamid ? { kind: 'sent', waMessageId: wamid } : { kind: 'transient', detail: 'no wamid in response' };
		} catch (e) {
			return { kind: 'transient', detail: e instanceof Error ? e.message : 'network' };
		}
	}

	async sendText(to: string, body: string): Promise<WaSendResult> {
		if (!to) return { kind: 'not_on_whatsapp' };
		try {
			const res = await fetch(`${GRAPH(this.apiVersion)}/${this.phoneNumberId}/messages`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messaging_product: 'whatsapp',
					recipient_type: 'individual',
					to,
					type: 'text',
					text: { body },
				}),
			});
			const data = (await res.json().catch(() => ({}))) as {
				messages?: { id: string }[];
				error?: { code?: number; message?: string };
			};
			if (!res.ok) return this.mapError(res.status, data.error?.code ?? null, data.error?.message ?? 'unknown');
			const wamid = data.messages?.[0]?.id;
			return wamid ? { kind: 'sent', waMessageId: wamid } : { kind: 'transient', detail: 'no wamid in response' };
		} catch (e) {
			return { kind: 'transient', detail: e instanceof Error ? e.message : 'network' };
		}
	}

	private mapError(status: number, code: number | null, message: string): WaSendResult {
		switch (code) {
			case 131049:
				return { kind: 'reengagement_blocked' }; // park 24h, never retry sooner
			case 131026:
				return { kind: 'not_on_whatsapp' }; // terminal
			case 80007:
				return { kind: 'not_on_whatsapp' }; // undeliverable -> terminal
			case 132001:
				return { kind: 'template_invalid' }; // terminal + founder alert
			case 130429:
				return { kind: 'rate_limited' };
			default:
				if (status === 429 || status >= 500) return { kind: 'rate_limited' };
				if (status === 401) return { kind: 'template_invalid' }; // bad token surfaces as config alert
				return { kind: 'transient', detail: `${status}:${message}` }; // unmapped defaults safe-retryable
		}
	}
}
