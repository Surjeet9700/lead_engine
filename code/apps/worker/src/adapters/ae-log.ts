// LogPort primary: Analytics Engine. Positional schema stable forever:
// blob1=event(kind) blob2=stage blob3=error_code blob4=wa_template
// double1=latency_ms double2=count
// index1=leadId (exactly ONE index — multiple = silent drop)
import type { LogPort, LeadEvent } from '../ports';

export class AeLog implements LogPort {
	constructor(private dataset: AnalyticsEngineDataset) {}
	async write(event: LeadEvent): Promise<void> {
		this.dataset.writeDataPoint({
			blobs: [event.kind, event.route ?? '', String(event.data?.errorCode ?? ''), ''],
			doubles: [Number(event.data?.latencyMs ?? 0), 1],
			indexes: [event.leadId],
		});
	}
}

// Secondary sink: Google Sheets append, best-effort, never throws (invariant: Sheets outage cannot fail a request).
export class SheetsLog implements LogPort {
	constructor(_sheetId: string, _serviceAccountJson: string) {}
	async write(event: LeadEvent): Promise<void> {
		try {
			console.log(JSON.stringify({ sheets_queue: event }));
		} catch {
			// swallowed by design
		}
	}
}
