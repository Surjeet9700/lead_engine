"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageBubble, ThinkingIndicator } from "@/components/ui/chat-bubbles";
import {
	ArrowRight,
	Bot,
	CheckCheck,
	ChevronDown,
	ChevronRight,
	Clock,
	Code2,
	Coins,
	FileText,
	MessageSquare,
	Play,
	Plus,
	RefreshCw,
	Send,
	Sparkles,
	Terminal,
	Trash2,
	User,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

interface Message {
	id: string;
	role: "user" | "agent";
	author?: string;
	content: React.ReactNode;
	reasoning?: string;
	toolCalls?: { name: string; latency: string; status: "success" | "running" }[];
	timestamp: string;
}

interface ChatSession {
	id: string;
	title: string;
	agentName: string;
	lastMessage: string;
	timestamp: string;
}

const CHAT_SESSIONS: ChatSession[] = [
	{
		id: "session_1",
		title: "Industrial Machinery Inquiries Review",
		agentName: "IndiaMart Speed Dispatcher",
		lastMessage: "Summarized 14 leads from today's corridor stream.",
		timestamp: "10:32 AM",
	},
	{
		id: "session_2",
		title: "CR-15 Multistage Pump Spec Match",
		agentName: "Pump Spec Qualifier",
		lastMessage: "Matched Arjun Reddy inquiry to Grundfos CR-15 15HP SKU.",
		timestamp: "Yesterday",
	},
	{
		id: "session_3",
		title: "BuyLead Dispute Ticket #IM-99180",
		agentName: "Junk BuyLead Dispute Bot",
		lastMessage: "Generated student project refund claim for ₹350 credit.",
		timestamp: "Aug 20",
	},
];

const INITIAL_CONVERSATION: Message[] = [
	{
		id: "1",
		role: "agent",
		author: "Eve Copilot",
		content:
			"Hello! I am your AI CRM Lead Copilot for Bharat Industrial Equipment. I monitor IndiaMart push webhooks, score machinery SKU specifications, analyze response latencies, and draft WhatsApp follow-ups.",
		timestamp: "10:30 AM",
	},
	{
		id: "2",
		role: "user",
		content: "Summarize today's hot industrial equipment inquiries across our region.",
		timestamp: "10:32 AM",
	},
	{
		id: "3",
		role: "agent",
		author: "Eve Copilot",
		reasoning:
			"1. Queried Cloudflare D1 database `lead_states` table for seller `seller_bj01`.\n2. Filtered for records with created_at_ms > 00:00 IST and route = 'wa_now'.\n3. Sorted by priority score descending (threshold >= 75).\n4. Generated 45-second latency delivery summary.",
		toolCalls: [
			{ name: "d1_query(table: 'lead_states', seller: 'seller_bj01')", latency: "14ms", status: "success" },
			{ name: "catalog_matcher(products: ['CR-15', 'Submersible', 'Screw Compressor'])", latency: "38ms", status: "success" },
		],
		content: (
			<div className="flex flex-col gap-3">
				<p className="text-sm">
					Today you received <strong>14 new leads</strong> across your industrial territories. Here are the top 3 hot inquiries:
				</p>
				<div className="space-y-2 rounded-lg border border-border/80 bg-card/60 p-3 text-xs">
					<div className="flex items-start justify-between border-b border-border/40 pb-2">
						<div>
							<div className="font-semibold text-foreground">Arjun Reddy (Industrial Zone)</div>
							<div className="text-muted-foreground">Vertical Multistage Pump CR-15 (15HP)</div>
						</div>
						<div className="text-right">
							<span className="font-mono font-medium text-amber-400">Score 95/100</span>
							<div className="text-[10px] text-muted-foreground">WA sent in 2.1s</div>
						</div>
					</div>
					<div className="flex items-start justify-between border-b border-border/40 pb-2">
						<div>
							<div className="font-semibold text-foreground">Srikanth Rao (Machinery Hub)</div>
							<div className="text-muted-foreground">Submersible Borewell Pumpset 7.5HP</div>
						</div>
						<div className="text-right">
							<span className="font-mono font-medium text-amber-400">Score 90/100</span>
							<div className="text-[10px] text-muted-foreground">WA delivered in 1.8s</div>
						</div>
					</div>
					<div className="flex items-start justify-between">
						<div>
							<div className="font-semibold text-foreground">Venkatesh Builders (Coimbatore)</div>
							<div className="text-muted-foreground">Monoblock Centrifugal Pump 5HP</div>
						</div>
						<div className="text-right">
							<span className="font-mono font-medium text-sky-400">Score 75/100</span>
							<div className="text-[10px] text-muted-foreground">WA read by buyer</div>
						</div>
					</div>
				</div>
				<p className="text-xs text-muted-foreground">
					2 junk leads (student project inquiries) were automatically filtered and flagged for BuyLead credit refund claim.
				</p>
			</div>
		),
		timestamp: "10:32 AM",
	},
];

function ChatContent() {
	const searchParams = useSearchParams();
	const initialPrompt = searchParams.get("prompt");
	const [activeSessionId, setActiveSessionId] = useState("session_1");
	const [messages, setMessages] = useState<Message[]>(INITIAL_CONVERSATION);
	const [input, setInput] = useState("");
	const [isThinking, setIsThinking] = useState(false);
	const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({ "3": false });

	useEffect(() => {
		if (initialPrompt) {
			handleSendMessage(initialPrompt);
		}
	}, [initialPrompt]);

	const toggleReasoning = (id: string) => {
		setExpandedReasoning((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	const handleSendMessage = (textToSend?: string) => {
		const query = textToSend || input;
		if (!query.trim()) return;

		const userMsg: Message = {
			id: String(Date.now()),
			role: "user",
			content: query,
			timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
		};

		setMessages((prev) => [...prev, userMsg]);
		if (!textToSend) setInput("");
		setIsThinking(true);

		setTimeout(() => {
			setIsThinking(false);
			const lower = query.toLowerCase();

			let responseNode: React.ReactNode;
			let reasoningStr = "Processed query against local state and Cloudflare D1 tables.";
			let toolCallsList: { name: string; latency: string; status: "success" }[] = [];

			if (lower.includes("simulate") || lower.includes("webhook") || lower.includes("test")) {
				reasoningStr = "1. Generated synthetic IndiaMart push webhook payload.\n2. Evaluated domain rules: Machinery spec match + Home territory check.\n3. Verified quiet hours (07:00 - 22:00 IST open).\n4. Emitted wa_now queue event.";
				toolCallsList = [
					{ name: "simulate_indiamart_push(lead_id: 'IM-99222')", latency: "8ms", status: "success" },
					{ name: "domain_decide(spec: 'Vertical Multistage CR-20')", latency: "1.2ms", status: "success" },
					{ name: "whatsapp_cloud_api_mock(template: 'pump_quote_v1')", latency: "210ms", status: "success" },
				];
				responseNode = (
					<div className="flex flex-col gap-2.5">
						<div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
							<Zap className="h-4 w-4" />
							<span>Simulated Ingestion & Fast Dispatch Succeeded</span>
						</div>
						<p className="text-xs text-foreground">
							Captured test webhook for <strong>CR-20 Multistage Pump 20HP</strong> from <em>Industrial Hub</em>.
						</p>
						<div className="rounded border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-foreground font-mono space-y-1">
							<div>Decision Route: <span className="text-amber-400 font-bold">wa_now</span></div>
							<div>Score: <span className="text-amber-400 font-bold">98/100</span> (Spec match + Home Territory)</div>
							<div>Total Latency: <span className="text-amber-400 font-bold">1.94 seconds</span> (Under 45s SLA)</div>
						</div>
					</div>
				);
			} else if (lower.includes("refund") || lower.includes("recovery") || lower.includes("dispute")) {
				reasoningStr = "1. Queried spam records from D1 `lead_states` table where outcome='spam_skipped'.\n2. Built IndiaMart standard BuyLead dispute complaint format.\n3. Prepared credit reversal ticket for ₹350.";
				toolCallsList = [
					{ name: "d1_query(route: 'silent_spam')", latency: "11ms", status: "success" },
					{ name: "generate_refund_ticket(lead_id: 'IM-99180')", latency: "45ms", status: "success" },
				];
				responseNode = (
					<div className="flex flex-col gap-2.5">
						<p className="text-xs">
							Here is the drafted BuyLead Credit Dispute Ticket for lead <strong>#IM-99180</strong> (Student PPT Project):
						</p>
						<div className="rounded border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-mono space-y-1 text-foreground">
							<div className="text-amber-400 font-bold">Ticket Draft #REF-99180:</div>
							<div>Subject: BuyLead Credit Reversal Request - Irrelevant Academic Inquiry</div>
							<div>Buyer Requirement: "Pump Project PPT inquiry"</div>
							<div>Reason: Non-commercial / Student academic inquiry. Eligible under IndiaMart Buyer Quality Policy.</div>
							<div>Reversal Value: ₹350 BuyLead Balance</div>
						</div>
						<div className="flex gap-2">
							<Button size="sm" variant="outline" className="text-xs h-7 gap-1" asChild>
								<Link href="/recovery">
									<Coins className="h-3 w-3 text-amber-400" />
									<span>View in Recovery Ledger</span>
								</Link>
							</Button>
						</div>
					</div>
				);
			} else {
				responseNode = (
					<div className="flex flex-col gap-2 text-xs">
						<p>
							I have analyzed your query across your <strong>Bharat Pumps & Equipment</strong> catalog and live lead feeds.
						</p>
						<p className="text-muted-foreground">
							All 4 production agents are operating with active 45s SLA dispatch. You can ask me to simulate leads, review recovery claims, or filter high-priority industrial buyers.
						</p>
					</div>
				);
			}

			const botMsg: Message = {
				id: String(Date.now() + 1),
				role: "agent",
				author: "Eve Copilot",
				reasoning: reasoningStr,
				toolCalls: toolCallsList,
				content: responseNode,
				timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
			};

			setMessages((prev) => [...prev, botMsg]);
		}, 700);
	};

	return (
		<div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-background">
			{/* Left Sidebar: Conversations & Agents */}
			<aside className="hidden w-72 shrink-0 flex-col border-r border-border/80 bg-muted/20 md:flex">
				{/* New Chat Button */}
				<div className="p-3 border-b border-border/60">
					<Button
						variant="outline"
						className="w-full justify-start gap-2 text-xs bg-background hover:bg-muted font-medium"
						onClick={() => {
							setMessages(INITIAL_CONVERSATION);
						}}
					>
						<Plus className="h-3.5 w-3.5" />
						<span>New Conversation</span>
					</Button>
				</div>

				{/* Sessions List */}
				<div className="flex-1 overflow-y-auto p-2 space-y-1">
					<div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
						Recent Copilot Chats
					</div>
					{CHAT_SESSIONS.map((session) => (
						<button
							key={session.id}
							type="button"
							onClick={() => setActiveSessionId(session.id)}
							className={`w-full flex flex-col items-start gap-1 rounded-lg p-2.5 text-left text-xs transition-colors ${
								activeSessionId === session.id
									? "bg-card border border-border text-foreground shadow-xs"
									: "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
							}`}
						>
							<div className="flex w-full items-center justify-between">
								<span className="font-semibold truncate max-w-[150px]">{session.title}</span>
								<span className="text-[10px] text-muted-foreground">{session.timestamp}</span>
							</div>
							<span className="text-[11px] text-muted-foreground/80 line-clamp-1">
								{session.lastMessage}
							</span>
						</button>
					))}

					<div className="pt-4 px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
						<span>Micro-Agents</span>
						<Link href="/agents" className="text-[10px] text-amber-400 hover:underline">
							View All
						</Link>
					</div>
					<Link
						href="/agents"
						className="flex items-center gap-2 rounded-lg p-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground"
					>
						<Bot className="h-3.5 w-3.5 text-amber-400" />
						<span className="truncate">IndiaMart Speed Dispatcher</span>
					</Link>
					<Link
						href="/agents"
						className="flex items-center gap-2 rounded-lg p-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground"
					>
						<Code2 className="h-3.5 w-3.5 text-sky-400" />
						<span className="truncate">Pump Spec Catalog Qualifier</span>
					</Link>
					<Link
						href="/agents"
						className="flex items-center gap-2 rounded-lg p-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground"
					>
						<Coins className="h-3.5 w-3.5 text-amber-400" />
						<span className="truncate">Junk BuyLead Dispute Bot</span>
					</Link>
				</div>
			</aside>

			{/* Center: Main Agent Chat Interface */}
			<div className="flex flex-1 flex-col overflow-hidden bg-background">
				{/* Top Chat Header */}
				<div className="flex h-12 items-center justify-between border-b border-border/80 px-4 bg-card/40 backdrop-blur-sm">
					<div className="flex items-center gap-2.5">
						<div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
							<Bot className="size-4" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="text-xs font-bold text-foreground">Eve Lead Engine Copilot</span>
								<Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[9px] py-0">
									Active
								</Badge>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<Link
							href="/agents"
							className="hover:text-foreground transition-colors font-medium text-[11px]"
						>
							Manage Agents &rarr;
						</Link>
					</div>
				</div>

				{/* Message Feed */}
				<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-4xl w-full mx-auto">
					{messages.map((msg) => (
						<div
							key={msg.id}
							className={`flex flex-col gap-1.5 ${
								msg.role === "user" ? "items-end" : "items-start"
							}`}
						>
							{/* Message Bubble Shell */}
							<div
								className={`flex gap-3 max-w-2xl rounded-2xl p-4 text-sm ${
									msg.role === "user"
										? "bg-primary text-primary-foreground ml-12 rounded-tr-xs"
										: "bg-card border border-border/80 text-foreground mr-12 rounded-tl-xs shadow-xs"
								}`}
							>
								{msg.role === "agent" && (
									<div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-amber-400 mt-0.5 border border-border/60">
										<Sparkles className="size-4" />
									</div>
								)}

								<div className="flex flex-col gap-2 flex-1 min-w-0">
									{/* Collapsible Reasoning Block (Comp AI style) */}
									{msg.reasoning && (
										<div className="rounded-lg border border-border/60 bg-muted/40 p-2 text-xs">
											<button
												type="button"
												onClick={() => toggleReasoning(msg.id)}
												className="flex w-full items-center justify-between font-mono text-[11px] text-muted-foreground hover:text-foreground"
											>
												<span className="flex items-center gap-1.5">
													<Terminal className="h-3 w-3 text-amber-400" />
													<span>Reasoning Steps ({msg.toolCalls?.length ?? 1} tools)</span>
												</span>
												{expandedReasoning[msg.id] ? (
													<ChevronDown className="h-3.5 w-3.5" />
												) : (
													<ChevronRight className="h-3.5 w-3.5" />
												)}
											</button>

											{expandedReasoning[msg.id] && (
												<div className="mt-2 space-y-2 border-t border-border/40 pt-2">
													<p className="whitespace-pre-line text-muted-foreground font-mono text-[11px] leading-relaxed">
														{msg.reasoning}
													</p>
													{msg.toolCalls && (
														<div className="space-y-1 pt-1">
															{msg.toolCalls.map((t, idx) => (
																<div
																	key={idx}
																	className="flex items-center justify-between rounded bg-background/80 px-2 py-1 font-mono text-[10px] border border-border/40"
																>
																	<span className="text-sky-400 truncate">{t.name}</span>
																	<span className="text-amber-400 font-semibold">{t.latency}</span>
																</div>
															))}
														</div>
													)}
												</div>
											)}
										</div>
									)}

									{/* Main Content */}
									<div className="leading-relaxed">{msg.content}</div>

									<span className="text-[10px] text-muted-foreground self-end mt-1">
										{msg.timestamp}
									</span>
								</div>
							</div>
						</div>
					))}

					{isThinking && (
						<div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
							<Sparkles className="h-4 w-4 animate-spin text-amber-400" />
							<span>Eve is querying catalog & evaluating speed routing rules…</span>
						</div>
					)}
				</div>

				{/* Quick Prompt Suggestions */}
				<div className="px-4 py-2 border-t border-border/60 bg-muted/10">
					<div className="flex max-w-4xl mx-auto items-center gap-2 overflow-x-auto text-xs pb-1">
						<span className="text-[11px] text-muted-foreground shrink-0">Suggestions:</span>
						<button
							type="button"
							onClick={() => handleSendMessage("Simulate incoming CR-20 Multistage Pump webhook")}
							className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:border-amber-500/50 hover:text-amber-400 transition-colors shrink-0"
						>
							⚡ Simulate IndiaMart Webhook
						</button>
						<button
							type="button"
							onClick={() => handleSendMessage("Generate BuyLead refund dispute for junk lead")}
							className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:border-amber-500/50 hover:text-amber-400 transition-colors shrink-0"
						>
							🪙 Draft BuyLead Refund Dispute
						</button>
						<button
							type="button"
							onClick={() => handleSendMessage("Show 45s SLA response velocity metrics")}
							className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:border-sky-500/50 hover:text-sky-400 transition-colors shrink-0"
						>
							📊 45s Speed Latency Breakdown
						</button>
					</div>
				</div>

				{/* Bottom Input Composer */}
				<div className="p-4 border-t border-border/80 bg-card/60 backdrop-blur-md">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSendMessage();
						}}
						className="max-w-4xl mx-auto flex items-center gap-2"
					>
						<Input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Ask Eve about IndiaMart leads, pump catalog matching, or simulate an inquiry…"
							className="bg-background text-sm"
						/>
						<Button type="submit" size="icon" disabled={!input.trim() || isThinking} className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground">
							<Send className="h-4 w-4" />
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}

export default function ChatPage() {
	return (
		<Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading AI Copilot Studio…</div>}>
			<ChatContent />
		</Suspense>
	);
}
