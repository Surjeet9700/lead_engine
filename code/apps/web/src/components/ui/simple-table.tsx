import { cn } from "@/lib/utils";
import type * as React from "react";

export type SimpleTableColumn = {
	id: string;
	header?: React.ReactNode;
	srLabel?: string;
	width?: string;
	align?: "left" | "center" | "right";
	className?: string;
};

export function SimpleTable({
	columns,
	children,
	className,
}: {
	columns: SimpleTableColumn[];
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("w-full overflow-x-auto", className)}>
			<table className="w-full text-left text-sm">
				<thead>
					<tr className="border-b border-border/80 text-muted-foreground text-xs">
						{columns.map((col) => (
							<th
								key={col.id}
								scope="col"
								className={cn(
									"px-4 py-3 font-medium",
									col.width,
									col.align === "right" && "text-right",
									col.align === "center" && "text-center",
									col.className,
								)}
							>
								{col.header ?? (col.srLabel ? <span className="sr-only">{col.srLabel}</span> : null)}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="divide-y divide-border/40 font-normal">
					{children}
				</tbody>
			</table>
		</div>
	);
}

export function SimpleTableRow({
	children,
	onClick,
	className,
}: {
	children: React.ReactNode;
	onClick?: () => void;
	className?: string;
}) {
	return (
		<tr
			onClick={onClick}
			className={cn(
				"transition-colors hover:bg-muted/40",
				onClick && "cursor-pointer",
				className,
			)}
		>
			{children}
		</tr>
	);
}
