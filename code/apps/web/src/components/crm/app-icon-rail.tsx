"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import {
	Bot,
	Building,
	Coins,
	FileText,
	LayoutDashboard,
	Menu,
	MessageSquare,
	Phone,
	Settings,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export interface NavItem {
	title: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	badge?: string;
	match: "exact" | "prefix";
}

const NAV_ITEMS: NavItem[] = [
	{ title: "Overview", href: "/dashboard", icon: LayoutDashboard, match: "exact" },
	{ title: "Leads", href: "/leads", icon: Zap, match: "prefix", badge: "Live" },
	{ title: "Deals", href: "/deals", icon: TrendingUp, match: "prefix" },
	{ title: "Companies", href: "/companies", icon: Building, match: "prefix" },
	{ title: "Contacts", href: "/contacts", icon: Users, match: "prefix" },
	{ title: "Copilot Chat", href: "/chat", icon: MessageSquare, match: "prefix" },
	{ title: "Team Agents", href: "/agents", icon: Bot, match: "prefix" },
	{ title: "Credit Recovery", href: "/recovery", icon: Coins, match: "prefix" },
	{ title: "Voice AI", href: "/voice", icon: Phone, match: "prefix" },
	{ title: "Settings", href: "/settings", icon: Settings, match: "prefix" },
];

function isItemActive(item: NavItem, pathname: string): boolean {
	if (item.match === "exact") return pathname === item.href;
	return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppIconRail() {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<>
			{/* Desktop Icon Rail */}
			<nav
				aria-label="Primary Navigation"
				className="hidden w-16 shrink-0 flex-col items-center justify-between border-r border-border/80 bg-background py-3 md:flex"
			>
				<div className="flex flex-col items-center gap-2">
					{/* Axis Logo Mark */}
					<Tooltip>
						<TooltipTrigger asChild>
							<Link
								href="/dashboard"
								className="mb-2 flex size-10 items-center justify-center rounded-xl transition-transform hover:scale-105"
								aria-label="Axis Home"
							>
								<Logo showWordmark={false} />
							</Link>
						</TooltipTrigger>
						<TooltipContent side="right" className="font-semibold">
							Axis CRM
						</TooltipContent>
					</Tooltip>

					<div className="w-8 h-px bg-border/60 mb-1" />

					{NAV_ITEMS.map((item) => {
						const active = isItemActive(item, pathname);
						const Icon = item.icon;

						return (
							<Tooltip key={item.href}>
								<TooltipTrigger asChild>
									<Button
										asChild
										variant="ghost"
										size="icon"
										className={cn(
											"relative size-10 rounded-xl text-muted-foreground transition-all",
											active &&
												"bg-muted font-medium text-foreground shadow-xs ring-1 ring-border",
											!active && "hover:bg-muted/60 hover:text-foreground",
										)}
									>
										<Link href={item.href} aria-current={active ? "page" : undefined}>
											<Icon className="size-5" />
											{item.badge && (
												<span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
													<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
													<span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
												</span>
											)}
											<span className="sr-only">{item.title}</span>
										</Link>
									</Button>
								</TooltipTrigger>
								<TooltipContent side="right" className="flex items-center gap-1.5 font-medium">
									{item.title}
									{item.badge && (
										<span className="rounded bg-amber-500/10 px-1 py-0.2 text-[9px] text-amber-400">
											{item.badge}
										</span>
									)}
								</TooltipContent>
							</Tooltip>
						);
					})}
				</div>

				{/* Bottom Home / Landing Link */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							asChild
							variant="ghost"
							size="icon"
							className="size-10 rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground"
						>
							<Link href="/" aria-label="Landing Page">
								<FileText className="size-4" />
							</Link>
						</Button>
					</TooltipTrigger>
					<TooltipContent side="right">Landing Page</TooltipContent>
				</Tooltip>
			</nav>

			{/* Mobile Header Bar Button */}
			<div className="fixed bottom-4 right-4 z-40 md:hidden">
				<Button
					size="icon"
					onClick={() => setMobileOpen(true)}
					className="h-12 w-12 rounded-full shadow-lg"
					aria-label="Open Navigation"
				>
					<Menu className="h-6 w-6" />
				</Button>
			</div>

			{/* Mobile Drawer */}
			<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
				<SheetContent side="left" className="w-72 p-0">
					<SheetHeader className="border-b p-4">
						<SheetTitle className="text-base text-left">
							<Logo showWordmark={true} />
						</SheetTitle>
					</SheetHeader>
					<div className="flex flex-col gap-1 p-3">
						{NAV_ITEMS.map((item) => {
							const active = isItemActive(item, pathname);
							const Icon = item.icon;

							return (
								<Button
									key={item.href}
									asChild
									variant="ghost"
									onClick={() => setMobileOpen(false)}
									className={cn(
										"justify-start gap-3 px-3 py-2 text-sm text-muted-foreground",
										active && "bg-muted font-medium text-foreground",
									)}
								>
									<Link href={item.href}>
										<Icon className="h-4 w-4" />
										<span>{item.title}</span>
										{item.badge && (
											<span className="ml-auto rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400">
												{item.badge}
											</span>
										)}
									</Link>
								</Button>
							);
						})}
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
