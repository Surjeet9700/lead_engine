"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityLogo } from "@/components/ui/entity-logo";
import {
	ArrowRight,
	Bot,
	CheckCircle2,
	Clock,
	Copy,
	ExternalLink,
	Filter,
	Play,
	Plus,
	Radio,
	Sparkles,
	Terminal,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface TeamAgent {
	id: string;
	name: string;
	description: string;
	status: "deployed" | "draft" | "active";
	scope: string[];
	runCount: number;
	lastRun: string;
	trigger: string;
	avgLatency: string;
}

const SAMPLE_AGENTS: TeamAgent[] = [
	{
		id: "agent_speed_dispatcher",
		name: "IndiaMart Speed Dispatcher",
		description: "Captures raw BuyLead webhooks in <100ms, runs dynamic attribute parsing, and triggers the sub-45-second WhatsApp interactive message dispatch.",
		status: "deployed",
		scope: ["webhooks", "dynamic_schema", "whatsapp_api_v25"],
		runCount: 1420,
		lastRun: "2 mins ago",
		trigger: "HTTP Push /webhook/:sellerId",
		avgLatency: "1.8s",
	},
	{
		id: "agent_spec_matcher",
		name: "Dynamic Multi-Industry Spec Qualifier",
		description: "Parses messy Hindi/Telugu/English inquiries across Pumps, Compressors, Generators, and Solar, normalizing units (kW→HP, PSI→Bar, ft→m) to match catalog SKUs.",
		status: "deployed",
		scope: ["dynamic_schema", "unit_conversion", "sku_matching"],
		runCount: 980,
		lastRun: "18 mins ago",
		trigger: "Lead State Machine",
		avgLatency: "240ms",
	},
	{
		id: "agent_credit_refund",
		name: "BuyLead Dispute Recovery Bot",
		description: "Detects non-commercial student inquiries and invalid numbers under IndiaMart Policy §3.2 & §1.4, generating auto-refund claims saving ₹350/lead.",
		status: "deployed",
		scope: ["spam_filter", "dispute_generator", "ledger_write"],
		runCount: 310,
		lastRun: "1 hour ago",
		trigger: "Rule Engine / Cron 23:00 IST",
		avgLatency: "310ms",
	},
	{
		id: "agent_voice_fallback",
		name: "Exotel Telephony & Sarvam Bulbul Voice Agent",
		description: "Initiates DLT 160 service calls with natural Telugu/Hindi Sarvam TTS when WhatsApp is unread for 8 mins, bridging dealer to buyer upon pressing 1.",
		status: "active",
		scope: ["exotel_160_dlt", "sarvam_bulbul_tts", "dtmf_bridge"],
		runCount: 42,
		lastRun: "Yesterday",
		trigger: "Queue Consumer Timeout",
		avgLatency: "820ms",
	},
];

export default function AgentsPage() {
	const router = useRouter();
	const [agents] = useState<TeamAgent[]>(SAMPLE_AGENTS);

	return (
		<div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<div className="flex items-center gap-2.5">
						<h1 className="text-2xl font-bold tracking-tight text-foreground">Autonomous AI Agent Fleet</h1>
						<Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs">
							4 Workers Active at Edge
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground mt-0.5">
						Autonomous micro-agents executing sub-45s ingestion, technical catalog matching, dispute recovery, and telephony.
					</p>
				</div>

				<div className="flex items-center gap-2.5">
					<Button
						variant="outline"
						className="gap-2 text-xs"
						onClick={() => router.push("/chat?prompt=Tune%20the%20spec%20extraction%20prompt%20for%20industrial%20compressors")}
					>
						<Plus className="h-3.5 w-3.5" />
						<span>New Agent Chat</span>
					</Button>
					<Button
						className="gap-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
						onClick={() => router.push("/chat")}
					>
						<Sparkles className="h-3.5 w-3.5" />
						<span>Open Copilot Studio</span>
					</Button>
				</div>
			</div>

			{/* Justification Banner */}
			<div className="rounded-xl border border-border/80 bg-muted/30 p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-start gap-3">
					<div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
						<Sparkles className="size-4" />
					</div>
					<div>
						<h4 className="text-xs font-semibold text-foreground">Why Autonomous Agents?</h4>
						<p className="text-xs text-muted-foreground mt-0.5 max-w-3xl leading-relaxed">
							Unlike legacy static CRMs with dumb webhooks, LeadSpeed runs 4 autonomous micro-agents 24/7 on Cloudflare edge. Each agent has dedicated prompts, retry guarantees, and domain rules to qualify leads, file disputes, and make phone calls automatically.
						</p>
					</div>
				</div>
				<Button asChild variant="outline" size="sm" className="text-xs shrink-0 gap-1.5">
					<Link href="/onboard">
						<Zap className="size-3.5 text-amber-400" />
						<span>Test Lead Pipeline</span>
					</Link>
				</Button>
			</div>

			{/* Agent Summary Cards */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<div className="rounded-xl border border-border/80 bg-card p-4">
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-muted-foreground">Active Fleet Status</span>
						<Radio className="h-4 w-4 text-amber-400 animate-pulse" />
					</div>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="text-2xl font-bold tracking-tight text-foreground">4 Deployed</span>
						<span className="text-xs text-amber-400 font-medium">100% Uptime</span>
					</div>
					<p className="text-[11px] text-muted-foreground mt-1">Zero downtime edge workers</p>
				</div>

				<div className="rounded-xl border border-border/80 bg-card p-4">
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-muted-foreground">Autonomous Invocations</span>
						<Zap className="h-4 w-4 text-sky-400" />
					</div>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="text-2xl font-bold tracking-tight text-foreground">2,752 Runs</span>
						<span className="text-xs text-muted-foreground font-normal">this month</span>
					</div>
					<p className="text-[11px] text-muted-foreground mt-1">Avg 89 decisions / day</p>
				</div>

				<div className="rounded-xl border border-border/80 bg-card p-4">
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-muted-foreground">Mean Decision Latency</span>
						<Clock className="h-4 w-4 text-amber-400" />
					</div>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="text-2xl font-bold tracking-tight text-foreground font-mono">185 ms</span>
						<span className="text-xs text-amber-400 font-medium">&lt;45s SLA Met</span>
					</div>
					<p className="text-[11px] text-muted-foreground mt-1">SOTA sub-second qualification</p>
				</div>
			</div>

			{/* Agents Directory */}
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-semibold text-foreground">Configured Agent Fleet</h2>
					<span className="text-xs text-muted-foreground">4 micro-agents active on Cloudflare Worker</span>
				</div>

				<div className="overflow-hidden rounded-xl border border-border/80 bg-card divide-y divide-border/60">
					{agents.map((agent) => (
						<div
							key={agent.id}
							className="group flex flex-col p-5 transition-colors hover:bg-muted/40 md:flex-row md:items-center md:justify-between gap-4"
						>
							<div className="flex items-start gap-4">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/60 text-amber-400 group-hover:border-amber-500/40 group-hover:bg-amber-500/10 transition-colors">
									<Bot className="size-5" />
								</div>
								<div className="flex flex-col gap-1">
									<div className="flex items-center gap-2.5 flex-wrap">
										<span className="font-semibold text-sm text-foreground">
											{agent.name}
										</span>
										<Badge
											variant="outline"
											className={
												agent.status === "deployed"
													? "border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px]"
													: "border-sky-500/30 bg-sky-500/10 text-sky-400 text-[10px]"
											}
										>
											{agent.status}
										</Badge>
										<span className="text-xs text-muted-foreground">
											Trigger: <code className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{agent.trigger}</code>
										</span>
									</div>
									<p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
										{agent.description}
									</p>
									<div className="flex items-center gap-2 mt-1.5 flex-wrap">
										{agent.scope.map((tag) => (
											<span
												key={tag}
												className="rounded-md bg-muted/80 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
											>
												#{tag}
											</span>
										))}
									</div>
								</div>
							</div>

							<div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-border/40 shrink-0">
								<div className="flex flex-col items-start md:items-end">
									<span className="font-mono text-xs font-semibold text-foreground">
										{agent.runCount} executions
									</span>
									<span className="text-[11px] text-muted-foreground">
										Latency: <span className="text-amber-400 font-mono">{agent.avgLatency}</span> · {agent.lastRun}
									</span>
								</div>

								<Button
									variant="outline"
									size="sm"
									className="gap-1.5 text-xs"
									asChild
								>
									<Link href={`/chat?agent=${agent.id}`}>
										<span>Test in Eve</span>
										<ArrowRight className="h-3.5 w-3.5" />
									</Link>
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
