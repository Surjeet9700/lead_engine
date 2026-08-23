'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SECTIONS = [
	{ id: 'acceptance', title: '1. Acceptance of Terms' },
	{ id: 'service', title: '2. Description of Enterprise Service' },
	{ id: 'account', title: '3. IndiaMart Integration & Independence' },
	{ id: 'whatsapp', title: '4. WhatsApp & TRAI 160 DLT Compliance' },
	{ id: 'payment', title: '5. Subscription & GST Invoicing' },
	{ id: 'data', title: '6. Enterprise Data Processing' },
	{ id: 'liability', title: '7. Limitation of Liability' },
	{ id: 'law', title: '8. Governing Law & Dispute Resolution' },
];

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-40">
				<div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
					<Link href="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-medium">
						<ArrowLeft className="size-4" />
						<span>Back to Home</span>
					</Link>
					<span className="text-xs font-mono text-muted-foreground">Legal &amp; Terms</span>
				</div>
			</header>

			<main className="mx-auto max-w-4xl px-6 py-12 pb-24">
				<header className="mb-10">
					<div className="flex items-center gap-2 mb-3">
						<Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs">
							Enterprise B2B SaaS Agreement
						</Badge>
					</div>
					<h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
						Terms of Service
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
					<section id="acceptance" className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">1. Acceptance of Terms</h2>
						<p>
							By signing up for, deploying, or utilizing the LeadSpeed CRM and IndiaMart Speed Engine platform (&quot;the Service&quot;), you enter into a legally binding agreement with LeadSpeed Technologies Pvt Ltd. If acting on behalf of a registered corporate or proprietorship entity, you represent and warrant that you hold full corporate authority to execute this agreement.
						</p>
					</section>

					<section id="service" className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">2. Description of Enterprise Service</h2>
						<p>
							LeadSpeed provides an autonomous edge-native lead capture, technical specification qualification, dynamic PDF quotation generator, and multilingual telephony bridge platform for B2B industrial enterprises. Core deliverables include:
						</p>
						<ul className="list-disc space-y-1 pl-6 text-xs text-muted-foreground">
							<li>Sub-45s automated WhatsApp interactive quotation dispatches.</li>
							<li>Multi-industry dynamic schema engine (Pumps, Compressors, DG Sets, Motors, Solar, Custom).</li>
							<li>Automated BuyLead junk inquiry dispute evidence generator under IndiaMart Policy §3.2 &amp; §1.4.</li>
							<li>Exotel 160 DLT telephony and Sarvam Bulbul multilingual voice fallback bridge.</li>
							<li>Eve AI Copilot Studio for conversational pipeline analytics and seller automation rules.</li>
						</ul>
					</section>

					<section id="account" className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">3. IndiaMart Integration &amp; Independence</h2>
						<p>
							LeadSpeed connects to your IndiaMart seller account via your unique Webhook Push URL and CRM Key.
						</p>
						<ul className="list-disc space-y-1 pl-6 text-xs text-muted-foreground">
							<li>LeadSpeed is an independent software automation vendor and is not affiliated with or endorsed by IndiaMart InterMESH Ltd.</li>
							<li>You maintain your own commercial subscription with IndiaMart. LeadSpeed does not sell, resell, or intermediate marketplace BuyLead packages.</li>
						</ul>
					</section>

					<section id="whatsapp" className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">4. WhatsApp &amp; TRAI 160 DLT Compliance</h2>
						<p>
							Messaging is conducted via Meta’s official WhatsApp Cloud API and TRAI-compliant 160-series telephony routes.
						</p>
						<ul className="list-disc space-y-1 pl-6 text-xs text-muted-foreground">
							<li>You agree not to dispatch prohibited commercial spam, misleading pricing, or unapproved template variations.</li>
							<li>Our Quiet Hours Guard automatically enforces quiet periods (22:00 to 07:00 IST) to prevent telecom non-compliance.</li>
						</ul>
					</section>

					<section id="payment" className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">5. Subscription &amp; GST Invoicing</h2>
						<p>
							Subscriptions are billed in advance on a monthly or annual basis in Indian Rupees (INR). All subscription fees are subject to 18% GST. Valid tax invoices with your company GSTIN are issued automatically upon each billing cycle.
						</p>
					</section>

					<section id="data" className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">6. Enterprise Data Processing</h2>
						<p>
							You retain all ownership, intellectual property rights, and title to your buyer lead telemetry and customer databases. We act strictly as a Data Processor under the Digital Personal Data Protection Act (DPDP Act 2023).
						</p>
					</section>

					<section id="liability" className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">7. Limitation of Liability</h2>
						<p>
							In no event shall LeadSpeed Technologies Pvt Ltd be liable for any indirect, incidental, punitive, or exemplary damages resulting from third-party marketplace API outages, carrier delivery failures, or buyer communication disputes. Maximum aggregate liability is limited to fees paid during the preceding 3 months.
						</p>
					</section>

					<section id="law" className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">8. Governing Law &amp; Dispute Resolution</h2>
						<p>
							These Terms are governed by and construed in accordance with the substantive laws of the Republic of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in Hyderabad, Telangana, India.
						</p>
					</section>
				</article>

				<footer className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-border/80 pt-6 text-xs text-muted-foreground gap-4">
					<span>© 2026 LeadSpeed Technologies Pvt Ltd.</span>
					<div className="flex items-center gap-4">
						<Link href="/legal/privacy" className="hover:text-foreground">Privacy Policy</Link>
						<Link href="/legal/refunds" className="hover:text-foreground">Refund Policy</Link>
						<Link href="/legal/security" className="hover:text-foreground">Security</Link>
					</div>
				</footer>
			</main>
		</div>
	);
}
