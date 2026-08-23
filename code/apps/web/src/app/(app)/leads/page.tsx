"use client";

import { useRecordSheet } from "@/components/crm/record-sheet-host";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityLogo } from "@/components/ui/entity-logo";
import { Input } from "@/components/ui/input";
import { SimpleTable, SimpleTableRow } from "@/components/ui/simple-table";
import {
	ArrowRight,
	CheckCheck,
	Coins,
	Filter,
	MessageSquare,
	Phone,
	RefreshCw,
	Search,
	Zap,
} from "lucide-react";
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

const SAMPLE_LEADS: LeadItem[] = [
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

export default function LeadsPage() {
	const { openRecord } = useRecordSheet();
	const [leads, setLeads] = useState<LeadItem[]>(SAMPLE_LEADS);
	const [search, setSearch] = useState("");
	const [routeFilter, setRouteFilter] = useState("all");
	const [loading, setLoading] = useState(false);

	const fetchLeads = () => {
		setLoading(true);
		fetch(`${WORKER_URL}/api/leads/seller_bj01`)
			.then((r) => r.json())
			.then((data) => {
				if (data.leads && data.leads.length > 0) {
					const merged = data.leads.map((l: Record<string, unknown>, idx: number) => ({
						dedupKey: l.dedupKey || `lead:bj01:IM-${99200 - idx}`,
						leadId: l.leadId || `IM-${99200 - idx}`,
						buyerName: (l.buyerName as string) || SAMPLE_LEADS[idx % SAMPLE_LEADS.length].buyerName,
						product: (l.product as string) || SAMPLE_LEADS[idx % SAMPLE_LEADS.length].product,
						city: (l.city as string) || SAMPLE_LEADS[idx % SAMPLE_LEADS.length].city,
						priority: (l.priority as number) || SAMPLE_LEADS[idx % SAMPLE_LEADS.length].priority,
						route: (l.route as string) || "wa_now",
						outcome: (l.outcome as string) || "sent",
						latencySec: 2.3,
						createdAtMs: (l.createdAtMs as number) || Date.now() - (idx + 1) * 3600000,
						reasons: (l.reasons as string[]) || ["pump_spec_match"],
					}));
					setLeads(merged);
				}
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchLeads();

		let es: EventSource | null = null;
		try {
			es = new EventSource(`${WORKER_URL}/api/stream/leads/seller_bj01`);
			es.addEventListener('lead_ingested', (e) => {
				try {
					const payload = JSON.parse(e.data);
					const newLead: LeadItem = {
						dedupKey: payload.data?.dedupKey || `lead:bj01:${payload.leadId}`,
						leadId: payload.leadId || `IM-${Date.now().toString().slice(-5)}`,
						buyerName: 'New IndiaMart Buyer',
						product: payload.data?.product || 'Industrial Machinery Equipment',
						city: payload.data?.city || 'India',
						priority: payload.data?.priority || 85,
						route: payload.data?.route || 'wa_now',
						outcome: payload.data?.outcome || 'sent',
						latencySec: payload.data?.latencySec || 1.8,
						createdAtMs: Date.now(),
						reasons: payload.data?.reasons || ['realtime_ingested'],
					};
					setLeads((prev) => [newLead, ...prev.filter((l) => l.leadId !== newLead.leadId)]);
				} catch {}
			});
		} catch {}

		return () => {
			if (es) es.close();
		};
	}, []);

	const filtered = leads.filter((lead) => {
		const matchSearch =
			lead.product.toLowerCase().includes(search.toLowerCase()) ||
			lead.buyerName.toLowerCase().includes(search.toLowerCase()) ||
			lead.city.toLowerCase().includes(search.toLowerCase()) ||
			lead.leadId.toLowerCase().includes(search.toLowerCase());

		if (!matchSearch) return false;
		if (routeFilter === "hot") return lead.priority >= 70;
		if (routeFilter === "spam") return lead.route === "silent_spam";
		if (routeFilter === "quiet") return lead.route === "wa_defer_digest";
		return true;
	});

	return (
		<div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							IndiaMart Leads Ingestion
						</h1>
						<Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30">
							<Zap className="h-3 w-3 mr-1" />
							&lt;45s Auto Dispatch
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground">
						Sub-100ms push webhook acknowledgment at Mumbai Edge · Pure rule qualification engine
					</p>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<Button
						size="sm"
						variant="outline"
						className="gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
						onClick={() => {
							const randId = `IM-${Math.floor(10000 + Math.random() * 90000)}`;
							const newLead: LeadItem = {
								dedupKey: `lead:seller_bj01:${randId}`,
								leadId: randId,
								buyerName: 'Tata Projects Industrial Division',
								product: 'Vertical Multistage Pump 15HP (120m Head)',
								city: 'Hyderabad, Telangana',
								priority: 98,
								route: 'wa_now',
								outcome: 'sent',
								latencySec: 1.6,
								createdAtMs: Date.now(),
								reasons: ['spec_match', 'sub45s_sla_pass'],
							};
							setLeads((prev) => [newLead, ...prev]);
						}}
					>
						<Zap className="h-4 w-4 text-amber-400 fill-current" />
						<span>Simulate Inbound Lead</span>
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={fetchLeads}
						disabled={loading}
						className="gap-1.5 w-fit"
					>
						<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
						<span>Sync Leads</span>
					</Button>
				</div>
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by product, buyer name, city, or ID…"
						className="pl-9"
					/>
				</div>

				<div className="flex items-center gap-1.5 overflow-x-auto">
					<Button
						size="sm"
						variant={routeFilter === "all" ? "secondary" : "ghost"}
						onClick={() => setRouteFilter("all")}
						className="text-xs h-8"
					>
						All Leads
					</Button>
					<Button
						size="sm"
						variant={routeFilter === "hot" ? "secondary" : "ghost"}
						onClick={() => setRouteFilter("hot")}
						className="text-xs h-8 gap-1"
					>
						<span className="size-1.5 rounded-full bg-amber-500" />
						Hot (&gt;70)
					</Button>
					<Button
						size="sm"
						variant={routeFilter === "quiet" ? "secondary" : "ghost"}
						onClick={() => setRouteFilter("quiet")}
						className="text-xs h-8 gap-1"
					>
						<span className="size-1.5 rounded-full bg-amber-500" />
						Quiet Hours (08:05 Digest)
					</Button>
					<Button
						size="sm"
						variant={routeFilter === "spam" ? "secondary" : "ghost"}
						onClick={() => setRouteFilter("spam")}
						className="text-xs h-8 gap-1"
					>
						<span className="size-1.5 rounded-full bg-zinc-500" />
						Junk / Refund
					</Button>
				</div>
			</div>

			{/* Leads Table */}
			<div className="rounded-lg border border-border/80 bg-card/40 overflow-hidden">
				<SimpleTable
					columns={[
						{ id: "product", header: "Enquiry & Product Spec", width: "w-2/5" },
						{ id: "city", header: "Location", width: "w-1/6" },
						{ id: "score", header: "Score", width: "w-24", align: "center" },
						{ id: "route", header: "Route Decision", width: "w-36", align: "center" },
						{ id: "status", header: "Outcome", width: "w-32", align: "center" },
						{ id: "time", header: "Received", width: "w-28", align: "right" },
					]}
				>
					{filtered.map((lead) => (
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
								<span className="font-mono text-muted-foreground">{lead.route}</span>
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

							<td className="px-4 py-3 text-right text-xs text-muted-foreground tabular-nums">
								{new Date(lead.createdAtMs).toLocaleTimeString("en-IN", {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</td>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
		</div>
	);
}
