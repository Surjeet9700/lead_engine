'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, HelpCircle, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RefundsPolicyPage() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-40">
				<div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
					<Link href="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-medium">
						<ArrowLeft className="size-4" />
						<span>Back to Home</span>
					</Link>
					<span className="text-xs font-mono text-muted-foreground">Legal &amp; Policy</span>
				</div>
			</header>

			<main className="mx-auto max-w-4xl px-6 py-12 pb-24">
				<header className="mb-10">
					<div className="flex items-center gap-2 mb-3">
						<Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs">
							Policy §3.2 &amp; Commercial Terms
						</Badge>
					</div>
					<h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
						Refund &amp; BuyLead Credit Dispute Policy
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						LeadSpeed Technologies Pvt Ltd · Last updated: 23 August 2026
					</p>
				</header>

				<article className="space-y-8 text-sm leading-relaxed text-muted-foreground">
					<section className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">1. SaaS Subscription Refund Policy</h2>
						<p>
							LeadSpeed provides a <strong>14-day risk-free trial</strong> on all monthly and annual plans. If you are unsatisfied with our platform within 14 days of your initial paid activation, you may request a 100% full refund of your subscription fee with no questions asked.
						</p>
						<p>
							After the 14-day trial period, subscription renewals are non-refundable. You may cancel your subscription at any time from your <em>Settings → Billing</em> dashboard to prevent future charges.
						</p>
					</section>

					<section className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">2. IndiaMart BuyLead Dispute &amp; Credit Recovery Support</h2>
						<p>
							IndiaMart operates its own marketplace policies regarding seller BuyLead consumption. Under the official <strong>IndiaMart Buyer Quality Policy §3.2</strong> (Non-Commercial Academic Inquiries) and <strong>§1.4</strong> (Invalid or Non-Working Telephony Credentials), sellers are eligible to receive BuyLead credits back for fake or fraudulent leads.
						</p>
						<div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-foreground space-y-2">
							<p className="font-semibold text-amber-400">What LeadSpeed Automates:</p>
							<ul className="list-disc pl-5 space-y-1 text-muted-foreground">
								<li>Detects academic keywords (&quot;college project&quot;, &quot;student thesis&quot;, &quot;presentation circuit&quot;) within 2ms of ingestion.</li>
								<li>Identifies dummy phone numbers or repeated telemarketing spam.</li>
								<li>Auto-generates official dispute evidence drafts referencing IndiaMart Policy §3.2 and §1.4.</li>
								<li>Submits or formats claims for your account team to file for ₹350/credit reversal.</li>
							</ul>
						</div>
						<p className="text-xs">
							<strong>Disclaimer:</strong> LeadSpeed provides automated evidence formatting and policy-grounded dispute submission tools. Final approval and credit reversal is administered by IndiaMart InterMESH Ltd under their seller agreement.
						</p>
					</section>

					<section className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">3. Sub-45s SLA Performance Credits</h2>
						<p>
							On Growth and Enterprise tiers, LeadSpeed guarantees a <strong>99.9% uptime</strong> and sub-45s webhook processing SLA. If our edge servers experience downtime causing dropped or delayed IndiaMart webhooks exceeding our SLA, impacted accounts receive proportional service credits applied to their next billing cycle.
						</p>
					</section>

					<section className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
						<h2 className="text-base font-bold text-foreground">4. Contact &amp; Dispute Support</h2>
						<p>
							For any billing, dispute, or credit inquiries, contact our billing desk directly:
						</p>
						<p className="font-mono text-xs text-foreground">
							Email: billing@leadspeed.in<br />
							WhatsApp Support: +91 40 6828 9000<br />
							LeadSpeed Technologies Pvt Ltd · Hitec City, Hyderabad 500081, India
						</p>
					</section>
				</article>
			</main>
		</div>
	);
}
