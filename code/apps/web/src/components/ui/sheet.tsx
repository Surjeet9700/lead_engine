"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { X } from "lucide-react";

interface SheetContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined);

export function Sheet({
	open,
	onOpenChange,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: React.ReactNode;
}) {
	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [open]);

	return (
		<SheetContext.Provider value={{ open, setOpen: onOpenChange }}>
			{children}
		</SheetContext.Provider>
	);
}

export function SheetContent({
	side = "right",
	className,
	showCloseButton = true,
	children,
}: {
	side?: "left" | "right";
	className?: string;
	showCloseButton?: boolean;
	children: React.ReactNode;
}) {
	const context = React.useContext(SheetContext);
	if (!context || !context.open) return null;

	return (
		<div className="fixed inset-0 z-50 flex">
			{/* Backdrop */}
			<div
				onClick={() => context.setOpen(false)}
				className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
			/>

			{/* Sheet Container */}
			<div
				className={cn(
					"fixed inset-y-0 z-50 flex h-full flex-col border-border bg-background p-6 shadow-2xl transition ease-in-out duration-300",
					side === "right" && "right-0 w-full max-w-xl border-l animate-in slide-in-from-right",
					side === "left" && "left-0 w-full max-w-sm border-r animate-in slide-in-from-left",
					className,
				)}
			>
				{showCloseButton && (
					<button
						type="button"
						onClick={() => context.setOpen(false)}
						className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
					>
						<X className="h-4 w-4 text-muted-foreground" />
						<span className="sr-only">Close</span>
					</button>
				)}
				{children}
			</div>
		</div>
	);
}

export function SheetHeader({
	className,
	children,
}: React.ComponentProps<"div">) {
	return (
		<div className={cn("flex flex-col gap-1.5 text-left mb-4", className)}>
			{children}
		</div>
	);
}

export function SheetTitle({
	className,
	children,
}: React.ComponentProps<"h2">) {
	return (
		<h2 className={cn("text-lg font-semibold text-foreground tracking-tight", className)}>
			{children}
		</h2>
	);
}

export function SheetDescription({
	className,
	children,
}: React.ComponentProps<"p">) {
	return (
		<p className={cn("text-sm text-muted-foreground", className)}>
			{children}
		</p>
	);
}
