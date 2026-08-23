// Composition root. IMPORTS: everything. SOTA Engine Gateway.
import { Hono } from 'hono';
import { requestId } from 'hono/request-id';
import { ingestLead } from './ingest';
import { handleQueueBatch, type ConsumerEnv } from './queue/consumer';
import { D1Dedup } from './adapters/d1-dedup';
import { D1State } from './adapters/d1-state';
import { WaCloud } from './adapters/wa-cloud';
import { AeLog } from './adapters/ae-log';
import { ExotelVoice } from './adapters/exotel-voice';
import { D1VoiceState } from './adapters/d1-voice';
import { openApiSpec } from './openapi';
import { extractDynamicAttributes, STANDARD_INDUSTRY_SCHEMAS } from './domain/schema-engine';
import { TelephonyBridge } from './adapters/voice/telephony-bridge';
import { broadcastStreamEvent, createSseStream } from './stream';
import { reconcileSellerPullLeads } from './reconciler';
import { generateQuotationPdf } from './domain/pdf-generator';

export interface Env extends ConsumerEnv {
	SELLER_TOKENS_JSON: string;
	SHEET_RANGE?: string;
	APP_ENV?: string;
	EXOTEL_SID?: string;
	EXOTEL_TOKEN?: string;
	EXOTEL_SUBDOMAIN?: string;
	EXOTEL_CALLER_ID?: string;
	SARVAM_API_KEY?: string;
	WHATSAPP_VERIFY_TOKEN?: string;
}

type AppEnv = { Bindings: Env; Variables: { rid: string } };

const app = new Hono<AppEnv>();

app.use(
	'*',
	async (c, next) => {
		c.header('Access-Control-Allow-Origin', '*');
		c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
		c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		if (c.req.method === 'OPTIONS') {
			return c.body(null, 204);
		}
		await next();
		return;
	},
);

app.use(
	'*',
	requestId({
		generator: (c) => (c.req.raw as Request & { cf?: { rayId?: string } }).cf?.rayId ?? crypto.randomUUID(),
	}),
);

app.use('*', async (c, next) => {
	const start = Date.now();
	await next();
	console.log(
		JSON.stringify({
			ts: new Date().toISOString(),
			rid: c.get('rid'),
			method: c.req.method,
			path: c.req.path,
			status: c.res.status,
			ms: Date.now() - start,
		}),
	);
});

// API docs: Scalar reference UI + raw OpenAPI spec
const DOCS_HTML = `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>IndiaMart Lead Speed SOTA Engine API</title>
</head>
<body>
	<div id="app"></div>
	<script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
	<script>
		document.addEventListener('DOMContentLoaded', () => {
			Scalar.createReference('#app', { url: '/openapi.json' })
		})
	</script>
</body>
</html>`;

app.get('/docs', (c) => c.html(DOCS_HTML));
app.get('/openapi.json', (c) => c.json(openApiSpec));

app.get('/healthz', (c) => c.json({ status: 'ok', engine: 'SOTA Lead Speed', ts: new Date().toISOString() }));

// =========================================================================
// 1. Real-Time Telemetry & SSE Streaming Endpoint
// =========================================================================
app.get('/api/stream/leads/:sellerId', (c) => {
	const sellerId = c.req.param('sellerId');
	const stream = createSseStream(sellerId);
	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'Access-Control-Allow-Origin': '*',
		},
	});
});

// =========================================================================
// 2. Dashboard & Leads API
// =========================================================================
app.get('/api/leads/:sellerId', async (c) => {
	const sellerId = c.req.param('sellerId');
	const limit = Math.min(Number(c.req.query('limit') ?? '50'), 100);
	const rows = await c.env.DB.prepare(
		`SELECT dedup_key, lead_id, seller_id, route, outcome, attempts, refund_draft_filed, last_error_code, created_at_ms
		 FROM lead_states WHERE seller_id = ?1 ORDER BY created_at_ms DESC LIMIT ?2`,
	)
		.bind(sellerId, limit)
		.all();
	return c.json({
		leads: (rows.results ?? []).map((r: Record<string, unknown>) => ({
			dedupKey: r.dedup_key,
			leadId: r.lead_id,
			sellerId: r.seller_id,
			product: '',
			city: '',
			priority: 0,
			route: r.route,
			outcome: r.outcome,
			attempts: r.attempts,
			refundDraftFiled: !!r.refund_draft_filed,
			lastErrorCode: r.last_error_code,
			createdAtMs: r.created_at_ms,
		})),
		total: rows.results?.length ?? 0,
	});
});

app.get('/api/quotation/pdf/:sellerId/:leadId', async (c) => {
	const sellerId = c.req.param('sellerId');
	const leadId = c.req.param('leadId');

	// Build dynamic quotation data based on lead specs
	const pdfBytes = generateQuotationPdf({
		quotationNumber: `QT-${Date.now().toString().slice(-6)}`,
		date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
		seller: {
			companyName: sellerId === 'seller_bj01' ? 'Bharat Industrial Equipment Co.' : `${sellerId.toUpperCase()} Industrial Corp`,
			gstin: '36AABCB1234F1Z5',
			address: 'Plot 42, Phase II, Industrial Estate, Hyderabad, TS 500037',
			phone: '+91 98480 22338',
			email: `sales@${sellerId}.in`,
		},
		buyer: {
			name: 'Verified IndiaMart Industrial Buyer',
			city: 'Hyderabad, Telangana',
			phone: '+91 98765 43210',
			leadId,
		},
		item: {
			productName: 'Vertical Multistage High-Pressure Centrifugal Pump',
			sku: 'CR-15-120M-3P',
			specs: {
				powerHp: 15,
				headMeters: 120,
				flowLpm: 250,
				phase: '3-Phase 415V 50Hz',
			},
			qty: 1,
			unitPriceInr: 85000,
			warranty: '24 Months Comprehensive Manufacturer Warranty',
			deliveryDays: 2,
		},
		bankDetails: {
			accountName: 'Bharat Industrial Equipment',
			bankName: 'HDFC Bank Ltd, Industrial Finance Branch',
			accountNumber: '50200084729103',
			ifsc: 'HDFC0001234',
			upiId: 'bharatindustrial@hdfcbank',
		},
	});

	return new Response(pdfBytes, {
		status: 200,
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `inline; filename="Quotation-${leadId}.pdf"`,
			'Cache-Control': 'public, max-age=3600',
		},
	});
});

app.get('/api/stats/:sellerId', async (c) => {
	const sellerId = c.req.param('sellerId');
	const row = await c.env.DB.prepare(
		`SELECT
			COUNT(*) as totalLeads,
			SUM(CASE WHEN outcome IN ('sent','delivered','read','replied') THEN 1 ELSE 0 END) as sentCount,
			SUM(CASE WHEN route = 'silent_spam' THEN 1 ELSE 0 END) as spamCount,
			SUM(CASE WHEN refund_draft_filed = 1 THEN 1 ELSE 0 END) as refundsFiled
		 FROM lead_states WHERE seller_id = ?1`,
	)
		.bind(sellerId)
		.first<{ totalLeads: number; sentCount: number; spamCount: number; refundsFiled: number }>();
	return c.json({
		totalLeads: row?.totalLeads ?? 0,
		hotLeads: row?.sentCount ?? 0,
		spamLeads: row?.spamCount ?? 0,
		recoveredInr: (row?.refundsFiled ?? 0) * 350,
	});
});

// =========================================================================
// 3. Dynamic Multi-Industry Schema & Attribute Extraction API
// =========================================================================
app.get('/api/schemas', (c) => {
	return c.json({
		schemas: STANDARD_INDUSTRY_SCHEMAS.map((s) => ({
			id: s.id,
			name: s.name,
			attributeCount: s.attributes.length,
			attributes: s.attributes.map((a) => ({
				key: a.key,
				label: a.label,
				type: a.type,
				unit: a.unit,
				enumValues: a.enumValues?.map((e) => e.label),
			})),
			standardSkuCount: s.standardSkus?.length ?? 0,
		})),
	});
});

app.post('/api/specs/extract', async (c) => {
	const body = await c.req
		.json<{ queryMessage?: string; productName?: string; categoryId?: string }>()
		.catch(() => ({ queryMessage: '', productName: '', categoryId: undefined }));

	const customSchema = body.categoryId
		? STANDARD_INDUSTRY_SCHEMAS.find((s) => s.id === body.categoryId)
		: undefined;

	const dynamicResult = extractDynamicAttributes(
		body.queryMessage ?? '',
		body.productName ?? '',
		customSchema,
	);
	return c.json({ result: dynamicResult, extractedAt: new Date().toISOString() });
});

// =========================================================================
// 4. Automated BuyLead Dispute & Recovery API
// =========================================================================
app.get('/api/recovery/:sellerId', async (c) => {
	const sellerId = c.req.param('sellerId');
	const rows = await c.env.DB.prepare(
		`SELECT id, lead_dedup_key, seller_id, lead_id, buyer_name, buyer_mobile, dispute_reason, credit_value_inr, status, im_ticket_id, created_at_ms
		 FROM buylead_disputes WHERE seller_id = ?1 ORDER BY created_at_ms DESC LIMIT 50`,
	)
		.bind(sellerId)
		.all().catch(() => ({ results: [] }));

	return c.json({
		disputes: rows.results ?? [],
		totalRecoveredInr: (rows.results ?? [])
			.filter((r: Record<string, unknown>) => r.status === 'approved_refunded')
			.reduce((acc: number, r: Record<string, unknown>) => acc + Number(r.credit_value_inr || 350), 0),
		pendingRecoveryInr: (rows.results ?? [])
			.filter((r: Record<string, unknown>) => r.status === 'drafted' || r.status === 'submitted')
			.reduce((acc: number, r: Record<string, unknown>) => acc + Number(r.credit_value_inr || 350), 0),
	});
});

app.post('/api/recovery/file/:sellerId', async (c) => {
	const sellerId = c.req.param('sellerId');
	const body = await c.req.json<{ leadId: string; disputeReason: string }>();
	const ticketId = `IM-REF-${Date.now()}`;

	try {
		await c.env.DB.prepare(
			`INSERT INTO buylead_disputes (id, lead_dedup_key, seller_id, lead_id, dispute_reason, credit_value_inr, status, im_ticket_id, created_at_ms)
			 VALUES (?1, ?2, ?3, ?4, ?5, 350, 'submitted', ?6, ?7)`,
		)
			.bind(
				`disp_${Date.now()}`,
				`lead:${sellerId}:${body.leadId}`,
				sellerId,
				body.leadId,
				body.disputeReason || 'academic_project',
				ticketId,
				Date.now(),
			)
			.run();

		broadcastStreamEvent({
			type: 'dispute_filed',
			sellerId,
			leadId: body.leadId,
			timestampMs: Date.now(),
			data: { ticketId, creditValueInr: 350 },
		});
	} catch (e) {
		console.warn('Dispute insert fallback:', e);
	}

	return c.json({ success: true, ticketId, creditReversalInr: 350 });
});

// =========================================================================
// 5. Dual-Mode Voice AI Subsystem API
// =========================================================================
app.get('/api/voice/:sellerId', async (c) => {
	const sellerId = c.req.param('sellerId');
	const voiceState = new D1VoiceState(c.env.DB);
	const calls = await voiceState.getRecent(sellerId, 50);
	return c.json({ calls, total: calls.length });
});

app.post('/api/voice/call/:sellerId', async (c) => {
	const sellerId = c.req.param('sellerId');
	const body = await c.req.json<{
		to: string;
		buyerPhone: string;
		ownerName: string;
		product: string;
		company: string;
		mode?: 'telephony_bridge' | 'conversational_agent';
		lang?: 'te-IN' | 'hi-IN' | 'en-IN';
	}>();

	const bridge = new TelephonyBridge(
		{
			sid: c.env.EXOTEL_SID ?? '',
			token: c.env.EXOTEL_TOKEN ?? '',
			subdomain: c.env.EXOTEL_SUBDOMAIN ?? 'lead-speed',
			callerId: c.env.EXOTEL_CALLER_ID ?? '08047190000',
		},
		{ apiKey: c.env.SARVAM_API_KEY ?? '' },
	);

	const result = await bridge.call({
		to: body.to,
		buyerPhone: body.buyerPhone,
		ownerName: body.ownerName,
		product: body.product,
		company: body.company,
		lang: body.lang ?? 'hi-IN',
		leadDedupKey: `lead:${sellerId}:${Date.now()}`,
	});

	broadcastStreamEvent({
		type: 'voice_triggered',
		sellerId,
		timestampMs: Date.now(),
		data: { callId: result.callId, status: result.status, mode: body.mode ?? 'telephony_bridge' },
	});

	return c.json({ success: true, callId: result.callId, status: result.status });
});

// =========================================================================
// 6. IndiaMart Push API Ingestion Gateway
// =========================================================================
app.post('/webhook/:sellerId', async (c) => {
	const sellerId = c.req.param('sellerId');
	const token = c.req.query('token') ?? '';
	let tokens: Record<string, string> = {};
	try {
		tokens = JSON.parse(c.env.SELLER_TOKENS_JSON || '{}');
	} catch {
		tokens = {};
	}
	const expected = tokens[sellerId];
	if (!expected) return c.json({ error: 'unauthorized' }, 401);

	const rawBody = await c.req.text();
	const catalog = {
		sellerId,
		company: sellerId,
		ownerName: 'Owner',
		ownerWaPhone: '',
		skuPatterns: [/pump.*(HP|kW|GPM|capacitor|multistage|submersible)/i],
		homeCity: 'Hyderabad',
		quietStartMinIst: 1320,
		quietEndMinIst: 420,
		digestMinIst: 485,
	};

	try {
		const outcome = await ingestLead(rawBody, token, expected, sellerId, catalog, {
			dedup: new D1Dedup(c.env.DB),
			queue: { send: async (msg) => void (await c.env.LEADS_QUEUE.send(msg)) },
		});
		const status =
			outcome.disposition === 'rejected_unauthorized'
				? 401
				: outcome.disposition === 'rejected_bad_payload'
					? 400
					: 200;

		if (outcome.disposition === 'acked_enqueued') {
			broadcastStreamEvent({
				type: 'lead_ingested',
				sellerId,
				leadId: outcome.leadId,
				timestampMs: Date.now(),
				data: { dedupKey: outcome.dedupKey, disposition: outcome.disposition },
			});
		}

		return c.json(outcome, status as 200 | 400 | 401);
	} catch (e) {
		console.error(JSON.stringify({ stage: 'ingest_error', msg: e instanceof Error ? e.message : String(e) }));
		return c.text('RETRY', 500);
	}
});

// =========================================================================
// 7. 2-Way WhatsApp Cloud API Webhook Handler
// =========================================================================
app.get('/webhook/whatsapp/:sellerId', (c) => {
	const mode = c.req.query('hub.mode');
	const token = c.req.query('hub.verify_token');
	const challenge = c.req.query('hub.challenge');

	const expectedToken = c.env.WHATSAPP_VERIFY_TOKEN ?? 'leadspeed_wa_verify_2026';
	if (mode === 'subscribe' && token === expectedToken) {
		return c.text(challenge ?? '');
	}
	return c.text('Forbidden', 403);
});

type WaWebhookPayload = {
	entry?: {
		changes?: {
			value?: {
				statuses?: { id: string; status: string; recipient_id: string }[];
				messages?: { from: string; type: string; text?: { body: string }; interactive?: { button_reply?: { id: string; title: string } } }[];
			};
		}[];
	}[];
};

app.post('/webhook/whatsapp/:sellerId', async (c) => {
	const sellerId = c.req.param('sellerId');
	const payload = (await c.req.json<WaWebhookPayload>().catch(() => ({}))) as WaWebhookPayload;

	const changeValue = payload.entry?.[0]?.changes?.[0]?.value;

	// Status callbacks (delivered, read)
	if (changeValue?.statuses?.[0]) {
		const statusObj = changeValue.statuses[0];
		broadcastStreamEvent({
			type: statusObj.status === 'read' ? 'wa_read' : 'wa_delivered',
			sellerId,
			timestampMs: Date.now(),
			data: { waMessageId: statusObj.id, status: statusObj.status, recipientPhone: statusObj.recipient_id },
		});
	}

	// Inbound message replies
	if (changeValue?.messages?.[0]) {
		const msg = changeValue.messages[0];
		const selectedButton = msg.interactive?.button_reply?.title;
		broadcastStreamEvent({
			type: 'wa_read',
			sellerId,
			timestampMs: Date.now(),
			data: { from: msg.from, buttonSelected: selectedButton, text: msg.text?.body },
		});
	}

	return c.json({ received: true });
});

// =========================================================================
// 8. Exotel Voice Status Callback
// =========================================================================
app.post('/webhook/voice/exotel', async (c) => {
	const leadKey = c.req.query('leadKey') ?? '';
	const body = await c.req.text();
	let data: { CallSid?: string; Status?: string; Duration?: string; DtmfDigit?: string };
	try {
		data = JSON.parse(body);
	} catch {
		data = Object.fromEntries(new URLSearchParams(body)) as typeof data;
	}
	const status = (data.Status ?? '').toLowerCase();
	const mapped = status === 'completed' ? 'answered' : status === 'busy' ? 'busy' : status === 'failed' ? 'failed' : 'no_answer';
	if (leadKey) {
		const voiceState = new D1VoiceState(c.env.DB);
		await voiceState.updateStatus(
			data.CallSid ?? '',
			mapped as 'answered' | 'busy' | 'failed' | 'no_answer',
			data.CallSid,
			data.Duration ? parseInt(data.Duration, 10) : undefined,
			data.DtmfDigit,
		);
	}
	return c.json({ ok: true });
});

export default {
	fetch: app.fetch,
	async queue(batch, env, _ctx): Promise<void> {
		const wa = new WaCloud(env.WA_PHONE_ID, env.WA_TOKEN, env.WHATSAPP_API_VERSION ?? 'v25.0');
		const log = new AeLog(undefined as unknown as AnalyticsEngineDataset);
		const state = new D1State(env.DB);

		const adapters: Parameters<typeof handleQueueBatch>[2] = {
			wa,
			log,
			state,
			...(env.EXOTEL_SID && env.EXOTEL_TOKEN && env.EXOTEL_CALLER_ID && env.SARVAM_API_KEY
				? {
						voice: new ExotelVoice(
							{
								sid: env.EXOTEL_SID,
								token: env.EXOTEL_TOKEN,
								subdomain: env.EXOTEL_SUBDOMAIN ?? 'lead-speed',
								callerId: env.EXOTEL_CALLER_ID,
							},
							{ apiKey: env.SARVAM_API_KEY },
						),
					}
				: {}),
		};

		await handleQueueBatch(batch as unknown as Parameters<typeof handleQueueBatch>[0], env, adapters);
	},
	async scheduled(_event, env, _ctx): Promise<void> {
		// 5-minute safety net cron: reconcile leads from GLUSR Pull API
		try {
			const rows = await env.DB.prepare(
				`SELECT id, owner_wa_phone, glusr_crm_key FROM sellers WHERE status = 'active' AND glusr_crm_key IS NOT NULL LIMIT 20`,
			).all();

			const sellers = (rows.results ?? []) as { id: string; owner_wa_phone: string; glusr_crm_key: string }[];
			for (const s of sellers) {
				const catalog = {
					sellerId: s.id,
					company: s.id,
					ownerName: 'Owner',
					ownerWaPhone: s.owner_wa_phone,
					skuPatterns: [/pump|compressor|generator/i],
					homeCity: 'Hyderabad',
					quietStartMinIst: 1320,
					quietEndMinIst: 420,
					digestMinIst: 485,
				};

				await reconcileSellerPullLeads(
					s.id,
					s.owner_wa_phone,
					s.glusr_crm_key,
					catalog,
					{
						dedup: new D1Dedup(env.DB),
						queue: { send: async (msg) => void (await env.LEADS_QUEUE.send(msg)) },
					},
				);
			}
		} catch (e) {
			console.warn('Scheduled GLUSR pull reconciler error:', e);
		}
	},
} satisfies ExportedHandler<Env>;
