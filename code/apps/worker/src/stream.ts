// Server-Sent Events (SSE) Real-Time Telemetry & Dashboard Streaming Engine.

export type StreamEventType =
	| 'lead_ingested'
	| 'spec_qualified'
	| 'wa_dispatched'
	| 'wa_delivered'
	| 'wa_read'
	| 'voice_triggered'
	| 'voice_connected'
	| 'dispute_filed'
	| 'sla_ping';

export interface StreamEvent {
	type: StreamEventType;
	sellerId: string;
	leadId?: string;
	timestampMs: number;
	data: Record<string, unknown>;
}

// In-memory event ring buffer for reconnecting clients at the edge
const RECENT_EVENTS: StreamEvent[] = [];
const MAX_BUFFER = 100;

export function broadcastStreamEvent(event: StreamEvent): void {
	RECENT_EVENTS.unshift(event);
	if (RECENT_EVENTS.length > MAX_BUFFER) {
		RECENT_EVENTS.pop();
	}
}

export function getRecentStreamEvents(sellerId: string, limit = 20): StreamEvent[] {
	return RECENT_EVENTS.filter((e) => e.sellerId === sellerId).slice(0, limit);
}

/**
 * Creates an SSE ReadableStream for real-time dashboard telemetry.
 */
export function createSseStream(sellerId: string): ReadableStream {
	const encoder = new TextEncoder();

	return new ReadableStream({
		start(controller) {
			// Send initial connected greeting
			const initialMsg = `data: ${JSON.stringify({
				type: 'connected',
				sellerId,
				timestampMs: Date.now(),
				message: 'Lead Speed Telemetry Stream Connected (Edge)',
			})}\n\n`;
			controller.enqueue(encoder.encode(initialMsg));

			// Send buffered recent events for this seller
			const recent = getRecentStreamEvents(sellerId, 5);
			for (const evt of recent) {
				const eventMsg = `event: ${evt.type}\ndata: ${JSON.stringify(evt)}\n\n`;
				controller.enqueue(encoder.encode(eventMsg));
			}

			// Keepalive heartbeat every 15 seconds
			const interval = setInterval(() => {
				try {
					controller.enqueue(encoder.encode(`event: sla_ping\ndata: ${JSON.stringify({ ping: Date.now(), sla: '45s_active' })}\n\n`));
				} catch {
					clearInterval(interval);
				}
			}, 15000);
		},
	});
}
