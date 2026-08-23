"use client";

import { useRecordSheet } from "@/components/crm/record-sheet-host";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityLogo } from "@/components/ui/entity-logo";
import { Input } from "@/components/ui/input";
import { SimpleTable, SimpleTableRow } from "@/components/ui/simple-table";
import { Building, ExternalLink, Filter, Plus, Search } from "lucide-react";
import React, { useState } from "react";

interface Company {
	id: string;
	name: string;
	domain: string;
	location: string;
	industry: string;
	employees: string;
	dealCount: number;
	totalValue: string;
	status: string;
}

const SAMPLE_COMPANIES: Company[] = [
	{
		id: "comp_1",
		name: "Ramky Infrastructure Ltd",
		domain: "ramky.com",
		location: "Ramky Towers, Gachibowli, Hyderabad",
		industry: "Civil Infrastructure & Water Treatment",
		employees: "1,000–5,000",
		dealCount: 3,
		totalValue: "₹4,20,000",
		status: "Active Client",
	},
	{
		id: "comp_2",
		name: "JETL Effluent Treatment Systems",
		domain: "jetl.in",
		location: "Industrial Corridor, Hyderabad",
		industry: "Effluent & Industrial Waste Management",
		employees: "200–500",
		dealCount: 2,
		totalValue: "₹2,85,000",
		status: "Active Client",
	},
	{
		id: "comp_3",
		name: "Hetero Chemical & Pharma Processing",
		domain: "heterodrugs.com",
		location: "Industrial Estate, Hyderabad",
		industry: "Pharmaceuticals & Chemical Processing",
		employees: "5,000+",
		dealCount: 4,
		totalValue: "₹6,50,000",
		status: "Active Client",
	},
	{
		id: "comp_4",
		name: "Deccan Machinery & Motors",
		domain: "deccanpumps.in",
		location: "Coimbatore, Tamil Nadu",
		industry: "Machinery Manufacturing & Distribution",
		employees: "50–200",
		dealCount: 1,
		totalValue: "₹95,000",
		status: "Prospect",
	},
	{
		id: "comp_5",
		name: "Kirloskar Regional Machinery Depot",
		domain: "kirloskarpumps.com",
		location: "Pune / Hyderabad Hub",
		industry: "Industrial Pump Systems",
		employees: "500–1,000",
		dealCount: 5,
		totalValue: "₹8,90,000",
		status: "Key Partner",
	},
];

export default function CompaniesPage() {
	const { openRecord } = useRecordSheet();
	const [search, setSearch] = useState("");
	const [companies] = useState<Company[]>(SAMPLE_COMPANIES);

	const filtered = companies.filter(
		(c) =>
			c.name.toLowerCase().includes(search.toLowerCase()) ||
			c.location.toLowerCase().includes(search.toLowerCase()) ||
			c.industry.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">Companies & Enterprises</h1>
					<p className="text-sm text-muted-foreground">
						B2B industrial buyers, contractors, and pump distribution partners
					</p>
				</div>
				<Button size="sm" className="gap-1.5 w-fit">
					<Plus className="h-4 w-4" />
					<span>Add Company</span>
				</Button>
			</div>

			{/* Search and Filters Bar */}
			<div className="flex items-center gap-3">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by company name, location, or industry…"
						className="pl-9"
					/>
				</div>
				<Button variant="outline" size="sm" className="gap-1.5">
					<Filter className="h-4 w-4" />
					<span>Filter</span>
				</Button>
			</div>

			{/* Companies Table */}
			<div className="rounded-lg border border-border/80 bg-card/40 overflow-hidden">
				<SimpleTable
					columns={[
						{ id: "company", header: "Company Name", width: "w-2/5" },
						{ id: "industry", header: "Industry", width: "w-1/4" },
						{ id: "location", header: "Location", width: "w-1/5" },
						{ id: "deals", header: "Deals", width: "w-20", align: "center" },
						{ id: "value", header: "Pipeline Value", width: "w-28", align: "right" },
					]}
				>
					{filtered.map((comp) => (
						<SimpleTableRow
							key={comp.id}
							onClick={() =>
								openRecord({
									id: comp.id,
									type: "company",
									title: comp.name,
									subtitle: comp.domain,
									city: comp.location,
									status: comp.status,
									value: comp.totalValue,
									reasons: [comp.industry, `Employees: ${comp.employees}`],
								})
							}
						>
							<td className="px-4 py-3">
								<div className="flex items-center gap-3">
									<EntityLogo name={comp.name} size="sm" />
									<div className="flex flex-col min-w-0">
										<span className="font-medium text-sm text-foreground truncate">
											{comp.name}
										</span>
										<span className="text-xs text-muted-foreground truncate">
											{comp.domain}
										</span>
									</div>
								</div>
							</td>

							<td className="px-4 py-3 text-xs text-muted-foreground">
								{comp.industry}
							</td>

							<td className="px-4 py-3 text-xs text-muted-foreground">
								{comp.location}
							</td>

							<td className="px-4 py-3 text-center">
								<Badge variant="secondary" className="text-xs">
									{comp.dealCount}
								</Badge>
							</td>

							<td className="px-4 py-3 text-right font-medium text-foreground text-sm tabular-nums">
								{comp.totalValue}
							</td>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
		</div>
	);
}
