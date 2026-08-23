// 2-Way Interactive WhatsApp Cloud API Engine (v25.0).
// Handles interactive quick reply buttons, list pickers, PDF catalog delivery, and inbound webhook receipts.

import { RetryableError, TerminalError } from '../errors';

export interface WaInteractiveConfig {
	phoneId: string;
	token: string;
	apiVersion?: string;
}

export interface QuickReplyButton {
	id: string;
	title: string;
}

export interface InteractiveMessagePayload {
	to: string;
	headerText?: string;
	bodyText: string;
	footerText?: string;
	buttons: QuickReplyButton[];
}

export interface InteractiveListSection {
	title: string;
	rows: { id: string; title: string; description?: string }[];
}

export class WaInteractiveEngine {
	private apiVersion: string;

	constructor(private config: WaInteractiveConfig) {
		this.apiVersion = config.apiVersion ?? 'v25.0';
	}

	/**
	 * Send Interactive Quick Reply Button Message.
	 */
	async sendQuickReplyButtons(payload: InteractiveMessagePayload): Promise<{ messageId: string }> {
		const url = `https://graph.facebook.com/${this.apiVersion}/${this.config.phoneId}/messages`;

		const body = {
			messaging_product: 'whatsapp',
			recipient_type: 'individual',
			to: payload.to.replace(/\D/g, ''),
			type: 'interactive',
			interactive: {
				type: 'button',
				header: payload.headerText ? { type: 'text', text: payload.headerText } : undefined,
				body: { text: payload.bodyText },
				footer: payload.footerText ? { text: payload.footerText } : undefined,
				action: {
					buttons: payload.buttons.slice(0, 3).map((b) => ({
						type: 'reply',
						reply: { id: b.id, title: b.title.slice(0, 20) },
					})),
				},
			},
		};

		const res = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.config.token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!res.ok) {
			const errorData = (await res.json().catch(() => ({}))) as {
				error?: { code?: number; message?: string };
			};
			const code = errorData.error?.code ?? res.status;
			if (code === 131026) throw new TerminalError('WA_NOT_ON_WHATSAPP', 'Receiver not on WhatsApp', 131026);
			if (res.status === 429) throw new RetryableError('WA_THROTTLED', 'Rate limited');
			if (res.status >= 500) throw new RetryableError('WA_TRANSIENT', `WA 5xx: ${res.status}`);
			throw new TerminalError('WA_TEMPLATE_INVALID', errorData.error?.message ?? 'Interactive message failed', code);
		}

		const data = (await res.json()) as { messages?: { id: string }[] };
		return { messageId: data.messages?.[0]?.id ?? `wa_${Date.now()}` };
	}

	/**
	 * Send PDF Technical Catalog / Pump Curve document.
	 */
	async sendPdfDocument(to: string, documentUrl: string, filename: string, caption?: string): Promise<{ messageId: string }> {
		const url = `https://graph.facebook.com/${this.apiVersion}/${this.config.phoneId}/messages`;

		const body = {
			messaging_product: 'whatsapp',
			recipient_type: 'individual',
			to: to.replace(/\D/g, ''),
			type: 'document',
			document: {
				link: documentUrl,
				filename,
				caption,
			},
		};

		const res = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.config.token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!res.ok) {
			throw new RetryableError('WA_TRANSIENT', `PDF send failed: ${res.status}`);
		}

		const data = (await res.json()) as { messages?: { id: string }[] };
		return { messageId: data.messages?.[0]?.id ?? `wa_${Date.now()}` };
	}
}
