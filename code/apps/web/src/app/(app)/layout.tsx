"use client";

import { AppHeader } from "@/components/crm/app-header";
import { AppIconRail } from "@/components/crm/app-icon-rail";
import { QuickSwitcher } from "@/components/crm/quick-switcher";
import { RecordSheetProvider } from "@/components/crm/record-sheet-host";
import { TooltipProvider } from "@/components/ui/tooltip";
import React, { useState } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const [quickSwitcherOpen, setQuickSwitcherOpen] = useState(false);

	return (
		<TooltipProvider>
			<RecordSheetProvider>
				<div className="isolate flex min-h-screen flex-col bg-background text-foreground">
					{/* Top App Header with Workspace switcher and search */}
					<AppHeader onOpenQuickSwitcher={() => setQuickSwitcherOpen(true)} />

					{/* Main Body: Icon Rail + View Content */}
					<div className="flex min-h-0 flex-1">
						<AppIconRail />
						<main className="min-w-0 flex-1 overflow-y-auto">
							{children}
						</main>
					</div>

					{/* Quick Switcher (Cmd + K) */}
					<QuickSwitcher
						open={quickSwitcherOpen}
						onOpenChange={setQuickSwitcherOpen}
					/>
				</div>
			</RecordSheetProvider>
		</TooltipProvider>
	);
}
