// Interfaces ONLY. IMPORTS: domain (types).
import type { NormalizedLead, Catalog, Decision } from './domain';

export type WaSendResult =
	| { kind: 'sent'; waMessageId: string }
	| { kind: 'rate_limited' }
	| { kind: 'reengagement_blocked' }
	| { kind: 'not_on_whatsapp' }
	| { kind: 'template_invalid' }
	| { kind: 'transient'; detail: string };

export interface WaPort {
	sendTemplate(input: { to: string; templateKey: string; vars: string[] }): Promise<WaSendResult>;
	sendText(to: string, body: string): Promise<WaSendResult>;
}

/** Atomic by contract. Winner iff returns true. Mirrors D1 INSERT..ON CONFLICT DO NOTHING. */
export interface DedupPort {
	claim(key: string, leadId: string, sellerId: string): Promise<boolean>;
}

export interface QueuePort {
	send(msg: EnqueuedLead): Promise<void>; // throws => ingest returns 500
}

export interface LogPort {
	write(event: LeadEvent): Promise<void>;
}

export interface StatePort {
	upsertReceived(lead: NormalizedLead, dedupKey: string, nowMs: number): Promise<boolean>;
	markSent(leadId: string, waMessageId: string, atMs: number): Promise<void>;
	markDeferred(leadId: string, deferUntilMs: number): Promise<void>;
	markPermanentFailure(leadId: string, errorCode: number | null, atMs: number): Promise<void>;
	bumpAttempts(leadId: string): Promise<number>;
	markDead(leadId: string, attempts: number): Promise<void>;
}

export interface ScorePort {
	score(lead: NormalizedLead, catalog: Catalog): Promise<{ priority: number; reason: string }>;
}

export type VoiceCallStatus = 'queued' | 'dialling' | 'answered' | 'connected' | 'no_answer' | 'busy' | 'failed';

export interface VoicePort {
	call(input: {
		to: string;
		buyerPhone: string;
		ownerName: string;
		product: string;
		company: string;
		lang?: string;
		leadDedupKey: string;
	}): Promise<{ callId: string; status: VoiceCallStatus; exotelCallSid?: string }>;
	checkStatus(callSid: string): Promise<'answered' | 'no_answer' | 'busy' | 'failed'>;
}

export interface Ports {
	wa: WaPort;
	log: LogPort;
	state: StatePort;
	llm?: ScorePort;
	voice?: VoicePort;
}

export interface EnqueuedLead {
	v: 1;
	lead: NormalizedLead;
	catalog: Catalog;
	dedupKey: string;
}

export interface LeadEvent {
	at: number;
	kind: 'received' | 'decided' | 'wa_result' | 'deferred' | 'failed' | 'dead';
	sellerId: string;
	leadId: string;
	route?: Decision['route'];
	data?: Record<string, string | number | boolean | null>;
}
