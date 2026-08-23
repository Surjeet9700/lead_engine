'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
	KeyRound,
	LogOut,
	Pause,
	Play,
	Send,
	ShieldAlert,
} from 'lucide-react';

// TODO(auth): hardcoded MVP token. Replace with proper auth (Cloudflare Access / signed session) before launch.
const ADMIN_TOKEN = 'lse-admin-2026';
const TOKEN_STORAGE_KEY = 'lse_admin_token';

type SellerStatus = 'active' | 'paused' | 'churned' | 'onboarding';
type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'expired';

interface SellerRow {
	sellerId: string;
	company: string;
	status: SellerStatus;
	totalLeads: number;
	leadsToday: number;
	lastLeadAtMs: number;
	subscription: SubscriptionStatus;
}

interface ErrorItem {
	tsMs: number;
	code: string;
	message: string;
	sellerId: string;
}

const NOW = Date.now();
const MIN = 60_000;

const MOCK_SELLERS: SellerRow[] = [
	{
		sellerId: 'seller_bj01',
		company: 'Bhagyanagar Pumps & Motors',
		status: 'active',
		totalLeads: 412,
		leadsToday: 23,
		lastLeadAtMs: NOW - 4 * MIN,
		subscription: 'active',
	},
	{
		sellerId: 'seller_vj02',
		company: 'Vardhman Fasteners Pvt Ltd',
		status: 'active',
		totalLeads: 289,
		leadsToday: 11,
		lastLeadAtMs: NOW - 41 * MIN,
		subscription: 'trialing',
	},
	{
		sellerId: 'seller_pk03',
		company: 'Precision Kinetics',
		status: 'paused',
		totalLeads: 156,
		leadsToday: 0,
		lastLeadAtMs: NOW - 26 * 60 * MIN,
		subscription: 'expired',
	},
	{
		sellerId: 'seller_hd04',
		company: 'Hyderabad Die & Tools',
		status: 'active',
		totalLeads: 531,
		leadsToday: 37,
		lastLeadAtMs: NOW - 2 * MIN,
		subscription: 'active',
	},
	{
		sellerId: 'seller_gj05',
		company: 'Gujarat Valve Works',
		status: 'onboarding',
		totalLeads: 8,
		leadsToday: 2,
		lastLeadAtMs: NOW - 3 * 60 * MIN,
		subscription: 'past_due',
	},
];

const MOCK_ERRORS: ErrorItem[] = [
	{
		tsMs: NOW - 12 * MIN,
		code: 'WA_TEMPLATE_INVALID (132001)',
		message:
			"Meta rejected template 'new_lead_intro_v3': variable placeholder mismatch. Re-submit template.",
		sellerId: 'seller_hd04',
	},
	{
		tsMs: NOW - 47 * MIN,
		code: 'QUEUE_SEND_FAILED',
		message:
			'Lead ld_8842 dead-lettered after 3 attempts (queue timeout). Replay via wrangler CLI.',
		sellerId: 'seller_vj02',
	},
	{
		tsMs: NOW - 96 * MIN,
		code: 'STATE_WRITE_FAILED (D1_CONSTRAINT)',
		message:
			'UNIQUE constraint failed: lead_states.dedup_key during fuzzy upsert. Dedup race suspected.',
		sellerId: 'seller_bj01',
	},
];

const SELLER_STATUS_META: Record<SellerStatus, { label: string; dot: string; text: string }> = {
	active: { label: 'Active', dot: 'bg-amber-500', text: 'text-amber-400' },
	paused: { label: 'Paused', dot: 'bg-yellow-500', text: 'text-yellow-400' },
	churned: { label: 'Churned', dot: 'bg-zinc-600', text: 'text-zinc-500' },
	onboarding: { label: 'Onboarding', dot: 'bg-blue-500', text: 'text-blue-400' },
};

const SUBSCRIPTION_META: Record<SubscriptionStatus, { label: string; className: string }> = {
	active: { label: 'Active', className: 'border-amber-900/60 bg-amber-950/30 text-amber-400' },
	trialing: { label: 'Trialing', className: 'border-blue-900/60 bg-blue-950/30 text-blue-400' },
	past_due: { label: 'Past due', className: 'border-yellow-900/60 bg-yellow-950/20 text-yellow-400' },
	expired: { label: 'Expired', className: 'border-red-900/60 bg-red-950/20 text-red-400' },
};

function relativeTime(ms: number): string {
	const diff = Date.now() - ms;
	if (diff < MIN) return `${Math.max(1, Math.floor(diff / 1000))}s ago`;
	if (diff < 60 * MIN) return `${Math.floor(diff / MIN)}m ago`;
	if (diff < 24 * 60 * MIN) return `${Math.floor(diff / (60 * MIN))}h ago`;
	return `${Math.floor(diff / (24 * 60 * MIN))}d ago`;
}

function timeOfDay(ms: number): string {
	return new Date(ms).toLocaleTimeString('en-IN', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});
}

function StatBlock({
	label,
	value,
	danger,
}: {
	label: string;
	value: number | string;
	danger?: boolean;
}) {
	return (
		<div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
			<p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
			<p className={`mt-1.5 text-3xl font-medium tracking-tight tabular-nums ${danger ? 'text-red-400' : 'text-zinc-100'}`}>
				{value}
			</p>
		</div>
	);
}

export default function AdminPage() {
	const [authed, setAuthed] = useState<boolean | null>(null);
	const [tokenInput, setTokenInput] = useState('');
	const [authError, setAuthError] = useState(false);
	const [sellers, setSellers] = useState<SellerRow[]>(MOCK_SELLERS);
	const [sentTo, setSentTo] = useState<string | null>(null);

	useEffect(() => {
		setAuthed(localStorage.getItem(TOKEN_STORAGE_KEY) === ADMIN_TOKEN);
	}, []);

	function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		if (tokenInput === ADMIN_TOKEN) {
			localStorage.setItem(TOKEN_STORAGE_KEY, ADMIN_TOKEN);
			setAuthError(false);
			setAuthed(true);
		} else {
			setAuthError(true);
		}
	}

	function handleLogout() {
		localStorage.removeItem(TOKEN_STORAGE_KEY);
		setTokenInput('');
		setAuthed(false);
	}

	function togglePause(sellerId: string) {
		setSellers((rows) =>
			rows.map((r) =>
				r.sellerId === sellerId && r.status !== 'churned'
					? { ...r, status: r.status === 'paused' ? 'active' : 'paused' }
					: r,
			),
		);
	}

	function sendTestLead(sellerId: string) {
		setSentTo(sellerId);
		window.setTimeout(() => setSentTo(null), 2000);
	}

	if (authed === null) return null;

	if (!authed) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
				<form
					onSubmit={handleLogin}
					className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900/40 p-6"
				>
					<div className="mb-4 flex items-center gap-3">
						<span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
							<KeyRound size={18} className="text-zinc-300" aria-hidden />
						</span>
						<div>
							<h1 className="text-base font-semibold text-zinc-100">Admin access</h1>
							<p className="text-xs text-muted-foreground">Lead Speed Engine — internal only</p>
						</div>
					</div>
					<label htmlFor="admin-token" className="block text-xs font-medium text-muted-foreground">
						Access token
					</label>
					<input
						id="admin-token"
						type="password"
						value={tokenInput}
						onChange={(e) => setTokenInput(e.target.value)}
						placeholder="••••••••"
						autoFocus
						className={`mt-1.5 w-full rounded-md border bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-600 ${
							authError ? 'border-red-800' : 'border-zinc-800'
						}`}
					/>
					{authError && (
						<p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
							<ShieldAlert size={13} aria-hidden /> Invalid token.
						</p>
					)}
					<button
						type="submit"
						className="mt-4 w-full rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
					>
						Unlock dashboard
					</button>
				</form>
			</main>
		);
	}

	const activeSubscriptions = sellers.filter((s) => s.subscription === 'active').length;
	const totalLeadsToday = sellers.reduce((sum, s) => sum + s.leadsToday, 0);
	const DLQ_DEPTH = 2;

	return (
		<main className="min-h-screen bg-zinc-950 px-6 py-12 pb-24">
			<header className="mx-auto mb-10 flex max-w-6xl items-start justify-between gap-4">
				<div>
					<Link href="/" className="text-xs text-muted-foreground hover:text-zinc-200">
						← Back to dashboard
					</Link>
					<h1 className="mt-2 text-2xl font-semibold tracking-tight">Admin — Lead Speed Engine</h1>
					<p className="mt-1 text-sm text-muted-foreground">Internal ops console · mock data</p>
				</div>
				<button
					onClick={handleLogout}
					className="flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
				>
					<LogOut size={14} aria-hidden /> Logout
				</button>
			</header>

			<section className="mx-auto mb-10 grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4">
				<StatBlock label="Total Sellers" value={sellers.length} />
				<StatBlock label="Active Subscriptions" value={activeSubscriptions} />
				<StatBlock label="Total Leads Today" value={totalLeadsToday} />
				<StatBlock label="DLQ Depth" value={DLQ_DEPTH} danger={DLQ_DEPTH > 0} />
			</section>

			<section className="mx-auto mb-10 max-w-6xl overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40">
				<div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
					<h2 className="text-sm font-semibold">Sellers</h2>
					<span className="text-xs text-muted-foreground">{sellers.length} registered</span>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-zinc-800 text-xs text-muted-foreground">
								<th className="px-5 py-2.5 font-medium">Seller ID</th>
								<th className="px-5 py-2.5 font-medium">Company</th>
								<th className="px-5 py-2.5 font-medium">Status</th>
								<th className="px-5 py-2.5 text-right font-medium">Total Leads</th>
								<th className="px-5 py-2.5 font-medium">Last Lead</th>
								<th className="px-5 py-2.5 font-medium">Subscription</th>
								<th className="px-5 py-2.5 text-right font-medium">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-800/70">
							{sellers.map((seller) => {
								const statusMeta = SELLER_STATUS_META[seller.status];
								const subMeta = SUBSCRIPTION_META[seller.subscription];
								return (
									<tr key={seller.sellerId}>
										<td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-zinc-400">
											{seller.sellerId}
										</td>
										<td className="px-5 py-3 text-zinc-100">{seller.company}</td>
										<td className="px-5 py-3">
											<span className={`flex items-center gap-2 ${statusMeta.text}`}>
												<span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} aria-hidden />
												{statusMeta.label}
											</span>
										</td>
										<td className="px-5 py-3 text-right tabular-nums text-zinc-100">
											{seller.totalLeads}
											<span className="ml-1.5 text-xs text-muted-foreground">+{seller.leadsToday} today</span>
										</td>
										<td className="whitespace-nowrap px-5 py-3 text-zinc-400">
											{relativeTime(seller.lastLeadAtMs)}
										</td>
										<td className="px-5 py-3">
											<span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${subMeta.className}`}>
												{subMeta.label}
											</span>
										</td>
										<td className="px-5 py-3">
											<div className="flex justify-end gap-2">
												<button
													onClick={() => togglePause(seller.sellerId)}
													disabled={seller.status === 'churned'}
													className="flex items-center gap-1.5 rounded-md border border-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-40"
												>
													{seller.status === 'paused' ? (
														<>
															<Play size={12} aria-hidden /> Resume
														</>
													) : (
														<>
															<Pause size={12} aria-hidden /> Pause
														</>
													)}
												</button>
												<button
													onClick={() => sendTestLead(seller.sellerId)}
													className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs ${
														sentTo === seller.sellerId
															? 'border-green-900/60 text-green-400'
															: 'border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
													}`}
												>
													<Send size={12} aria-hidden />
													{sentTo === seller.sellerId ? 'Sent ✓' : 'Test Lead'}
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</section>

			<section className="mx-auto max-w-6xl rounded-lg border border-zinc-800 bg-zinc-900/40">
				<div className="border-b border-zinc-800 px-5 py-3">
					<h2 className="text-sm font-semibold">Recent Errors</h2>
				</div>
				<ul className="divide-y divide-zinc-800/70">
					{MOCK_ERRORS.map((err, i) => (
						<li key={i} className="flex items-start gap-3 px-5 py-3.5">
							<span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
							<div className="min-w-0">
								<p className="text-sm font-medium text-zinc-100">
									{err.code}
									<span className="ml-2 font-mono text-xs text-zinc-500">{err.sellerId}</span>
								</p>
								<p className="mt-0.5 text-xs text-zinc-400">{err.message}</p>
							</div>
							<span className="ml-auto shrink-0 whitespace-nowrap pl-4 text-xs tabular-nums text-muted-foreground">
								{timeOfDay(err.tsMs)} IST
							</span>
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
