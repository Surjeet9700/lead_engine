"use client";

import { useRecordSheet } from "@/components/crm/record-sheet-host";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityLogo } from "@/components/ui/entity-logo";
import { SimpleTable, SimpleTableRow } from "@/components/ui/simple-table";
import { ArrowRight, CheckCircle2, ChevronRight, DollarSign, Filter, Plus, TrendingUp } from "lucide-react";
import React, { useState } from "react";

export type DealStage = "new_lead" | "contacted_wa" | "spec_confirmed" | "quoted" | "closed_won";

interface Deal {
	id: string;
	title: string;
	company: string;
	buyer: string;
	valueInr: number;
	stage: DealStage;
	closeDate: string;
	probability: number;
}

const STAGES: { key: DealStage; label: string; color: string }[] = [
	{ key: "new_lead", label: "1. Ingested Lead", color: "bg-zinc-500" },
	{ key: "contacted_wa", label: "2. WA Contacted (<45s)", color: "bg-sky-500" },
	{ key: "spec_confirmed", label: "3. Spec Confirmed", color: "bg-amber-500" },
	{ key: "quoted", label: "4. Quotation Sent", color: "bg-purple-500" },
	{ key: "closed_won", label: "5. Closed Won", color: "bg-amber-600" },
];

const SAMPLE_DEALS: Deal[] = [
	{
		id: "deal_1",
		title: "4x Vertical Multistage Pumps CR-15",
		company: "Ramky Infrastructure Ltd",
		buyer: "Arjun Reddy",
		valueInr: 185000,
		stage: "quoted",
		closeDate: "Aug 28, 2026",
		probability: 75,
	},
	{
		id: "deal_2",
		title: "Submersible Sewage Pumpset 10HP",
		company: "JETL Effluent Treatment",
		buyer: "Srikanth Rao",
		valueInr: 125000,
		stage: "spec_confirmed",
		closeDate: "Aug 31, 2026",
		probability: 60,
	},
	{
		id: "deal_3",
		title: "12x High Pressure Chemical Dosing Pumps",
		company: "Hetero Drugs & Chemicals",
		buyer: "Narasimha Murthy",
		valueInr: 340000,
		stage: "closed_won",
		closeDate: "Aug 20, 2026",
		probability: 100,
	},
	{
		id: "deal_4",
		title: "2x Monoblock Centrifugal Pump 5HP",
		company: "Venkatesh Builders",
		buyer: "Venkatesh Murthy",
		valueInr: 68000,
		stage: "contacted_wa",
		closeDate: "Sep 05, 2026",
		probability: 40,
	},
	{
		id: "deal_5",
		title: "Agricultural Solar Submersible 3HP",
		company: "Sharma Irrigation & Pipes",
		buyer: "Deepak Sharma",
		valueInr: 45000,
		stage: "new_lead",
		closeDate: "Sep 12, 2026",
		probability: 25,
	},
];

export default function DealsPage() {
	const { openRecord } = useRecordSheet();
	const [activeStage, setActiveStage] = useState<string>("all");
	const [deals] = useState<Deal[]>(SAMPLE_DEALS);

	const filteredDeals = activeStage === "all" ? deals : deals.filter((d) => d.stage === activeStage);
	const totalPipeline = deals.reduce((sum, d) => sum + d.valueInr, 0);
	const wonPipeline = deals.filter((d) => d.stage === "closed_won").reduce((sum, d) => sum + d.valueInr, 0);

	return (
		<div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">Deals & Sales Pipeline</h1>
					<p className="text-sm text-muted-foreground">
						Track opportunities from <span className="text-amber-400">45-second WhatsApp reply</span> through closed won
					</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="text-right">
						<span className="text-xs text-muted-foreground">Total Open Pipeline:</span>
						<p className="font-bold text-base text-foreground">₹{totalPipeline.toLocaleString("en-IN")}</p>
					</div>
					<Button size="sm" className="gap-1.5">
						<Plus className="h-4 w-4" />
						<span>New Deal</span>
					</Button>
				</div>
			</div>

			{/* Pipeline Stages Stepper */}
			<div className="grid grid-cols-2 sm:grid-cols-5 gap-2 rounded-lg border border-border/80 bg-card/40 p-2">
				{STAGES.map((s) => {
					const count = deals.filter((d) => d.stage === s.key).length;
					const stageTotal = deals
						.filter((d) => d.stage === s.key)
						.reduce((sum, d) => sum + d.valueInr, 0);
					const isSelected = activeStage === s.key;

					return (
						<button
							key={s.key}
							type="button"
							onClick={() => setActiveStage(isSelected ? "all" : s.key)}
							className={`flex flex-col p-3 rounded-md text-left transition-all border ${
								isSelected
									? "border-primary bg-muted/80 shadow-xs"
									: "border-transparent hover:bg-muted/40"
							}`}
						>
							<div className="flex items-center justify-between mb-1">
								<span className="text-xs font-semibold text-foreground truncate">{s.label}</span>
								<Badge variant="outline" className="text-[10px] px-1 py-0">
									{count}
								</Badge>
							</div>
							<span className="text-xs font-medium text-amber-400">
								₹{stageTotal.toLocaleString("en-IN")}
							</span>
						</button>
					);
				})}
			</div>

			{/* Deals Table */}
			<div className="rounded-lg border border-border/80 bg-card/40 overflow-hidden">
				<SimpleTable
					columns={[
						{ id: "deal", header: "Deal Title & Buyer", width: "w-2/5" },
						{ id: "company", header: "Company", width: "w-1/4" },
						{ id: "stage", header: "Pipeline Stage", width: "w-36", align: "center" },
						{ id: "probability", header: "Probability", width: "w-24", align: "center" },
						{ id: "value", header: "Deal Value (₹)", width: "w-28", align: "right" },
					]}
				>
					{filteredDeals.map((deal) => {
						const currentStage = STAGES.find((s) => s.key === deal.stage);
						return (
							<SimpleTableRow
								key={deal.id}
								onClick={() =>
									openRecord({
										id: deal.id,
										type: "deal",
										title: deal.title,
										subtitle: `${deal.company} · ${deal.buyer}`,
										value: `₹${deal.valueInr.toLocaleString("en-IN")}`,
										status: currentStage?.label,
										reasons: [`Probability: ${deal.probability}%`, `Target Close: ${deal.closeDate}`],
									})
								}
							>
								<td className="px-4 py-3">
									<div className="flex items-center gap-3">
										<EntityLogo name={deal.title} size="sm" />
										<div className="flex flex-col min-w-0">
											<span className="font-medium text-sm text-foreground truncate">
												{deal.title}
											</span>
											<span className="text-xs text-muted-foreground truncate">
												{deal.buyer}
											</span>
										</div>
									</div>
								</td>

								<td className="px-4 py-3 text-xs text-muted-foreground">
									{deal.company}
								</td>

								<td className="px-4 py-3 text-center">
									<Badge
										variant={deal.stage === "closed_won" ? "default" : "secondary"}
										className="text-xs"
									>
										{currentStage?.label}
									</Badge>
								</td>

								<td className="px-4 py-3 text-center text-xs font-mono text-muted-foreground">
									{deal.probability}%
								</td>

								<td className="px-4 py-3 text-right font-bold text-foreground text-sm tabular-nums">
									₹{deal.valueInr.toLocaleString("en-IN")}
								</td>
							</SimpleTableRow>
						);
					})}
				</SimpleTable>
			</div>
		</div>
	);
}
