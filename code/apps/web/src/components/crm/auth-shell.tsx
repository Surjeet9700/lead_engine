"use client";

import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import React, { type ReactNode } from "react";
import { AuthShader } from "./auth-shader";

export function AuthShell({ children }: { children: ReactNode }) {
	return (
		<main className="dark grid min-h-svh bg-background text-foreground lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
			<section className="relative hidden min-h-svh overflow-hidden bg-muted p-8 lg:flex lg:flex-col lg:justify-between xl:p-12 border-r border-border/60">
				<AuthShader />

				<div className="relative flex gap-2 text-sm/5 z-10">
					<Link href="/" aria-label="Homepage" className="flex items-center gap-2">
						<Logo className="size-6 shrink-0" />
					</Link>
				</div>

				<div className="relative flex max-w-lg flex-col gap-6 z-10">
					<div className="flex flex-col gap-3">
						<p className="font-mono text-xs font-semibold text-amber-400 tracking-wider uppercase">
							IndiaMart Lead Velocity Engine
						</p>
						<h1 className="max-w-[16ch] text-4xl xl:text-5xl font-bold tracking-tight text-balance leading-tight">
							Every lead answered in 45s. On WhatsApp.
						</h1>
						<p className="text-sm text-muted-foreground leading-relaxed mt-2">
							Sub-second webhook capture, automated pump spec catalog matching, instant quotation dispatch, and automated BuyLead dispute refunds.
						</p>
					</div>
				</div>

				<div className="relative z-10 flex items-center justify-between font-mono text-xs text-muted-foreground border-t border-border/40 pt-4">
					<span>B2B Industrial Machinery Network</span>
					<span>Powered by Cloudflare Workers &amp; D1</span>
				</div>
			</section>

			<section className="flex min-h-svh flex-col bg-background px-6 py-8 sm:px-10 lg:px-14">
				<div className="flex gap-2 text-sm/5 max-lg:hidden lg:invisible">
					<Logo className="size-6 shrink-0" />
				</div>

				<div className="flex flex-1 items-center justify-center py-12">
					<div className="flex w-full max-w-sm flex-col gap-8">{children}</div>
				</div>
			</section>
		</main>
	);
}

export function AuthHeading({
	title,
	description,
}: {
	title: string;
	description: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3 text-left">
			<Link href="/" aria-label="Homepage" className="flex lg:hidden mb-2">
				<Logo className="size-6 shrink-0" />
			</Link>
			<div className="flex flex-col gap-1.5">
				<h2 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
					{title}
				</h2>
				<p className="text-sm text-muted-foreground text-pretty">
					{description}
				</p>
			</div>
		</div>
	);
}
