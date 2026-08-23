"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Logo } from "@/components/ui/logo";
import {
	Building2,
	ChevronDown,
	Command,
	LogOut,
	Moon,
	Search,
	Sparkles,
	Sun,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function AppHeader({
	onOpenQuickSwitcher,
}: {
	onOpenQuickSwitcher?: () => void;
}) {
	const { resolvedTheme, setTheme } = useTheme();
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const isDark = resolvedTheme === "dark";
	const [workspace, setWorkspace] = useState("Bharat Industrial Equipment");

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/80 bg-background/95 px-4 backdrop-blur-md">
			{/* Left: Brand + Workspace Selector */}
			<div className="flex items-center gap-3">
				<Link href="/dashboard" className="flex items-center gap-2">
					<Logo showWordmark={false} />
				</Link>

				<div className="h-4 w-px bg-border" />

				<DropdownMenu>
					<DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-foreground transition-colors hover:bg-muted outline-none">
						<Building2 className="h-4 w-4 text-muted-foreground" />
						<span className="max-w-[180px] truncate">{workspace}</span>
						<span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
							Primary
						</span>
						<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-56">
						<DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => setWorkspace("Bharat Industrial Equipment")}>
							Bharat Industrial Equipment (Primary)
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setWorkspace("Deccan Industrial Flow")}>
							Deccan Industrial Flow (Equipment Hub)
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => router.push("/settings")}>
							Workspace Settings
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Center: Global Search Bar (Cmd + K) */}
			<div className="hidden max-w-md flex-1 px-4 md:block">
				<button
					type="button"
					onClick={onOpenQuickSwitcher}
					className="flex w-full items-center justify-between rounded-lg border border-border/80 bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/70"
				>
					<div className="flex items-center gap-2">
						<Search className="h-4 w-4" />
						<span>Search leads, companies, deals…</span>
					</div>
					<kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
						<Command className="h-3 w-3" /> K
					</kbd>
				</button>
			</div>

			{/* Right: SLA Status + AI Copilot + Theme Toggle + User Avatar */}
			<div className="flex items-center gap-3">
				{/* Live SLA Pulse */}
				<div className="hidden items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 sm:flex">
					<Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
					<span>45s SLA Active</span>
					<StatusIndicator tone="warning" pulse />
				</div>

				<Button asChild variant="ghost" size="sm" className="hidden lg:flex gap-1.5 text-xs text-muted-foreground hover:text-foreground">
					<Link href="/chat">
						<Sparkles className="h-3.5 w-3.5 text-amber-400" />
						<span>Eve Copilot</span>
					</Link>
				</Button>

				{/* Theme Toggle (Hydration-Safe) */}
				<Button
					variant="ghost"
					size="icon"
					aria-label="Toggle theme"
					onClick={() => setTheme(isDark ? "light" : "dark")}
					className="h-8 w-8 text-muted-foreground"
				>
					{!mounted ? (
						<div className="h-4 w-4" />
					) : isDark ? (
						<Sun className="h-4 w-4" />
					) : (
						<Moon className="h-4 w-4" />
					)}
				</Button>

				{/* User Profile Menu */}
				<DropdownMenu>
					<DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus:ring-2 focus:ring-primary">
						<Avatar className="h-8 w-8 border border-border">
							<AvatarFallback className="bg-muted font-semibold text-xs text-foreground">
								BP
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuLabel className="flex flex-col">
							<span className="font-semibold text-sm">Bharat Pumps Admin</span>
							<span className="text-xs text-muted-foreground">owner@bharatpumps.in</span>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => router.push("/settings")}>
							Settings & API
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => router.push("/recovery")}>
							Credit Recovery Ledger
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => router.push("/voice")}>
							Voice AI Telemetry
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => router.push("/")} className="text-destructive flex items-center gap-2">
							<LogOut className="h-4 w-4" />
							<span>Sign Out</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
