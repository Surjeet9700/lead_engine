"use client";

import { useRecordSheet } from "@/components/crm/record-sheet-host";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	ChartCard,
	DashboardRow,
	DashboardSection,
	StatGroup,
} from "@/components/ui/dashboard";
import { AreaTrend, DonutStat } from "@/components/ui/dashboard-charts";
import { EntityLogo } from "@/components/ui/entity-logo";
import { Input } from "@/components/ui/input";
import { SimpleTable, SimpleTableRow } from "@/components/ui/simple-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
	ArrowRight,
	Bot,
	Coins,
	ExternalLink,
	Filter,
	MessageSquare,
	Phone,
	Sparkles,
	TrendingUp,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL ?? "http://localhost:8787";

interface LeadItem {
	dedupKey: string;
	leadId: string;
	buyerName: string;
	product: string;
	city: string;
	priority: number;
	route: string;
	outcome: string;
	latencySec: number;
	createdAtMs: number;
	reasons: string[];
}

const SAMPLE_TREND = [
	{ month: "Mar", created: 65, won: 18 },
	{ month: "Apr", created: 88, won: 24 },
	{ month: "May", created: 112, won: 36 },
	{ month: "Jun", created: 95, won: 29 },
	{ month: "Jul", created: 130, won: 42 },
	{ month: "Aug", created: 154, won: 51 },
];

const STAGE_SLICES = [
	{ key: "hot", label: "Hot Spec (<45s WA)", value: 68, color: "#f59e0b", count: 68 },
	{ key: "warm", label: "Warm Inquiries", value: 34, color: "#d97706", count: 34 },
	{ key: "quiet", label: "Quiet Hours Digest", value: 18, color: "#b45309", count: 18 },
	{ key: "spam", label: "Spam / Auto Refund", value: 34, color: "#64748b", count: 34 },
];

const INITIAL_LEADS: LeadItem[] = [
	{
		dedupKey: "lead:bj01:IM-99210",
		leadId: "IM-99210",
		buyerName: "Arjun Reddy (Tata Projects)",
		product: "Vertical Multistage Pump CR-15 (15HP)",
		city: "Hyderabad, Telangana",
		priority: 95,
		route: "wa_now",
		outcome: "sent",
		latencySec: 2.1,
		createdAtMs: Date.now() - 4 * 60 * 1000,
		reasons: ["spec_match", "home_territory", "power_hp>10"],
	},
	{
		dedupKey: "lead:bj01:IM-99208",
		leadId: "IM-99208",
		buyerName: "Srikanth Rao (Thermax Unit)",
		product: "Rotary Screw Compressor 20HP (8 Bar / 70 CFM)",
		city: "Pune, Maharashtra",
		priority: 90,
		route: "wa_now",
		outcome: "delivered",
		latencySec: 1.8,
		createdAtMs: Date.now() - 18 * 60 * 1000,
		reasons: ["spec_match", "pressure_match", "high_intent"],
	},
	{
		dedupKey: "lead:bj01:IM-99201",
		leadId: "IM-99201",
		buyerName: "Venkatesh Infra Projects",
		product: "Heavy Silent DG Set 125 kVA CPCB-IV+",
		city: "Bengaluru, Karnataka",
		priority: 88,
		route: "wa_now",
		outcome: "read",
		latencySec: 2.4,
		createdAtMs: Date.now() - 45 * 60 * 1000,
		reasons: ["capacity_match", "acoustic_enclosure"],
	},
	{
		dedupKey: "lead:bj01:IM-99192",
		leadId: "IM-99192",
		buyerName: "Deepak Sharma (Precision Eng)",
		product: "Three-Phase Induction Motor 10HP IE3",
		city: "Ahmedabad, Gujarat",
		priority: 65,
		route: "human",
		outcome: "received",
		latencySec: 0,
		createdAtMs: Date.now() - 85 * 60 * 1000,
		reasons: ["warm", "catalog_matched"],
	},
	{
		dedupKey: "lead:bj01:IM-99180",
		leadId: "IM-99180",
		buyerName: "College Student Project",
		product: "Pumping systems presentation and circuit PDF",
		city: "",
		priority: 0,
		route: "silent_spam",
		outcome: "spam_skipped",
		latencySec: 0,
		createdAtMs: Date.now() - 120 * 60 * 1000,
		reasons: ["academic_spam_keyword", "dispute_refund_filed_₹350"],
	},
];

export default function DashboardPage() {
	const router = useRouter();
	const { openRecord } = useRecordSheet();
	const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
	const [copilotInput, setCopilotInput] = useState("");
	const [filter, setFilter] = useState("all");

	const [isConnected, setIsConnected] = useState(false);
	const [stats, setStats] = useState({
		totalLeads: 154,
		hotLeads: 102,
		spamLeads: 34,
		recoveredInr: 18450,
	});

	useEffect(() => {
		// 1. Initial REST fetch for stats
		fetch(`${WORKER_URL}/api/stats/seller_bj01`)
			.then((r) => r.json())
			.then((s) => {
				if (s && typeof s.totalLeads === 'number') {
					setStats({
						totalLeads: s.totalLeads,
						hotLeads: s.hotLeads,
						spamLeads: s.spamLeads,
						recoveredInr: s.recoveredInr || s.spamLeads * 350,
					});
				}
			})
			.catch(() => {});

		// 2. Initial REST fetch for leads
		fetch(`${WORKER_URL}/api/leads/seller_bj01`)
			.then((r) => r.json())
			.then((data) => {
				if (data.leads && data.leads.length > 0) {
					const merged = data.leads.map((l: Record<string, unknown>, idx: number) => ({
						dedupKey: l.dedupKey || `lead:bj01:IM-${99200 - idx}`,
						leadId: l.leadId || `IM-${99200 - idx}`,
						buyerName: (l.buyerName as string) || INITIAL_LEADS[idx % INITIAL_LEADS.length].buyerName,
						product: (l.product as string) || INITIAL_LEADS[idx % INITIAL_LEADS.length].product,
						city: (l.city as string) || INITIAL_LEADS[idx % INITIAL_LEADS.length].city,
						priority: (l.priority as number) || INITIAL_LEADS[idx % INITIAL_LEADS.length].priority,
						route: (l.route as string) || "wa_now",
						outcome: (l.outcome as string) || "sent",
						latencySec: 2.3,
						createdAtMs: (l.createdAtMs as number) || Date.now() - (idx + 1) * 3600000,
						reasons: (l.reasons as string[]) || ["pump_spec_match"],
					}));
					setLeads(merged);
				}
			})
			.catch(() => {});

		// 2. Real-Time Server-Sent Events (SSE) stream
		let es: EventSource | null = null;
		try {
			es = new EventSource(`${WORKER_URL}/api/stream/leads/seller_bj01`);
			es.onopen = () => setIsConnected(true);
			es.onerror = () => setIsConnected(false);

			es.addEventListener('lead_ingested', (e) => {
				try {
					const payload = JSON.parse(e.data);
					const newLead: LeadItem = {
						dedupKey: payload.data?.dedupKey || `lead:bj01:${payload.leadId}`,
						leadId: payload.leadId || `IM-${Date.now().toString().slice(-5)}`,
						buyerName: 'New IndiaMart Buyer',
						product: 'Industrial Equipment (15HP)',
						city: 'Hyderabad, TS',
						priority: 92,
						route: 'wa_now',
						outcome: 'sent',
						latencySec: 1.9,
						createdAtMs: Date.now(),
						reasons: ['realtime_push_sla<45s', 'spec_match'],
					};
					setLeads((prev) => [newLead, ...prev]);
				} catch {}
			});

			es.addEventListener('wa_delivered', () => {
				setLeads((prev) =>
					prev.map((l, i) => (i === 0 ? { ...l, outcome: 'delivered' } : l)),
				);
			});
		} catch {}

		return () => {
			if (es) es.close();
		};
	}, []);

	const filteredLeads = leads.filter((l) => {
		if (filter === "hot") return l.priority >= 70;
		if (filter === "spam") return l.route === "silent_spam";
		return true;
	});

	const handleCopilotSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!copilotInput.trim()) return;
		router.push(`/chat?prompt=${encodeURIComponent(copilotInput)}`);
	};

	return (
		<div className="flex flex-col gap-8 p-6 md:p-8 max-w-7xl mx-auto">
			{/* Overview Greeting */}
			<div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
				<div>
					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							Sales & Velocity Dashboard
						</h1>
						<Badge
							variant="outline"
							className={`text-xs ${
								isConnected
									? 'text-amber-400 border-amber-500/30 bg-amber-500/10 animate-pulse'
									: 'text-zinc-400 border-zinc-700 bg-zinc-900'
							}`}
						>
							<span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${isConnected ? 'bg-amber-400' : 'bg-zinc-500'}`} />
							{isConnected ? 'Edge Engine Active (SSE Live)' : 'Edge Engine Standby'}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground">
						Real-time IndiaMart lead speed engine · Industrial Machinery &amp; B2B Equipment Network
					</p>
				</div>

				<div className="flex items-center gap-2 mt-2 md:mt-0 flex-wrap">
					<Button
						size="sm"
						variant="outline"
						className="gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
						onClick={() => {
							const randId = `IM-${Math.floor(10000 + Math.random() * 90000)}`;
							const newLead: LeadItem = {
								dedupKey: `lead:seller_bj01:${randId}`,
								leadId: randId,
								buyerName: 'Vikram Solar & Power Ltd',
								product: 'Vertical Multistage Pump 15HP (120m Head)',
								city: 'Hyderabad, Telangana',
								priority: 96,
								route: 'wa_now',
								outcome: 'sent',
								latencySec: 1.8,
								createdAtMs: Date.now(),
								reasons: ['sub45s_sla_pass', 'pump_spec_match', 'hyderabad_corridor'],
							};
							setLeads((prev) => [newLead, ...prev]);
						}}
					>
						<Zap className="h-4 w-4 text-amber-400 fill-current" />
						<span>Simulate Inbound Lead</span>
					</Button>
					<Button asChild size="sm" variant="outline" className="gap-1.5">
						<Link href="/leads">
							<Zap className="h-4 w-4 text-amber-400" />
							<span>View Stream</span>
						</Link>
					</Button>
					<Button asChild size="sm" className="gap-1.5">
						<Link href="/chat">
							<Sparkles className="h-4 w-4" />
							<span>Ask Copilot</span>
						</Link>
					</Button>
				</div>
			</div>

			{/* KPI Stat Cards Group */}
			<StatGroup>
				<StatCard
					label="Total Ingested Leads"
					value={stats.totalLeads.toString()}
					delta={{ value: "+24%", direction: "up", label: "vs last month" }}
					description="100% acknowledged in <100ms"
				/>
				<StatCard
					label="45s WhatsApp SLA"
					value={`${((stats.hotLeads / (stats.totalLeads || 1)) * 100).toFixed(1)}%`}
					delta={{ value: "2.4s avg", direction: "up", label: "dispatch speed" }}
					description={`${stats.hotLeads} hot inquiries auto-contacted`}
				/>
				<StatCard
					label="Credit ₹ Recovered"
					value={`₹${stats.recoveredInr.toLocaleString('en-IN')}`}
					delta={{ value: `+${stats.spamLeads} claims`, direction: "up", label: "approved" }}
					description={`${stats.spamLeads} junk BuyLeads refunded`}
				/>
				<StatCard
					label="Pipeline Conversion"
					value="18.4%"
					delta={{ value: "+3.2%", direction: "up", label: "win rate" }}
					description="₹6.8L closed deals this month"
				/>
			</StatGroup>

			{/* AI Copilot Query Bar */}
			<div className="rounded-xl border border-border/80 bg-gradient-to-r from-muted/60 via-muted/30 to-muted/60 p-4 shadow-xs">
				<form onSubmit={handleCopilotSubmit} className="flex flex-col sm:flex-row items-center gap-3">
					<div className="flex items-center gap-2 text-foreground font-medium text-sm shrink-0">
						<Bot className="h-5 w-5 text-amber-400" />
						<span>Eve Lead Copilot:</span>
					</div>
					<Input
						value={copilotInput}
						onChange={(e) => setCopilotInput(e.target.value)}
						placeholder="Ask Copilot anything, e.g. 'Summarize today\'s hot pump inquiries' or 'Show uncontacted leads'…"
						className="flex-1 bg-background/80"
					/>
					<Button type="submit" size="sm" className="gap-1.5 shrink-0">
						<span>Ask Agent</span>
						<ArrowRight className="h-4 w-4" />
					</Button>
				</form>
			</div>

			{/* Visual Charts: Velocity Trend + Pipeline Stage Donut */}
			<DashboardRow split="hero">
				<ChartCard
					title="Ingestion & WhatsApp Velocity"
					description="Monthly comparison: IndiaMart inquiries ingested vs instant WhatsApp dispatches"
				>
					<AreaTrend data={SAMPLE_TREND} height={200} />
				</ChartCard>

				<ChartCard
					title="Lead Qualification Breakdown"
					description="Distribution across 154 inbound inquiries this month"
				>
					<DonutStat
						data={STAGE_SLICES}
						centerValue="154"
						centerLabel="Leads"
						height={160}
					/>
				</ChartCard>
			</DashboardRow>

			{/* High-Velocity Leads Stream */}
			<DashboardSection
				title="Live High-Velocity Leads Stream"
				description="Recent IndiaMart inquiries with instant qualification and auto-reply telemetry"
				action={
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant={filter === "all" ? "secondary" : "ghost"}
							onClick={() => setFilter("all")}
							className="text-xs h-7"
						>
							All
						</Button>
						<Button
							size="sm"
							variant={filter === "hot" ? "secondary" : "ghost"}
							onClick={() => setFilter("hot")}
							className="text-xs h-7 gap-1"
						>
							<span className="size-1.5 rounded-full bg-amber-500" />
							Hot (&gt;70)
						</Button>
						<Button
							size="sm"
							variant={filter === "spam" ? "secondary" : "ghost"}
							onClick={() => setFilter("spam")}
							className="text-xs h-7 gap-1"
						>
							<span className="size-1.5 rounded-full bg-zinc-500" />
							Junk/Spam
						</Button>
					</div>
				}
			>
				<div className="rounded-lg border border-border/80 bg-card/40 overflow-hidden">
					<SimpleTable
						columns={[
							{ id: "lead", header: "Buyer & Product Spec", width: "w-2/5" },
							{ id: "city", header: "Location", width: "w-1/6" },
							{ id: "priority", header: "Priority Score", width: "w-28", align: "center" },
							{ id: "speed", header: "Speed SLA", width: "w-28", align: "center" },
							{ id: "status", header: "WhatsApp Status", width: "w-32", align: "center" },
							{ id: "action", header: "", width: "w-24", align: "right" },
						]}
					>
						{filteredLeads.map((lead) => (
							<SimpleTableRow
								key={lead.dedupKey}
								onClick={() =>
									openRecord({
										id: lead.leadId,
										type: "lead",
										title: lead.product,
										subtitle: lead.buyerName,
										city: lead.city,
										priority: lead.priority,
										status: lead.outcome,
										phone: "919848152432",
										reasons: lead.reasons,
									})
								}
							>
								<td className="px-4 py-3">
									<div className="flex items-center gap-3">
										<EntityLogo name={lead.buyerName} size="sm" />
										<div className="flex flex-col min-w-0">
											<span className="font-medium text-sm text-foreground truncate">
												{lead.product}
											</span>
											<span className="text-xs text-muted-foreground truncate">
												{lead.buyerName} · <span className="font-mono">{lead.leadId}</span>
											</span>
										</div>
									</div>
								</td>

								<td className="px-4 py-3 text-xs text-muted-foreground">
									{lead.city || "—"}
								</td>

								<td className="px-4 py-3 text-center">
									<Badge
										variant={lead.priority >= 70 ? "default" : lead.priority >= 45 ? "secondary" : "outline"}
										className="text-xs font-mono"
									>
										{lead.priority}/100
									</Badge>
								</td>

								<td className="px-4 py-3 text-center text-xs">
									{lead.latencySec > 0 ? (
										<span className="inline-flex items-center gap-1 font-medium text-amber-400">
											<Zap className="h-3 w-3" />
											{lead.latencySec}s
										</span>
									) : (
										<span className="text-muted-foreground">—</span>
									)}
								</td>

								<td className="px-4 py-3 text-center">
									<Badge
										variant="outline"
										className={
											lead.outcome === "sent" || lead.outcome === "delivered" || lead.outcome === "read"
												? "border-amber-500/30 bg-amber-500/10 text-amber-400 text-[11px]"
												: lead.outcome === "spam_skipped"
												? "border-zinc-500/30 bg-zinc-500/10 text-muted-foreground text-[11px]"
												: "text-[11px]"
										}
									>
										{lead.outcome.replace(/_/g, " ")}
									</Badge>
								</td>

								<td className="px-4 py-3 text-right">
									<Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
										<span>Inspect</span>
										<ArrowRight className="h-3.5 w-3.5" />
									</Button>
								</td>
							</SimpleTableRow>
						))}
					</SimpleTable>
				</div>
			</DashboardSection>
		</div>
	);
}
