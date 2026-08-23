"use client";

import { useRecordSheet } from "@/components/crm/record-sheet-host";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityLogo } from "@/components/ui/entity-logo";
import { Input } from "@/components/ui/input";
import { SimpleTable, SimpleTableRow } from "@/components/ui/simple-table";
import { Filter, MessageSquare, Phone, Plus, Search, Users } from "lucide-react";
import React, { useState } from "react";

interface Contact {
	id: string;
	name: string;
	company: string;
	title: string;
	phone: string;
	city: string;
	intentScore: number;
	lastActive: string;
	deals: number;
}

const SAMPLE_CONTACTS: Contact[] = [
	{
		id: "cont_1",
		name: "Arjun Reddy",
		company: "Ramky Infrastructure Ltd",
		title: "Procurement Lead — Water Works",
		phone: "919848152432",
		city: "Hyderabad, Telangana",
		intentScore: 95,
		lastActive: "4 mins ago",
		deals: 2,
	},
	{
		id: "cont_2",
		name: "Srikanth Rao",
		company: "JETL Effluent Treatment",
		title: "Chief Plant Engineer",
		phone: "919849021435",
		city: "Pune, Maharashtra",
		intentScore: 90,
		lastActive: "18 mins ago",
		deals: 1,
	},
	{
		id: "cont_3",
		name: "Venkatesh Murthy",
		company: "Venkatesh Builders & Contractors",
		title: "Managing Partner",
		phone: "919444182931",
		city: "Coimbatore, Tamil Nadu",
		intentScore: 82,
		lastActive: "1 hour ago",
		deals: 1,
	},
	{
		id: "cont_4",
		name: "Deepak Sharma",
		company: "Sharma Irrigation & Pipes",
		title: "Owner",
		phone: "919822019234",
		city: "Nagpur, Maharashtra",
		intentScore: 68,
		lastActive: "3 hours ago",
		deals: 0,
	},
	{
		id: "cont_5",
		name: "Narasimha Murthy",
		company: "Hetero Drugs & Chemicals",
		title: "Facility Maintenance Head",
		phone: "919866123456",
		city: "Hyderabad, Telangana",
		intentScore: 92,
		lastActive: "Yesterday",
		deals: 3,
	},
];

export default function ContactsPage() {
	const { openRecord } = useRecordSheet();
	const [search, setSearch] = useState("");
	const [contacts] = useState<Contact[]>(SAMPLE_CONTACTS);

	const filtered = contacts.filter(
		(c) =>
			c.name.toLowerCase().includes(search.toLowerCase()) ||
			c.company.toLowerCase().includes(search.toLowerCase()) ||
			c.city.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">Contacts & Buyers</h1>
					<p className="text-sm text-muted-foreground">
						Direct procurement officers, factory engineers, and pump buyers
					</p>
				</div>
				<Button size="sm" className="gap-1.5 w-fit">
					<Plus className="h-4 w-4" />
					<span>Add Contact</span>
				</Button>
			</div>

			{/* Search and Filters */}
			<div className="flex items-center gap-3">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by contact name, company, or phone…"
						className="pl-9"
					/>
				</div>
				<Button variant="outline" size="sm" className="gap-1.5">
					<Filter className="h-4 w-4" />
					<span>Filter</span>
				</Button>
			</div>

			{/* Contacts Table */}
			<div className="rounded-lg border border-border/80 bg-card/40 overflow-hidden">
				<SimpleTable
					columns={[
						{ id: "contact", header: "Contact Name & Title", width: "w-2/5" },
						{ id: "company", header: "Company", width: "w-1/4" },
						{ id: "intent", header: "Intent Score", width: "w-28", align: "center" },
						{ id: "city", header: "Location", width: "w-1/5" },
						{ id: "actions", header: "Reach Out", width: "w-32", align: "right" },
					]}
				>
					{filtered.map((c) => (
						<SimpleTableRow
							key={c.id}
							onClick={() =>
								openRecord({
									id: c.id,
									type: "contact",
									title: c.name,
									subtitle: `${c.title} · ${c.company}`,
									phone: c.phone,
									city: c.city,
									priority: c.intentScore,
									status: `${c.deals} Active Deals`,
									reasons: [c.company, `Last active: ${c.lastActive}`],
								})
							}
						>
							<td className="px-4 py-3">
								<div className="flex items-center gap-3">
									<EntityLogo name={c.name} size="sm" />
									<div className="flex flex-col min-w-0">
										<span className="font-medium text-sm text-foreground truncate">
											{c.name}
										</span>
										<span className="text-xs text-muted-foreground truncate">
											{c.title}
										</span>
									</div>
								</div>
							</td>

							<td className="px-4 py-3 text-xs text-muted-foreground">
								{c.company}
							</td>

							<td className="px-4 py-3 text-center">
								<Badge
									variant={c.intentScore >= 80 ? "default" : "secondary"}
									className="text-xs font-mono"
								>
									{c.intentScore}/100
								</Badge>
							</td>

							<td className="px-4 py-3 text-xs text-muted-foreground">
								{c.city}
							</td>

							<td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
								<div className="flex items-center justify-end gap-1.5">
									<Button size="icon" variant="ghost" className="h-7 w-7 text-amber-400" asChild>
										<a
											href={`https://wa.me/${c.phone}?text=Hi%20${encodeURIComponent(c.name)}%2C%20following%20up%20from%20Bharat%20Pumps.`}
											target="_blank"
											rel="noreferrer"
											title="WhatsApp"
										>
											<MessageSquare className="h-4 w-4" />
										</a>
									</Button>
									<Button size="icon" variant="ghost" className="h-7 w-7 text-sky-400" asChild>
										<a href={`tel:${c.phone}`} title="Call">
											<Phone className="h-4 w-4" />
										</a>
									</Button>
								</div>
							</td>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
		</div>
	);
}
