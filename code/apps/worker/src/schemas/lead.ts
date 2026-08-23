// zod schemas: RawIndiaMartPayload -> NormalizedLead. IMPORTS: domain (types only).
// IndiaMart sends JSON {CODE, STATUS, RESPONSE:{...}} primary; urlencoded RESPONSE= legacy fallback.
// QUERY_TIME is IST-naive "YYYY-MM-DD HH:mm:ss" — parse with +05:30 or quiet-hours skews 5.5h.
// Empty strings, not null, for absent fields. Landline SENDER_PHONE is not WA-reachable.
import { z } from 'zod';
import type { NormalizedLead } from '../domain';

const istWallToMs = (s: string): number => {
	const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(s);
	if (!m?.[1] || !m[2] || !m[3] || !m[4] || !m[5] || !m[6]) return Date.now();
	return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6])) - 330 * 60_000;
};

export const normalizePhone = (raw: string): string | null => {
	const digits = raw.replace(/[^\d]/g, '');
	if (digits.length < 10) return null;
	return digits.slice(-12).replace(/^0+(?=91\d{10}$)/, '').replace(/^0(\d{10})$/, '91$1') || digits.slice(-10);
};

const ResponseSchema = z
	.object({
		UNIQUE_QUERY_ID: z.string().min(1),
		QUERY_TYPE: z.string().catch(''),
		QUERY_TIME: z.string().catch(''),
		SENDER_NAME: z.string().catch(''),
		SENDER_MOBILE: z.string().catch(''),
		SENDER_PHONE: z.string().catch(''),
		QUERY_PRODUCT_NAME: z.string().catch(''),
		QUERY_MESSAGE: z.string().catch(''),
		SENDER_CITY: z.string().catch(''),
		CALL_DURATION: z.union([z.string(), z.number()]).catch(''),
	})
	.passthrough();

export const PushEnvelopeSchema = z.object({ RESPONSE: ResponseSchema });

export const RawLeadSchema = ResponseSchema;

export function normalizeLead(
	raw: z.infer<typeof RawLeadSchema>,
	sellerId: string,
	source: 'push' | 'gmail' | 'pull',
): NormalizedLead {
	const mobile = normalizePhone(raw.SENDER_MOBILE) ?? normalizePhone(raw.SENDER_PHONE);
	const callDur = typeof raw.CALL_DURATION === 'number' ? raw.CALL_DURATION : parseInt(raw.CALL_DURATION || '0', 10);
	return {
		leadId: raw.UNIQUE_QUERY_ID,
		sellerId,
		mobile,
		productName: raw.QUERY_PRODUCT_NAME ?? '',
		queryMessage: raw.QUERY_MESSAGE ?? '',
		city: raw.SENDER_CITY ?? '',
		callDurationSec: Number.isNaN(callDur) ? 0 : callDur,
		source,
		receivedAtMs: raw.QUERY_TIME ? istWallToMs(raw.QUERY_TIME) : Date.now(),
	};
}

/** Parse either JSON envelope {RESPONSE:{...}} or bare lead object or urlencoded RESPONSE=. */
export function parsePushBody(rawBody: string): z.infer<typeof RawLeadSchema> {
	let parsed: unknown;
	try {
		parsed = JSON.parse(rawBody);
	} catch {
		const params = new URLSearchParams(rawBody);
		const resp = params.get('RESPONSE');
		if (!resp) throw new Error('unparseable body');
		parsed = JSON.parse(resp);
	}
	const env = PushEnvelopeSchema.safeParse(parsed);
	if (env.success) return env.data.RESPONSE;
	const direct = RawLeadSchema.safeParse(parsed);
	if (direct.success) return direct.data;
	throw new Error('missing UNIQUE_QUERY_ID');
}
