"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export function MessageBubble({
	role,
	content,
	timestamp,
	author,
	reasoning,
	className,
}: {
	role: "user" | "agent" | "system";
	content: React.ReactNode;
	timestamp?: string;
	author?: string;
	reasoning?: string;
	className?: string;
}) {
	const isUser = role === "user";

	return (
		<div
			className={cn(
				"flex w-full flex-col gap-1.5",
				isUser ? "items-end" : "items-start",
				className,
			)}
		>
			<div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
				<span className="font-medium">{author ?? (isUser ? "You" : "Eve Copilot")}</span>
				{timestamp && <span>· {timestamp}</span>}
			</div>

			{reasoning && (
				<div className="max-w-[85%] rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
					<div className="font-medium text-foreground/80 mb-1 flex items-center gap-1.5">
						<span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
						Thought process
					</div>
					<p className="leading-relaxed">{reasoning}</p>
				</div>
			)}

			<div
				className={cn(
					"max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
					isUser
						? "bg-primary text-primary-foreground rounded-br-xs"
						: "bg-muted/70 text-foreground border border-border/70 rounded-bl-xs",
				)}
			>
				{content}
			</div>
		</div>
	);
}

export function ThinkingIndicator() {
	return (
		<div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/70 px-4 py-3 text-sm text-muted-foreground w-fit">
			<div className="flex gap-1 items-center">
				<span className="size-1.5 rounded-full bg-foreground/60 animate-bounce [animation-delay:-0.3s]" />
				<span className="size-1.5 rounded-full bg-foreground/60 animate-bounce [animation-delay:-0.15s]" />
				<span className="size-1.5 rounded-full bg-foreground/60 animate-bounce" />
			</div>
			<span className="text-xs">Thinking & analyzing leads…</span>
		</div>
	);
}
