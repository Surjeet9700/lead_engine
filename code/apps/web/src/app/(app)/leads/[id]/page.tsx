'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
	ArrowLeft,
	CheckCheck,
	CloudDownload,
	Eye,
	FileText,
	Gauge,
	Phone,
	Reply,
	Send,
	ShieldCheck,
	type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TimelineEvent {
	icon: LucideIcon;
	title: string;
	timestamp: string;
	detail?: string;
	reasons?: string[];
}

const TIMELINE: TimelineEvent[] = [
	{
		icon: CloudDownload,
		title: 'Received from IndiaMart Push',
		timestamp: 'Today, 10:41:22 AM IST',
		detail: 'Raw enquiry payload ingested via Push API webhook.',
	},
	{
		icon: Gauge,
		title: 'Scored 92/100 — Hot',
		timestamp: 'Today, 10:41:24 AM IST · 2s after receipt',
		detail: 'Routed wa_now — auto-reply triggered immediately.',
		reasons: ['pump_spec_match', 'home_city', 'buying_stage_high'],
	},
	{
		icon: Send,
		title: 'WhatsApp sent via enquiry_ack_utility',
		timestamp: 'Today, 10:41:31 AM IST · 9s after receipt',
		detail: 'Delivery status: accepted by WhatsApp Business API.',
	},
	{
		icon: CheckCheck,
		title: 'Delivered to buyer',
		timestamp: 'Today, 10:41:38 AM IST',
	},
	{
		icon: Eye,
		title: 'Read by buyer',
		timestamp: 'Today, 10:43:05 AM IST',
	},
	{
		icon: Reply,
		title: 'Buyer replied YES',
		timestamp: 'Today, 10:44:12 AM IST',
		detail: 'Positive intent — handed to sales follow-up queue.',
	},
];

function LeadDetail() {
	const { id } = useParams<{ id: string }>();

	return (
		<main className="mx-auto min-h-screen max-w-4xl bg-background text-foreground px-6 py-10">
			<Link
				href="/leads"
				className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="h-4 w-4" />
				Back to leads
			</Link>

			<header className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight text-foreground">Lead Detail</h1>
				<p className="mt-1 font-mono text-xs text-muted-foreground">{id}</p>
			</header>

			<section className="mb-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/80 bg-border/60 sm:grid-cols-4">
				<div className="bg-card p-4">
					<p className="text-xs text-muted-foreground">Product</p>
					<p className="mt-1 text-sm font-medium text-foreground">Vertical Multistage Pump CR-15</p>
				</div>
				<div className="bg-card p-4">
					<p className="text-xs text-muted-foreground">Buyer City</p>
					<p className="mt-1 text-sm font-medium text-foreground">Coimbatore, TN</p>
				</div>
				<div className="bg-card p-4">
					<p className="text-xs text-muted-foreground">Priority Score</p>
					<p className="mt-1 text-sm font-semibold text-amber-400 tabular-nums">92/100</p>
				</div>
				<div className="bg-card p-4">
					<p className="text-xs text-muted-foreground">Current Status</p>
					<div className="mt-1">
						<Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
							Hot — replied
						</Badge>
					</div>
				</div>
			</section>

			{/* Technical Specification & Commercial Quotation Box */}
			<section className="mb-10 rounded-xl border border-border/80 bg-card p-6 flex flex-col gap-4">
				<div className="flex items-center justify-between flex-wrap gap-2">
					<div>
						<h2 className="text-sm font-semibold text-foreground">Extracted Technical Specifications</h2>
						<p className="text-xs text-muted-foreground">Dynamically parsed from buyer inquiry message via Edge Schema Engine</p>
					</div>
					<Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-xs">
						SKU: CR-15-120M-3P
					</Badge>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
					<div className="rounded-lg border border-border/60 bg-muted/30 p-3">
						<span className="text-[11px] text-muted-foreground">Power Rating</span>
						<p className="text-sm font-semibold text-foreground font-mono">15 HP (11 kW)</p>
					</div>
					<div className="rounded-lg border border-border/60 bg-muted/30 p-3">
						<span className="text-[11px] text-muted-foreground">Total Dynamic Head</span>
						<p className="text-sm font-semibold text-foreground font-mono">120 Meters</p>
					</div>
					<div className="rounded-lg border border-border/60 bg-muted/30 p-3">
						<span className="text-[11px] text-muted-foreground">Flow Rate</span>
						<p className="text-sm font-semibold text-foreground font-mono">250 LPM</p>
					</div>
					<div className="rounded-lg border border-border/60 bg-muted/30 p-3">
						<span className="text-[11px] text-muted-foreground">Power Supply</span>
						<p className="text-sm font-semibold text-foreground font-mono">3-Phase 415V</p>
					</div>
				</div>

				<div className="pt-2 flex items-center gap-3 flex-wrap border-t border-border/60">
					<Button asChild size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
						<a
							href={`https://lead-speed-engine.surjeethkumar4.workers.dev/api/quotation/pdf/seller_bj01/${id}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							<FileText className="size-3.5" />
							<span>Download Official PDF Quote</span>
						</a>
					</Button>
					<Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
						<Link href="/voice">
							<Phone className="size-3.5 text-amber-400" />
							<span>Launch Sarvam Voice Call</span>
						</Link>
					</Button>
					<Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
						<Link href="/recovery">
							<ShieldCheck className="size-3.5 text-amber-400" />
							<span>Check Dispute Eligibility</span>
						</Link>
					</Button>
				</div>
			</section>

			<section>
				<h2 className="mb-4 text-sm font-semibold text-foreground">Timeline</h2>
				<div className="relative">
					<div
						aria-hidden
						className="absolute top-3 bottom-3 left-[13px] w-px bg-border"
					/>
					<ul className="space-y-7">
						{TIMELINE.map((event) => (
							<li key={event.title} className="relative flex gap-4">
								<span className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400">
									<event.icon className="h-3.5 w-3.5" />
								</span>
								<div className="pt-0.5">
									<p className="text-sm font-medium">{event.title}</p>
									<p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
										{event.timestamp}
									</p>
									{event.detail ? (
										<p className="mt-1 text-sm text-muted-foreground">{event.detail}</p>
									) : null}
									{event.reasons ? (
										<div className="mt-2 flex flex-wrap gap-1.5">
											{event.reasons.map((reason) => (
												<Badge key={reason} variant="outline">
													{reason}
												</Badge>
											))}
										</div>
									) : null}
								</div>
							</li>
						))}
					</ul>
				</div>
			</section>
		</main>
	);
}

export default LeadDetail;
