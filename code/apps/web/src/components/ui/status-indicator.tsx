import { cn } from "@/lib/utils";
import type * as React from "react";

export type StatusTone = "success" | "warning" | "destructive" | "neutral" | "info";

const TONE_STYLES: Record<StatusTone, { dot: string; ping: string; text: string }> = {
	success: {
		dot: "bg-amber-500",
		ping: "bg-amber-400",
		text: "text-amber-500",
	},
	warning: {
		dot: "bg-amber-500",
		ping: "bg-amber-400",
		text: "text-amber-500",
	},
	destructive: {
		dot: "bg-rose-500",
		ping: "bg-rose-400",
		text: "text-rose-500",
	},
	info: {
		dot: "bg-sky-500",
		ping: "bg-sky-400",
		text: "text-sky-500",
	},
	neutral: {
		dot: "bg-zinc-500",
		ping: "bg-zinc-400",
		text: "text-zinc-400",
	},
};

export function StatusIndicator({
	tone = "success",
	pulse = false,
	label,
	className,
}: {
	tone?: StatusTone;
	pulse?: boolean;
	label?: string;
	className?: string;
}) {
	const styles = TONE_STYLES[tone];

	return (
		<span className={cn("inline-flex items-center gap-1.5 font-medium text-xs", styles.text, className)}>
			<span className="relative flex h-2 w-2">
				{pulse && (
					<span
						className={cn(
							"absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
							styles.ping,
						)}
					/>
				)}
				<span className={cn("relative inline-flex h-2 w-2 rounded-full", styles.dot)} />
			</span>
			{label && <span>{label}</span>}
		</span>
	);
}
