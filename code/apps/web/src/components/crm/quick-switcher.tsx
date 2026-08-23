"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Building, Coins, LayoutDashboard, Phone, Search, TrendingUp, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const QUICK_ACTIONS = [
	{ title: "Overview & Velocity Dashboard", href: "/dashboard", icon: LayoutDashboard, category: "Navigation" },
	{ title: "Live IndiaMart Ingestion Feed", href: "/leads", icon: Zap, category: "Leads" },
	{ title: "Pipeline & Deals", href: "/deals", icon: TrendingUp, category: "Pipeline" },
	{ title: "Companies Directory", href: "/companies", icon: Building, category: "CRM" },
	{ title: "Contacts & Buyers", href: "/contacts", icon: Users, category: "CRM" },
	{ title: "Ask Eve / Copilot Chat", href: "/chat", icon: Zap, category: "AI Assistant" },
	{ title: "Team AI Agents Fleet", href: "/agents", icon: Zap, category: "AI Assistant" },
	{ title: "Junk Credit Recovery Ledger", href: "/recovery", icon: Coins, category: "Recovery" },
	{ title: "Exotel Voice AI Telemetry", href: "/voice", icon: Phone, category: "Voice" },
];

export function QuickSwitcher({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [query, setQuery] = useState("");
	const router = useRouter();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				onOpenChange(!open);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, onOpenChange]);

	const filtered = QUICK_ACTIONS.filter((action) =>
		action.title.toLowerCase().includes(query.toLowerCase()) ||
		action.category.toLowerCase().includes(query.toLowerCase())
	);

	const handleSelect = (href: string) => {
		onOpenChange(false);
		router.push(href);
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
			<div
				onClick={() => onOpenChange(false)}
				className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
			/>
			<div className="relative z-50 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-background shadow-2xl animate-in zoom-in-95">
				<div className="flex items-center border-b border-border px-3">
					<Search className="h-4 w-4 text-muted-foreground mr-2" />
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Type a command or search records…"
						className="h-12 border-0 bg-transparent px-0 text-sm focus-visible:ring-0 shadow-none"
						autoFocus
					/>
				</div>

				<div className="max-h-80 overflow-y-auto p-2">
					<div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
						Quick Navigation
					</div>
					{filtered.map((item) => {
						const Icon = item.icon;
						return (
							<button
								key={item.href}
								onClick={() => handleSelect(item.href)}
								className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition-colors hover:bg-muted/70 focus:bg-muted"
							>
								<div className="flex items-center gap-2.5">
									<Icon className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium text-foreground">{item.title}</span>
								</div>
								<span className="text-xs text-muted-foreground">{item.category}</span>
							</button>
						);
					})}
					{filtered.length === 0 && (
						<p className="py-6 text-center text-sm text-muted-foreground">
							No matching actions found.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
