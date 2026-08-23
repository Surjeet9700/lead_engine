// Error taxonomy. IMPORTS: nothing.
// Consumer contract: RetryableError => throw (CF redelivers); TerminalError => ack + log, never retried.

export type ErrorCode =
	| 'WA_REENGAGEMENT_BLOCKED' // 131049 — park 24h
	| 'WA_NOT_ON_WHATSAPP' // 131026 — terminal
	| 'WA_UNDELIVERABLE' // 80007 — terminal
	| 'WA_TEMPLATE_INVALID' // 132001 — terminal + founder alert
	| 'WA_THROTTLED' // 130429 / HTTP 429
	| 'WA_TRANSIENT' // 5xx / network
	| 'WA_BAD_TOKEN' // 401 — terminal + seller alert
	| 'QUEUE_SEND_FAILED'
	| 'STATE_WRITE_FAILED'
	| 'UNMAPPED'; // defaults safe: retryable, capped by maxRetries

export class TerminalError extends Error {
	readonly code: ErrorCode;
	readonly waCode: number | null;
	constructor(code: ErrorCode, message: string, waCode: number | null = null) {
		super(message);
		this.name = 'TerminalError';
		this.code = code;
		this.waCode = waCode;
	}
}

export class RetryableError extends Error {
	readonly code: ErrorCode;
	readonly detail: string;
	constructor(code: ErrorCode, detail: string) {
		super(`${code}: ${detail}`);
		this.name = 'RetryableError';
		this.code = code;
		this.detail = detail;
	}
}

export function isTerminal(e: unknown): e is TerminalError {
	return e instanceof TerminalError;
}
