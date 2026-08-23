// Test harness: InMemory ports wired into Ports. <2s deterministic loop.
// Mirrors D1 atomic claim semantics (sync check-and-set) and CF Queue ack/retry/DLQ.
import type { DedupPort, QueuePort, LogPort, WaPort, WaSendResult, EnqueuedLead, LeadEvent } from '../src/ports';
import type { Decision } from '../src/domain';

export class InMemoryDedup implements DedupPort {
	private claimed = new Set<string>();
	async claim(key: string, _leadId: string, _sellerId: string): Promise<boolean> {
		if (this.claimed.has(key)) return false;
		this.claimed.add(key);
		return true;
	}
	has(key: string): boolean {
		return this.claimed.has(key);
	}
	reset(): void {
		this.claimed.clear();
	}
}

export class InMemoryQueue implements QueuePort {
	items: EnqueuedLead[] = [];
	async send(msg: EnqueuedLead): Promise<void> {
		this.items.push(msg);
	}
}

export class InMemoryLog implements LogPort {
	events: LeadEvent[] = [];
	async write(event: LeadEvent): Promise<void> {
		this.events.push(event);
	}
}

export interface FakeWaScript {
	failOnCall?: number;
	result?: WaSendResult;
}

export class FakeWA implements WaPort {
	sent: { to: string; templateKey: string; vars: string[] }[] = [];
	callSequence: string[] = [];
	private callCount = 0;
	constructor(private script?: FakeWaScript) {}
	async sendTemplate(input: { to: string; templateKey: string; vars: string[] }): Promise<WaSendResult> {
		this.callCount += 1;
		this.callSequence.push('send');
		if (this.script?.failOnCall === this.callCount) return this.script.result ?? { kind: 'rate_limited' };
		const id = `wamid_${this.callCount}`;
		this.sent.push(input);
		return { kind: 'sent', waMessageId: id };
	}
	get calls(): number {
		return this.callCount;
	}
}

export function createTestHarness(opts?: { waScript?: FakeWaScript }) {
	const dedup = new InMemoryDedup();
	const queue = new InMemoryQueue();
	const log = new InMemoryLog();
	const wa = new FakeWA(opts?.waScript);
	return { dedup, queue, log, wa };
}

export type Harness = ReturnType<typeof createTestHarness>;
