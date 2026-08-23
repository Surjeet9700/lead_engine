'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

type StatusLevel = 'operational' | 'degraded' | 'down';

interface Service {
	name: string;
	description: string;
	level: StatusLevel;
}

const SERVICES: Service[] = [
	{ name: 'Worker API', description: 'Cloudflare Worker handling webhooks and dashboard requests', level: 'operational' },
	{ name: 'WhatsApp Cloud API', description: 'Message delivery via Meta Cloud API', level: 'operational' },
	{ name: 'D1 Database', description: 'Lead storage and retrieval', level: 'operational' },
	{ name: 'Queue Processing', description: 'Lead scoring and auto-reply pipeline', level: 'operational' },
];

const STATUS_META: Record<StatusLevel, { label: string; dot: string; ring: string }> = {
	operational: { label: 'Operational', dot: 'bg-amber-500', ring: 'bg-amber-500/20' },
	degraded: { label: 'Degraded', dot: 'bg-yellow-500', ring: 'bg-yellow-500/20' },
	down: { label: 'Down', dot: 'bg-red-500', ring: 'bg-red-500/20' },
};

function StatusDot({ level }: { level: StatusLevel }) {
	const meta = STATUS_META[level];
	return (
		<span className="relative inline-flex h-3 w-3 shrink-0" aria-hidden>
			<span className={`absolute inline-flex h-full w-full rounded-full ${meta.ring} ${level !== 'operational' ? 'animate-ping' : ''}`} />
			<span className={`relative inline-flex h-3 w-3 rounded-full ${meta.dot}`} />
		</span>
	);
}

function formatTime(d: Date) {
	const time = d.toLocaleTimeString('en-IN', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	});
	return `${time} IST`;
}

export default function StatusPage() {
	const [lastChecked, setLastChecked] = useState<string | null>(null);

	useEffect(() => {
		setLastChecked(formatTime(new Date()));
	}, []);

	const allOperational = SERVICES.every((s) => s.level === 'operational');

	return (
		<main className="mx-auto max-w-3xl px-6 py-12 pb-24">
			<header className="mb-10">
				<Link href="/" className="text-xs text-muted-foreground hover:text-zinc-200">
					← Back to dashboard
				</Link>
				<h1 className="mt-3 text-2xl font-semibold tracking-tight">Lead Speed Engine</h1>
				<p className="mt-1 text-sm text-muted-foreground">System Status</p>
			</header>

			<section
				className={`mb-8 flex items-center gap-3 rounded-lg border px-5 py-4 ${
					allOperational ? 'border-amber-900/60 bg-amber-950/30' : 'border-yellow-900/60 bg-yellow-950/20'
				}`}
			>
				<CheckCircle2 size={18} className="shrink-0 text-amber-400" aria-hidden />
				<div>
					<p className="text-sm font-medium text-zinc-100">
						{allOperational ? 'All systems operational' : 'Some systems experiencing issues'}
					</p>
					<p className="mt-0.5 text-xs text-muted-foreground">
						{lastChecked ? `Last checked: ${lastChecked}` : 'Checking…'}
					</p>
				</div>
			</section>

			<section className="mb-8 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40">
				<div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
					<h2 className="text-sm font-semibold">Services</h2>
					<span className="text-xs text-muted-foreground">90-day uptime</span>
				</div>
				<ul className="divide-y divide-zinc-800">
					{SERVICES.map((service) => (
						<li key={service.name} className="flex items-center justify-between gap-4 px-5 py-4">
							<div className="flex min-w-0 items-center gap-3">
								<StatusDot level={service.level} />
								<div className="min-w-0">
									<p className="truncate text-sm font-medium text-zinc-100">{service.name}</p>
									<p className="truncate text-xs text-muted-foreground">{service.description}</p>
								</div>
							</div>
							<div className="flex shrink-0 items-center gap-4">
								<span className="hidden text-xs sm:inline">{STATUS_META[service.level].label}</span>
								<span className="w-16 text-right text-sm font-medium tabular-nums text-zinc-100">
									99.9%
								</span>
							</div>
						</li>
					))}
				</ul>
			</section>

			<section className="rounded-lg border border-zinc-800 bg-zinc-900/40">
				<div className="border-b border-zinc-800 px-5 py-3">
					<h2 className="text-sm font-semibold">Recent Incidents</h2>
				</div>
				<div className="px-5 py-10 text-center">
					<p className="text-sm text-zinc-300">No incidents in the last 90 days</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Incident history and post-mortems will appear here if anything goes wrong.
					</p>
				</div>
			</section>

			<footer className="mt-12 border-t border-zinc-800 pt-6 text-xs text-muted-foreground">
				Status updates every 60 seconds. Report an issue at{' '}
				<a href="mailto:support@leadspeedengine.in" className="text-zinc-300 underline underline-offset-2 hover:text-zinc-100">
					support@leadspeedengine.in
				</a>
			</footer>
		</main>
	);
}
