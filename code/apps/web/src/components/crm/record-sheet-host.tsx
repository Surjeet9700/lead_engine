"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityLogo } from "@/components/ui/entity-logo";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
	Building,
	Calendar,
	CheckCheck,
	Coins,
	FileText,
	MessageSquare,
	Phone,
	Send,
	Sparkles,
	User,
	Zap,
} from "lucide-react";
import React, { createContext, useContext, useState } from "react";

export type RecordType = "lead" | "company" | "contact" | "deal";

export interface RecordData {
	id: string;
	type: RecordType;
	title: string;
	subtitle?: string;
	priority?: number;
	status?: string;
	phone?: string;
	city?: string;
	value?: string;
	reasons?: string[];
	createdAt?: string;
	rawPayload?: Record<string, unknown>;
}

interface RecordContextValue {
	currentRecord: RecordData | null;
	openRecord: (record: RecordData) => void;
	closeRecord: () => void;
}

const RecordContext = createContext<RecordContextValue>({
	currentRecord: null,
	openRecord: () => {},
	closeRecord: () => {},
});

export const useRecordSheet = () => useContext(RecordContext);

export function RecordSheetProvider({ children }: { children: React.ReactNode }) {
	const [currentRecord, setCurrentRecord] = useState<RecordData | null>(null);

	const openRecord = (record: RecordData) => setCurrentRecord(record);
	const closeRecord = () => setCurrentRecord(null);

	return (
		<RecordContext.Provider value={{ currentRecord, openRecord, closeRecord }}>
			{children}
			<RecordSheetHost />
		</RecordContext.Provider>
	);
}

export function RecordSheetHost() {
	const { currentRecord, closeRecord } = useRecordSheet();

	if (!currentRecord) return null;

	return (
		<Sheet open={Boolean(currentRecord)} onOpenChange={(open) => !open && closeRecord()}>
			<SheetContent side="right" className="flex flex-col gap-6 overflow-y-auto sm:max-w-xl">
				<SheetHeader className="border-b pb-4">
					<div className="flex items-center gap-3">
						<EntityLogo name={currentRecord.title} size="lg" />
						<div className="flex flex-col">
							<div className="flex items-center gap-2">
								<SheetTitle className="text-xl font-semibold">{currentRecord.title}</SheetTitle>
								{currentRecord.status && (
									<Badge variant="outline" className="text-xs uppercase">
										{currentRecord.status}
									</Badge>
								)}
							</div>
							<SheetDescription className="text-xs font-mono text-muted-foreground mt-0.5">
								ID: {currentRecord.id} · {currentRecord.type.toUpperCase()}
							</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				{/* Quick Key Metrics Grid */}
				<div className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-muted/40 p-4 text-xs sm:grid-cols-4">
					<div>
						<span className="text-muted-foreground">Location</span>
						<p className="mt-0.5 font-medium text-foreground">{currentRecord.city || "Hyderabad"}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Priority Score</span>
						<p className="mt-0.5 font-medium text-amber-400">
							{currentRecord.priority !== undefined ? `${currentRecord.priority}/100` : "85/100"}
						</p>
					</div>
					<div>
						<span className="text-muted-foreground">Response Speed</span>
						<p className="mt-0.5 font-medium text-sky-400">2.4s (SLA Met)</p>
					</div>
					<div>
						<span className="text-muted-foreground">Deal Pipeline</span>
						<p className="mt-0.5 font-medium text-foreground">{currentRecord.value || "₹45,000"}</p>
					</div>
				</div>

				{/* Actions Bar */}
				<div className="flex flex-wrap items-center gap-2">
					<Button size="sm" variant="outline" className="gap-1.5" asChild>
						<a
							href={`https://lead-speed-engine.surjeethkumar4.workers.dev/api/quotation/pdf/seller_bj01/${currentRecord.id}`}
							target="_blank"
							rel="noreferrer"
						>
							<FileText className="h-4 w-4 text-amber-400" />
							<span>Download PDF Quote</span>
						</a>
					</Button>
					{currentRecord.phone && (
						<Button size="sm" className="gap-1.5" asChild>
							<a
								href={`https://wa.me/${currentRecord.phone.replace(/\D/g, "")}?text=Hi%2C%20regarding%20your%20IndiaMart%20enquiry%20for%20${encodeURIComponent(currentRecord.title)}`}
								target="_blank"
								rel="noreferrer"
							>
								<MessageSquare className="h-4 w-4" />
								<span>Open WhatsApp</span>
							</a>
						</Button>
					)}
					{currentRecord.phone && (
						<Button size="sm" variant="outline" className="gap-1.5" asChild>
							<a href={`tel:${currentRecord.phone}`}>
								<Phone className="h-4 w-4" />
								<span>Call Buyer</span>
							</a>
						</Button>
					)}
					<Button size="sm" variant="secondary" className="gap-1.5" asChild>
						<a href="/recovery">
							<Coins className="h-4 w-4 text-amber-400" />
							<span>Draft Credit Refund</span>
						</a>
					</Button>
				</div>

				{/* Live Activity Timeline */}
				<div className="flex flex-col gap-3">
					<h4 className="font-semibold text-sm text-foreground">Speed Engine Timeline</h4>
					<div className="relative border-l border-border/80 pl-4 space-y-4 text-xs">
						<div className="relative">
							<div className="absolute -left-[21px] top-0.5 size-2.5 rounded-full bg-amber-500 ring-4 ring-background" />
							<p className="font-medium text-foreground">WhatsApp Utility Template Sent</p>
							<p className="text-muted-foreground">Delivered in 2.4 seconds via Meta Graph API v25.0</p>
							<span className="text-[10px] text-muted-foreground/70">10:41:24 AM IST</span>
						</div>

						<div className="relative">
							<div className="absolute -left-[21px] top-0.5 size-2.5 rounded-full bg-sky-500 ring-4 ring-background" />
							<p className="font-medium text-foreground">Lead Scored & Deduplicated</p>
							<p className="text-muted-foreground">Pump SKU Spec Match (`HP + Flow`) · D1 Unique Claim Won</p>
							<span className="text-[10px] text-muted-foreground/70">10:41:22 AM IST</span>
						</div>

						<div className="relative">
							<div className="absolute -left-[21px] top-0.5 size-2.5 rounded-full bg-zinc-400 ring-4 ring-background" />
							<p className="font-medium text-foreground">Push Webhook Received</p>
							<p className="text-muted-foreground">Ingested at Mumbai Edge (BOM) · 200 OK in 42ms</p>
							<span className="text-[10px] text-muted-foreground/70">10:41:21 AM IST</span>
						</div>
					</div>
				</div>

				{/* Reasons / Intent Tags */}
				{currentRecord.reasons && currentRecord.reasons.length > 0 && (
					<div className="flex flex-col gap-2">
						<h4 className="font-semibold text-sm text-foreground">Qualification Signals</h4>
						<div className="flex flex-wrap gap-1.5">
							{currentRecord.reasons.map((r) => (
								<Badge key={r} variant="secondary" className="text-xs">
									{r}
								</Badge>
							))}
						</div>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
