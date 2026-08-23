// Monitoring cron: scheduled checks -> Telegram alerts. IMPORTS: nothing.
// Contract: every check queries D1 directly; each alert kind is rate-limited to 1/hour via KV,
// so a persistent failure pages once, not on every cron tick.

export interface MonitoringEnv {
	DB: D1Database;
	ALERT_KV: KVNamespace;
	TELEGRAM_BOT_TOKEN: string;
	TELEGRAM_CHAT_ID: string;
}

type Severity = 'info' | 'warn' | 'critical';

const RATE_LIMIT_MS = 60 * 60 * 1000;
const KV_TTL_S = 3700; // outlive the rate-limit window, then self-clean
const WA_ERROR_RATE_THRESHOLD = 0.05;
const DLQ_CRITICAL_DEPTH = 25;

function kvKey(check: string): string {
	return `monitor:last_alerted_at:${check}`;
}

async function sendTelegramAlert(env: MonitoringEnv, message: string, severity: Severity): Promise<boolean> {
	const tag = severity === 'critical' ? '[CRITICAL]' : severity === 'warn' ? '[WARN]' : '[INFO]';
	const text = `${tag} LSE Monitor\n${message}`;
	try {
		const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
		});
		return res.ok;
	} catch {
		return false;
	}
}

// Sends only if this check hasn't fired in the last hour. Timestamp recorded in KV
// only after a successful Telegram send so failed sends retry on the next cron tick.
async function alertOnce(
	env: MonitoringEnv,
	check: string,
	message: string,
	severity: Severity,
): Promise<void> {
	const lastRaw = await env.ALERT_KV.get(kvKey(check));
	if (lastRaw && Date.now() - Number(lastRaw) < RATE_LIMIT_MS) return;
	if (await sendTelegramAlert(env, message, severity)) {
		await env.ALERT_KV.put(kvKey(check), String(Date.now()), { expirationTtl: KV_TTL_S });
	}
}

// Check 1: dead-lettered leads are lost replies — any nonzero depth alerts.
async function checkDlqDepth(env: MonitoringEnv): Promise<void> {
	const row = await env.DB.prepare(`SELECT COUNT(*) AS depth FROM lead_states WHERE outcome = 'dead_lettered'`)
		.first<{ depth: number }>();
	const depth = row?.depth ?? 0;
	if (depth === 0) return;
	await alertOnce(
		env,
		'dlq_depth',
		`DLQ depth is ${depth}. Dead-lettered leads need replay before refund SLAs lapse.`,
		depth >= DLQ_CRITICAL_DEPTH ? 'critical' : 'warn',
	);
}

// Check 2: an active seller with zero leads in 24h usually means a broken webhook token
// or IndiaMart stopped pushing. Sellers onboarded <24h ago are excluded to avoid false alarms.
async function checkSilentSellers(env: MonitoringEnv, cutoffMs: number): Promise<void> {
	const { results } = await env.DB.prepare(
		`SELECT s.id AS seller_id, s.company FROM sellers s
		 WHERE s.status = 'active'
		   AND s.created_at_ms < ?1
		   AND NOT EXISTS (
		     SELECT 1 FROM lead_states ls
		     WHERE ls.seller_id = s.id AND ls.created_at_ms > ?1
		   )`,
	)
		.bind(cutoffMs)
		.all<{ seller_id: string; company: string }>();
	const silent = results ?? [];
	if (silent.length === 0) return;
	const list = silent.map((r) => `${r.seller_id} (${r.company})`).join(', ');
	await alertOnce(
		env,
		'silent_sellers',
		`No leads received in 24h for: ${list}. Verify IndiaMart push delivery.`,
		'warn',
	);
}

// Check 3: WA error rate over total leads ingested in the last hour.
// Terminal outcomes count as errors; needs >=5 leads in the window to be statistically meaningful.
async function checkWaErrorRate(env: MonitoringEnv, hourAgoMs: number): Promise<void> {
	const row = await env.DB.prepare(
		`SELECT COUNT(*) AS total,
			SUM(CASE WHEN outcome IN ('failed_permanent', 'dead_lettered') THEN 1 ELSE 0 END) AS errors
		 FROM lead_states
		 WHERE created_at_ms > ?1`,
	)
		.bind(hourAgoMs)
		.first<{ total: number; errors: number }>();
	const total = row?.total ?? 0;
	if (total < 5) return;
	const errorRate = (row?.errors ?? 0) / total;
	if (errorRate <= WA_ERROR_RATE_THRESHOLD) return;
	await alertOnce(
		env,
		'wa_error_rate',
		`WA error rate ${(errorRate * 100).toFixed(1)}% in the last hour (${row?.errors}/${total} leads failed). Likely template or token outage — investigate now.`,
		'critical',
	);
}

export async function handleMonitoringCron(env: MonitoringEnv): Promise<void> {
	const now = Date.now();
	await checkDlqDepth(env);
	await checkSilentSellers(env, now - 24 * RATE_LIMIT_MS);
	await checkWaErrorRate(env, now - RATE_LIMIT_MS);
}

export default {
	async scheduled(_event, env, _ctx): Promise<void> {
		await handleMonitoringCron(env as unknown as MonitoringEnv);
	},
} satisfies ExportedHandler;
