'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SECTIONS = [
	{ id: 'collect', title: '1. What Data We Collect' },
	{ id: 'storage', title: '2. Where It Is Stored & Encrypted' },
	{ id: 'dont', title: '3. What We Do NOT Do (No Data Resale)' },
	{ id: 'rights', title: '4. Your Rights Under DPDP Act 2023' },
	{ id: 'retention', title: '5. Data Retention & Purge Policy' },
	{ id: 'contact', title: '6. Grievance Officer & Contact' },
];

export default function PrivacyPage() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-40">
				<div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
					<Link href="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-medium">
						<ArrowLeft className="size-4" />
						<span>Back to Home</span>
					</Link>
					<span className="text-xs font-mono text-muted-foreground">Legal &amp; Data Protection</span>
				</div>
			</header>

			<main className="mx-auto max-w-4xl px-6 py-12 pb-24">
				<header className="mb-10">
					<div className="flex items-center gap-2 mb-3">
						<Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs">
							<ShieldCheck className="size-3.5 mr-1" /> DPDPA 2023 Certified Compliance
						</Badge>
					</div>
					<h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
						Privacy &amp; Data Protection Policy
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						LeadSpeed Technologies Pvt Ltd · Last updated: 23 August 2026
					</p>
				</header>

				<nav className="mb-10 rounded-xl border border-border/80 bg-card p-5">
					<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Contents
					</p>
					<ul className="space-y-1.5">
						{SECTIONS.map((s) => (
							<li key={s.id}>
								<a href={`#${s.id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
									{s.title}
								</a>
							</li>
						))}
					</ul>
				</nav>

				<article className="space-y-8 text-sm leading-relaxed text-muted-foreground">
					<section id="collect" className="rounded-xl border border-border/80 bg-card p-6 space-y-4">
						<h2 className="text-base font-bold text-foreground">1. What Data We Collect</h2>
						<div className="space-y-3">
							<div className="rounded-lg border border-border/60 bg-muted/20 p-4">
								<p className="font-semibold text-foreground text-xs">IndiaMart Buyer Lead Telemetry</p>
								<p className="text-xs mt-1">
									Fetched via your authenticated IndiaMart Push API / Webhook: buyer name, contact telephone, product enquiry specifications (HP, pressure, flow, volume, kVA), and city location.
								</p>
							</div>
							<div className="rounded-lg border border-border/60 bg-muted/20 p-4">
								<p className="font-semibold text-foreground text-xs">Seller Enterprise Business Profile</p>
								<p className="text-xs mt-1">
									Company legal name, authorized GSTIN, WhatsApp Business API account token, catalog SKU pricing table, and telephony routing preferences.
								</p>
							</div>
						</div>
					</section>

					<section id="storage" className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">2. Where It Is Stored &amp; Encrypted</h2>
						<p>
							All data is stored exclusively on Cloudflare D1 distributed database partitions located within the Republic of India and Asia-Pacific (APAC) data centers.
						</p>
						<p>
							All data is cryptographically protected with AES-256 encryption at rest and TLS 1.3 in transit. We maintain strict tenant data isolation preventing cross-account access.
						</p>
					</section>

					<section id="dont" className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">3. What We Do NOT Do (Zero Data Monetization)</h2>
						<ul className="list-disc space-y-1.5 pl-6 text-xs text-muted-foreground">
							<li><strong className="text-foreground">We never sell lead data:</strong> We do not sell, rent, license, or monetize your buyer leads to any third party, competitor, or broker.</li>
							<li><strong className="text-foreground">No public AI training:</strong> Your proprietary product catalogs and buyer interactions are never used to train public generative models.</li>
							<li><strong className="text-foreground">No direct buyer outreach:</strong> We never contact your buyers except to dispatch the automated quotes and notifications you configure.</li>
						</ul>
					</section>

					<section id="rights" className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">4. Your Rights Under the DPDP Act 2023</h2>
						<p>
							Under the Digital Personal Data Protection Act, 2023, data principals have statutory rights to access, rectify, and erase personal records.
						</p>
						<ul className="list-disc space-y-1.5 pl-6 text-xs text-muted-foreground">
							<li><span className="font-medium text-foreground">Right to Access:</span> Download full JSON/CSV export of all processed leads directly from your CRM.</li>
							<li><span className="font-medium text-foreground">Right to Correction:</span> Instantly update or rectify any business or buyer details.</li>
							<li><span className="font-medium text-foreground">Right to Erasure:</span> Request complete purging of your account and all associated telemetry within 30 days.</li>
						</ul>
					</section>

					<section id="retention" className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">5. Data Retention &amp; Purge Policy</h2>
						<p>
							Leads with no activity are automatically archived after 90 days. Upon subscription cancellation, all personal buyer lead records are permanently wiped from edge database tables within 30 days.
						</p>
					</section>

					<section id="contact" className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">6. Grievance Officer &amp; Statutory Contact</h2>
						<div className="rounded-lg border border-border/60 bg-muted/30 p-4 font-mono text-xs text-foreground space-y-1">
							<p className="font-bold">Grievance Officer: Surjeet Kumar</p>
							<p>Email: grievance@leadspeed.in</p>
							<p>Address: LeadSpeed Technologies Pvt Ltd, Hitec City, Hyderabad, Telangana 500081</p>
							<p className="text-muted-foreground">Response SLA: Within 30 days per Section 13 of the DPDPA.</p>
						</div>
					</section>
				</article>

				<footer className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-border/80 pt-6 text-xs text-muted-foreground gap-4">
					<span>© 2026 LeadSpeed Technologies Pvt Ltd.</span>
					<div className="flex items-center gap-4">
						<Link href="/legal/terms" className="hover:text-foreground">Terms of Service</Link>
						<Link href="/legal/refunds" className="hover:text-foreground">Refund Policy</Link>
						<Link href="/legal/security" className="hover:text-foreground">Security</Link>
					</div>
				</footer>
			</main>
		</div>
	);
}
