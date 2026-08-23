import { cn } from "@/lib/utils";
import Image from "next/image";
import type * as React from "react";

export function Logo({
	className,
	showWordmark = true,
	...props
}: React.ComponentProps<"div"> & { showWordmark?: boolean }) {
	return (
		<div className={cn("inline-flex items-center gap-2.5 font-semibold", className)} {...props}>
			{/* Axis Geometric Icon Mark */}
			<div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-gradient-to-br from-zinc-900 to-zinc-950 text-foreground shadow-xs">
				<svg
					width="18"
					height="16"
					viewBox="0 0 24 21"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg"
					className="text-amber-400"
				>
					<path
						d="M4.0678 8.56132L22.79 13.4457C23.5032 13.6318 24 14.2666 24 14.9922V18.5H19.9322V16.8383L12.0004 14.7692L4.0678 16.8383V18.5H0V14.9922C1.84676e-06 14.2666 0.496751 13.6318 1.21001 13.4457L4.0682 12.6996L1.21001 11.9543C0.496743 11.7682 1.23078e-05 11.1334 0 10.4078V8.1C0 7.21636 0.728485 6.5 1.62712 6.5H4.0678V8.56132Z"
					/>
					<path
						d="M22.3728 6.5C23.2714 6.5 23.9999 7.21636 23.9999 8.1V10.5H19.9321V6.5H22.3728Z"
					/>
					<path
						d="M18.3052 2.5C19.2038 2.5 19.9323 3.21634 19.9323 4.1V6.5H4.06787V4.1C4.06787 3.21634 4.79637 2.5 5.69499 2.5H18.3052Z"
					/>
				</svg>
			</div>

			{showWordmark && (
				<div className="flex flex-col text-left">
					<div className="flex items-center gap-1.5">
						<span className="font-bold text-sm leading-none tracking-tight text-foreground">
							AXIS
						</span>
						<span className="rounded bg-amber-500/10 border border-amber-500/30 px-1 py-0.2 text-[9px] font-semibold text-amber-400">
							CRM
						</span>
					</div>
					<span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
						Industrial Lead Engine
					</span>
				</div>
			)}
		</div>
	);
}

export default Logo;
