// IndiaMart GLUSR Pull API Safety Net Reconciler.
// Scheduled cron reconciles any leads dropped due to network partitions or seller downtime.

import type { DedupPort, QueuePort } from './ports';
import { normalizeLead } from './schemas/lead';
import { dedupKeysFor, type Catalog, type NormalizedLead } from './domain';

export interface GlusrLeadRecord {
	UNIQUE_QUERY_ID: string;
	SENDER_NAME?: string;
	SENDER_MOBILE?: string;
	QUERY_PRODUCT_NAME?: string;
	QUERY_MESSAGE?: string;
	SENDER_CITY?: string;
	CALL_DURATION?: string;
	QUERY_TIME?: string;
}

export interface GlusrApiResponse {
	STATUS?: string;
	CODE?: number;
	MESSAGE?: string;
	RESPONSE?: GlusrLeadRecord[];
}

export async function reconcileSellerPullLeads(
	sellerId: string,
	glusrMobile: string,
	glusrKey: string,
	catalog: Catalog,
	ports: { dedup: DedupPort; queue: QueuePort },
	now = new Date(),
): Promise<{ fetchedCount: number; newLeadsEnqueued: number }> {
	if (!glusrKey) return { fetchedCount: 0, newLeadsEnqueued: 0 };

	// Format start_time (last 30 minutes) and end_time per IndiaMart format (DD-MMM-YYYY HH:mm:ss)
	const startTime = new Date(now.getTime() - 30 * 60 * 1000);
	const formatDate = (d: Date) => {
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const day = String(d.getUTCDate()).padStart(2, '0');
		const month = months[d.getUTCMonth()];
		const year = d.getUTCFullYear();
		const hours = String(d.getUTCHours()).padStart(2, '0');
		const min = String(d.getUTCMinutes()).padStart(2, '0');
		const sec = String(d.getUTCSeconds()).padStart(2, '0');
		return `${day}-${month}-${year} ${hours}:${min}:${sec}`;
	};

	const url = `https://mapi.indiamart.com/wservce/crm/crmListing/v2/?glusr_mobile=${encodeURIComponent(glusrMobile)}&glusr_mobile_key=${encodeURIComponent(glusrKey)}&start_time=${encodeURIComponent(formatDate(startTime))}&end_time=${encodeURIComponent(formatDate(now))}`;

	let fetchedCount = 0;
	let newLeadsEnqueued = 0;

	try {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) return { fetchedCount: 0, newLeadsEnqueued: 0 };

		const data = (await res.json()) as GlusrApiResponse;
		const records = data.RESPONSE ?? [];
		fetchedCount = records.length;

		for (const record of records) {
			if (!record.UNIQUE_QUERY_ID) continue;

			const rawPushRecord = {
				UNIQUE_QUERY_ID: record.UNIQUE_QUERY_ID,
				QUERY_TYPE: 'W',
				QUERY_TIME: record.QUERY_TIME ?? new Date().toISOString(),
				SENDER_NAME: record.SENDER_NAME ?? '',
				SENDER_MOBILE: record.SENDER_MOBILE ?? '',
				SENDER_PHONE: '',
				QUERY_PRODUCT_NAME: record.QUERY_PRODUCT_NAME ?? '',
				QUERY_MESSAGE: record.QUERY_MESSAGE ?? '',
				SENDER_CITY: record.SENDER_CITY ?? '',
				CALL_DURATION: record.CALL_DURATION ?? '0',
			};

			const normalized: NormalizedLead = normalizeLead(rawPushRecord, sellerId, 'pull');
			const { exact } = dedupKeysFor(normalized);

			const isNew = await ports.dedup.claim(exact, normalized.leadId, sellerId);
			if (isNew) {
				await ports.queue.send({ v: 1, lead: normalized, catalog, dedupKey: exact });
				newLeadsEnqueued++;
			}
		}
	} catch (e) {
		console.warn(`GLUSR pull reconciliation failed for seller ${sellerId}:`, e);
	}

	return { fetchedCount, newLeadsEnqueued };
}
