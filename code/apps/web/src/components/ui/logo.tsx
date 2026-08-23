import { cn } from "@/lib/utils";
import type * as React from "react";

export function Logo({
	className,
	showWordmark = true,
	...props
}: React.ComponentProps<"div"> & { showWordmark?: boolean }) {
	return (
		<div className={cn("inline-flex items-center gap-2.5 font-semibold", className)} {...props}>
			{/* Logo Icon Placeholder with glowing badge */}
			<div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-gradient-to-br from-zinc-800 to-zinc-950 text-foreground shadow-sm">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="size-4 text-amber-400"
				>
					<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
				</svg>
			</div>
			{showWordmark && (
				<div className="flex flex-col text-left">
					<span className="font-semibold text-sm leading-none tracking-tight text-foreground">
						LeadSpeed CRM
					</span>
					<span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
						Industrial Lead Engine
					</span>
				</div>
			)}
		</div>
	);
}

export default Logo;
