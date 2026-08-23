'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Lock, Server, CheckCircle2, ArrowLeft, Key, Database, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SecurityCompliancePage() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-40">
				<div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
					<Link href="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-medium">
						<ArrowLeft className="size-4" />
						<span>Back to Home</span>
					</Link>
					<span className="text-xs font-mono text-muted-foreground">Security &amp; Trust</span>
				</div>
			</header>

			<main className="mx-auto max-w-4xl px-6 py-12 pb-24">
				<header className="mb-10">
					<div className="flex items-center gap-2 mb-3">
						<Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs">
							<ShieldCheck className="size-3.5 mr-1" /> Edge-Native Zero Trust Architecture
						</Badge>
					</div>
					<h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
						Enterprise Security &amp; Data Compliance
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Comprehensive protection for IndiaMart lead pipelines, buyer telemetry, and WhatsApp Cloud credentials.
					</p>
				</header>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
					<div className="rounded-xl border border-border/80 bg-card p-4">
						<div className="flex items-center gap-2 text-amber-400">
							<Lock className="size-4" />
							<span className="text-xs font-semibold">AES-256 Encryption</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1.5">
							All lead records and payloads encrypted at rest and in transit via TLS 1.3.
						</p>
					</div>

					<div className="rounded-xl border border-border/80 bg-card p-4">
						<div className="flex items-center gap-2 text-sky-400">
							<Database className="size-4" />
							<span className="text-xs font-semibold">Isolated Multi-Tenant D1</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1.5">
							Strict tenant partitioning ensures zero cross-seller data exposure.
						</p>
					</div>

					<div className="rounded-xl border border-border/80 bg-card p-4">
						<div className="flex items-center gap-2 text-amber-400">
							<ShieldCheck className="size-4" />
							<span className="text-xs font-semibold">DPDP Act 2023</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1.5">
							Full compliance with Indian Digital Personal Data Protection Act.
						</p>
					</div>
				</div>

				<article className="space-y-8 text-sm leading-relaxed text-muted-foreground">
					<section className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">1. Edge-Native Compute Security (Cloudflare)</h2>
						<p>
							LeadSpeed operates on Cloudflare’s globally distributed serverless edge network across 300+ data centers worldwide, including Hyderabad, Mumbai, Chennai, and New Delhi.
						</p>
						<ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
							<li>Zero origin server exposure; all endpoints protected by Cloudflare Web Application Firewall (WAF) and automated DDoS mitigation.</li>
							<li>Sub-10ms localized compute execution prevents cross-border data transfer delays.</li>
							<li>Immutable runtime workers with zero persistent local file system vulnerabilities.</li>
						</ul>
					</section>

					<section className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">2. IndiaMart Webhook Integrity &amp; Verification</h2>
						<p>
							Every incoming BuyLead webhook is cryptographically validated using bearer tokens and unique query ID idempotency locks.
						</p>
						<div className="rounded-lg border border-border/60 bg-muted/30 p-4 font-mono text-xs text-foreground space-y-1">
							<p className="text-muted-foreground">// Edge Webhook Guard Pipeline</p>
							<p>1. Bearer Token Verification &rarr; <code>crypto.timingSafeEqual()</code></p>
							<p>2. Deduplication Lock &rarr; <code>{"KV.put(leadId, { expirationTtl: 86400 })"}</code></p>
							<p>3. Spec Extraction &rarr; Zero external LLM exposure</p>
						</div>
					</section>

					<section className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">3. WhatsApp Cloud API &amp; Meta Compliance</h2>
						<p>
							All WhatsApp interactive messages and quotation dispatches adhere to Meta’s Business Messaging Policy and WhatsApp Cloud API v25.0 guidelines.
						</p>
						<ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
							<li>Official pre-approved utility and marketing templates registered on Meta Business Manager.</li>
							<li>Automated Quiet Hours Guard enforcing no automated WhatsApp pings between 22:00 and 07:00 IST.</li>
							<li>Opt-out &amp; STOP message handling compliant with telecom regulations.</li>
						</ul>
					</section>

					<section className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">4. Vulnerability Disclosure &amp; Security Contact</h2>
						<p>
							We maintain an active security program. If you discover a potential vulnerability, please report it immediately to our security response team:
						</p>
						<p className="font-mono text-xs text-foreground">
							Security Desk: security@leadspeed.in<br />
							PGP Key Fingerprint: 4F92 B8A1 73C0 891E D3A2 9011<br />
							Response SLA: Within 4 hours
						</p>
					</section>
				</article>
			</main>
		</div>
	);
}
