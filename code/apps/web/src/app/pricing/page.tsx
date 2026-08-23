'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	Check,
	Sparkles,
	Zap,
	ShieldCheck,
	Calculator,
	ArrowRight,
	HelpCircle,
	CheckCircle2,
	Lock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/templates/axis/navbar';
import Footer from '@/components/templates/axis/footer';

const PLANS = [
	{
		id: 'starter',
		name: 'Starter Engine',
		tagline: 'For specialized dealers focusing on 1 primary equipment category.',
		monthlyPrice: 4999,
		annualPrice: 3999,
		features: [
			'1 Primary Equipment Line (Pumps OR Compressors)',
			'Sub-45s WhatsApp Auto-Quote Dispatch',
			'Dynamic Spec & Attribute Extraction Engine',
			'Up to 400 Inbound BuyLeads / month',
			'Standard WhatsApp Template Library',
			'Daily 21:00 IST Performance Digest',
			'Community & Email Support (24h SLA)',
		],
		limitations: [
			'No Automated BuyLead Dispute Recovery',
			'No Exotel AI Voice Telephony Fallback',
			'Single Category Only',
		],
		cta: 'Start 14-Day Free Trial',
		popular: false,
	},
	{
		id: 'growth',
		name: 'Growth Multi-Category',
		tagline: 'For high-velocity distributors operating across multiple machinery verticals.',
		monthlyPrice: 11999,
		annualPrice: 9599,
		features: [
			'Unlimited Machinery Categories (Multi-Vertical)',
			'Ultra-fast Sub-15s Edge Dispatch Guarantee',
			'Automated BuyLead Junk Dispute & ₹350 Credit Recovery',
			'Exotel 160 DLT Multilingual Voice Bridge (Telugu, Hindi, English)',
			'Dynamic PDF Quotation Generator with GSTIN & UPI Pay QR',
			'Up to 2,000 Inbound BuyLeads / month',
			'Eve Copilot Studio & Multi-Agent Fleet Control',
			'Priority WhatsApp Engineering Support (1h SLA)',
		],
		limitations: [],
		cta: 'Deploy Growth Engine',
		popular: true,
	},
	{
		id: 'enterprise',
		name: 'Enterprise OEM',
		tagline: 'For multi-branch manufacturers and OEMs requiring custom ERP/SAP integration.',
		monthlyPrice: 24999,
		annualPrice: 19999,
		features: [
			'Everything in Growth Multi-Category',
			'Custom ERP / SAP / Tally Cloud Webhook Sync',
			'Dedicated WhatsApp Business WABA Number & DLT Caller ID',
			'Custom Voice AI Fine-tuning on Seller Catalog & Pricing Matrix',
			'Unlimited Monthly BuyLeads & Webhooks',
			'Multi-Branch & Territory Routing Rules',
			'99.99% Edge Uptime SLA with Financial Backing',
			'Dedicated Solution Architect & On-site Account Manager',
		],
		limitations: [],
		cta: 'Contact Enterprise Sales',
		popular: false,
	},
];

const COMPARISON_ROWS = [
	{
		category: 'Speed-to-Lead & Dispatch',
		items: [
			{ feature: 'IndiaMart Webhook Capture Latency', starter: '<100ms', growth: '<50ms', enterprise: '<20ms Edge' },
			{ feature: 'End-to-End WhatsApp Dispatch SLA', starter: '<45 seconds', growth: '<15 seconds', enterprise: '<5 seconds' },
			{ feature: 'Quiet Hours Intelligent Queue (22:00–07:00 IST)', starter: '✓ Included', growth: '✓ Included', enterprise: '✓ Custom Schedule' },
			{ feature: 'Concurrent Lead Ingestion Capacity', starter: '100 / min', growth: '1,000 / min', enterprise: 'Unlimited' },
		],
	},
	{
		category: 'Technical Qualification & Quoting',
		items: [
			{ feature: 'Supported Product Categories', starter: '1 Category', growth: 'Unlimited', enterprise: 'Unlimited + Custom' },
			{ feature: 'Dynamic Unit Normalization (kW→HP, PSI→Bar, ft→m)', starter: '✓ Basic', growth: '✓ Advanced Multi-Unit', enterprise: '✓ Custom Matrices' },
			{ feature: 'Dynamic PDF Quotation Generation', starter: 'Standard Template', growth: 'Custom GSTIN + UPI QR', enterprise: 'ERP Dynamic Template' },
			{ feature: 'Live Catalog Inventory & SKU Matching', starter: 'Up to 50 SKUs', growth: 'Up to 1,000 SKUs', enterprise: 'Unlimited ERP Sync' },
		],
	},
	{
		category: 'Dispute Recovery & Telephony',
		items: [
			{ feature: 'Automated BuyLead ₹350 Dispute Filing', starter: '—', growth: '✓ Auto-Draft & File', enterprise: '✓ Full Auto Ledger' },
			{ feature: 'Exotel 160 DLT Voice AI Fallback Calls', starter: '—', growth: '✓ Telugu, Hindi, English', enterprise: '✓ Custom Regional Models' },
			{ feature: 'DTMF Key 1 Dealer-to-Buyer Live Bridge', starter: '—', growth: '✓ Sub-second Bridge', enterprise: '✓ Multi-Agent Routing' },
			{ feature: 'Call Recording & Telemetry Dashboard', starter: '—', growth: '✓ 30 Days Retention', enterprise: '✓ 1 Year Retention' },
		],
	},
	{
		category: 'Security & Enterprise Support',
		items: [
			{ feature: 'IndiaMart DPDPA 2023 Data Protection', starter: '✓ AES-256', growth: '✓ AES-256', enterprise: '✓ Dedicated Isolated D1' },
			{ feature: 'Support SLA & Channels', starter: 'Email (24h)', growth: 'WhatsApp + Phone (1h)', enterprise: 'Dedicated Architect (15m)' },
			{ feature: 'GST Invoicing with Input Tax Credit (ITC)', starter: '✓ 18% GST Invoice', growth: '✓ 18% GST Invoice', enterprise: '✓ 18% GST Invoice' },
		],
	},
];

const FAQS = [
	{
		q: 'How does the sub-45-second speed guarantee actually work?',
		a: 'When an industrial buyer submits an inquiry on IndiaMart, IndiaMart sends an instant webhook to our Cloudflare edge server. Within 80ms, our dynamic schema engine extracts the technical attributes (HP, pressure, flow, kVA), matches the best catalog SKU, formats a customized interactive WhatsApp quotation, and dispatches it directly to the buyer’s phone.',
	},
	{
		q: 'How does the BuyLead dispute and refund engine save us money?',
		a: 'Under IndiaMart Buyer Quality Policy §3.2 and §1.4, inquiries from students, fake numbers, or non-commercial queries are eligible for credit reversal. Our dispute engine automatically detects non-commercial intent, generates official policy-grounded evidence drafts, and files dispute claims, saving our typical dealers ₹10,000–₹35,000 every month.',
	},
	{
		q: 'Do we need a developer to set this up?',
		a: 'No. Our 60-Second Onboarding Wizard connects your IndiaMart Push Webhook in 3 clicks. You paste your Webhook URL into IndiaMart’s seller portal, upload your product SKU list, and you are live immediately.',
	},
	{
		q: 'Is our buyer lead data safe and compliant with Indian regulations?',
		a: 'Yes. We strictly adhere to the Digital Personal Data Protection Act (DPDPA 2023) and TRAI 160 DLT regulations. We never sell, share, or cross-market your lead data. All lead information is encrypted at rest with AES-256 and stored in isolated edge database partitions.',
	},
	{
		q: 'Can we claim 18% GST Input Tax Credit on our subscription?',
		a: 'Yes. All subscriptions include official B2B tax invoices with your company GSTIN, enabling full 18% GST Input Tax Credit (ITC) deduction.',
	},
];

export default function PricingPage() {
	const router = useRouter();
	const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
	const [leadsPerMonth, setLeadsPerMonth] = useState<number>(150);
	const [avgDealValue, setAvgDealValue] = useState<number>(85000);

	// ROI Calculations
	const estimatedWonDeals = Math.round(leadsPerMonth * 0.18); // 18% conversion with sub-45s speed
	const legacyWonDeals = Math.round(leadsPerMonth * 0.06); // 6% conversion with manual delay
	const additionalDeals = estimatedWonDeals - legacyWonDeals;
	const additionalRevenue = additionalDeals * avgDealValue;
	const estimatedSpamLeads = Math.round(leadsPerMonth * 0.18);
	const disputeRefundSavings = estimatedSpamLeads * 350; // ₹350 saved per fake lead

	return (
		<div className="min-h-screen bg-background text-foreground overflow-x-hidden">
			{/* Shared Floating Pill Navbar */}
			<Navbar />

			<main className="max-w-6xl mx-auto px-4 pt-28 pb-20 flex flex-col gap-16 md:gap-24">
				{/* Hero Section */}
				<div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
					<Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs px-3 py-1">
						Transparent Enterprise B2B Pricing
					</Badge>
					<h1 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-foreground">
						Predictable plans designed to <span className="text-amber-400">maximize your lead conversion</span>
					</h1>
					<p className="text-muted-foreground text-xs sm:text-base leading-relaxed max-w-xl">
						Capture IndiaMart BuyLeads in &lt;45s, eliminate manual delays, and recover wasted ad spend on fake inquiries.
					</p>

					{/* Billing Cycle Toggle */}
					<div className="mt-4 flex items-center gap-2 bg-muted/40 p-1 rounded-full border border-border/80">
						<button
							type="button"
							onClick={() => setBillingCycle('monthly')}
							className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
								billingCycle === 'monthly'
									? 'bg-card text-foreground shadow-xs'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							Monthly Billing
						</button>
						<button
							type="button"
							onClick={() => setBillingCycle('annual')}
							className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
								billingCycle === 'annual'
									? 'bg-amber-500 text-zinc-950 shadow-xs'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							<span>Annual Billing</span>
							<Badge className="bg-black/20 text-zinc-950 text-[10px] py-0 border-0 font-bold">
								SAVE 20%
							</Badge>
						</button>
					</div>
				</div>

				{/* Pricing Cards Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
					{PLANS.map((plan) => {
						const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
						return (
							<Card
								key={plan.id}
								className={`rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 ${
									plan.popular
										? 'border-2 border-amber-500 bg-card shadow-xl shadow-amber-500/5'
										: 'border border-border/80 bg-card/60'
								}`}
							>
								<div>
									<div className="flex items-center justify-between gap-2">
										<h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
										{plan.popular ? (
											<Badge className="bg-amber-500 text-zinc-950 font-bold text-[10px] border-0">
												RECOMMENDED
											</Badge>
										) : null}
									</div>

									<p className="text-xs text-muted-foreground leading-relaxed mt-2 min-h-8">
										{plan.tagline}
									</p>

									<div className="mt-6 flex items-baseline gap-2">
										<span className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono">
											₹{price.toLocaleString('en-IN')}
										</span>
										<span className="text-xs text-muted-foreground">
											/ month {billingCycle === 'annual' ? '(billed yearly)' : ''}
										</span>
									</div>

									<div className="mt-6 pt-6 border-t border-border/40 flex flex-col gap-3">
										<span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
											What&apos;s Included:
										</span>
										<ul className="space-y-2.5">
											{plan.features.map((feat, i) => (
												<li key={i} className="flex items-start gap-2 text-xs text-foreground">
													<Check className="size-3.5 text-amber-400 shrink-0 mt-0.5" strokeWidth={2.5} />
													<span className="leading-tight">{feat}</span>
												</li>
											))}
											{plan.limitations.map((lim, i) => (
												<li key={i} className="flex items-start gap-2 text-xs text-muted-foreground opacity-50">
													<span className="size-3.5 shrink-0 text-center font-bold">—</span>
													<span className="leading-tight line-through">{lim}</span>
												</li>
											))}
										</ul>
									</div>
								</div>

								<div className="mt-8 pt-6 border-t border-border/40">
									<Button
										asChild
										className={`w-full text-xs font-semibold h-10 ${
											plan.popular
												? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-md'
												: 'border border-border/80 hover:bg-muted/40 text-foreground'
										}`}
										variant={plan.popular ? 'default' : 'outline'}
									>
										<Link href="/onboard">{plan.cta} &rarr;</Link>
									</Button>
									<p className="text-[11px] text-center text-muted-foreground mt-2">
										14-day free trial · Instant setup
									</p>
								</div>
							</Card>
						);
					})}
				</div>

				{/* Interactive B2B ROI Calculator */}
				<div className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 flex flex-col gap-6">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
						<div>
							<div className="flex items-center gap-2">
								<Calculator className="size-5 text-amber-400" />
								<h2 className="text-xl font-bold text-foreground">
									Interactive B2B ROI Calculator
								</h2>
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Estimate the revenue unlocked by cutting response time from 3 hours to &lt;45 seconds.
							</p>
						</div>
						<Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs w-fit">
							Harvard Business Review: 7x Conversion at &lt;5 Min
						</Badge>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
						{/* Sliders */}
						<div className="flex flex-col gap-6">
							<div>
								<div className="flex items-center justify-between text-xs font-semibold text-foreground">
									<span>Monthly IndiaMart BuyLeads Received</span>
									<span className="font-mono text-sm text-amber-400 font-bold">{leadsPerMonth} Leads</span>
								</div>
								<input
									type="range"
									min={20}
									max={1000}
									step={10}
									value={leadsPerMonth}
									onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
									className="w-full mt-2.5 accent-amber-500 cursor-pointer"
								/>
								<div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
									<span>20 leads</span>
									<span>500 leads</span>
									<span>1,000 leads</span>
								</div>
							</div>

							<div>
								<div className="flex items-center justify-between text-xs font-semibold text-foreground">
									<span>Average Order / Machinery Deal Value</span>
									<span className="font-mono text-sm text-amber-400 font-bold">₹{avgDealValue.toLocaleString('en-IN')}</span>
								</div>
								<input
									type="range"
									min={10000}
									max={500000}
									step={5000}
									value={avgDealValue}
									onChange={(e) => setAvgDealValue(Number(e.target.value))}
									className="w-full mt-2.5 accent-amber-500 cursor-pointer"
								/>
								<div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
									<span>₹10,000</span>
									<span>₹2,50,000</span>
									<span>₹5,00,000</span>
								</div>
							</div>
						</div>

						{/* Output Result Cards */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="rounded-xl border border-border/80 bg-background/80 p-5 flex flex-col justify-between">
								<div>
									<span className="text-xs font-medium text-muted-foreground">Estimated New Won Deals</span>
									<div className="text-2xl font-extrabold text-foreground font-mono mt-1">
										+{additionalDeals} deals <span className="text-xs font-normal text-muted-foreground">/mo</span>
									</div>
								</div>
								<p className="text-[11px] text-amber-400 font-medium mt-2">
									Conversion jumps from 6% to 18%
								</p>
							</div>

							<div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5 flex flex-col justify-between">
								<div>
									<span className="text-xs font-medium text-muted-foreground">Projected Revenue Gained</span>
									<div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
										₹{(additionalRevenue / 100000).toFixed(2)} Lakhs
									</div>
								</div>
								<p className="text-[11px] text-muted-foreground mt-2 font-mono">
									₹{additionalRevenue.toLocaleString('en-IN')} per month
								</p>
							</div>

							<div className="sm:col-span-2 rounded-xl border border-border/60 bg-muted/20 p-3.5 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<CheckCircle2 className="size-4 text-amber-400 shrink-0" />
									<span className="text-xs text-foreground">
										Auto-Recovered BuyLead Credits (~{estimatedSpamLeads} fake leads):
									</span>
								</div>
								<span className="text-xs font-bold text-foreground font-mono">
									+₹{disputeRefundSavings.toLocaleString('en-IN')} / mo
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Detailed Feature Comparison Table */}
				<div className="rounded-2xl border border-border/80 bg-card overflow-hidden">
					<div className="p-6 border-b border-border/60">
						<h2 className="text-xl font-bold text-foreground">
							Detailed Feature Comparison
						</h2>
						<p className="text-xs text-muted-foreground mt-1">
							Compare all capabilities across Starter, Growth, and Enterprise tiers.
						</p>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs border-collapse">
							<thead>
								<tr className="border-b border-border/60 bg-muted/40">
									<th className="py-3 px-5 font-semibold text-foreground w-2/5">Capability</th>
									<th className="py-3 px-4 font-semibold text-foreground w-1/5 text-center">Starter</th>
									<th className="py-3 px-4 font-semibold text-amber-400 w-1/5 text-center bg-amber-500/5">Growth (Multi-Cat)</th>
									<th className="py-3 px-4 font-semibold text-foreground w-1/5 text-center">Enterprise OEM</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/40">
								{COMPARISON_ROWS.map((section, sIdx) => (
									<React.Fragment key={sIdx}>
										<tr className="bg-muted/50">
											<td colSpan={4} className="py-2 px-5 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
												{section.category}
											</td>
										</tr>
										{section.items.map((row, rIdx) => (
											<tr key={rIdx} className="hover:bg-muted/20 transition-colors">
												<td className="py-3 px-5 font-medium text-foreground">{row.feature}</td>
												<td className="py-3 px-4 text-center text-muted-foreground">{row.starter}</td>
												<td className="py-3 px-4 text-center font-medium text-foreground bg-amber-500/5">{row.growth}</td>
												<td className="py-3 px-4 text-center text-muted-foreground">{row.enterprise}</td>
											</tr>
										))}
									</React.Fragment>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Frequently Asked Questions */}
				<div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
					<div className="text-center">
						<h2 className="text-2xl font-bold text-foreground">
							Frequently Asked Questions
						</h2>
						<p className="text-xs text-muted-foreground mt-1">
							Everything you need to know about our billing, setup, and IndiaMart integration.
						</p>
					</div>

					<div className="space-y-3 mt-2">
						{FAQS.map((faq, i) => (
							<div key={i} className="rounded-xl border border-border/80 bg-card p-5">
								<h4 className="text-xs font-bold text-foreground flex items-center gap-2">
									<HelpCircle className="size-3.5 text-amber-400 shrink-0" />
									{faq.q}
								</h4>
								<p className="text-xs text-muted-foreground leading-relaxed mt-2 pl-5">
									{faq.a}
								</p>
							</div>
						))}
					</div>
				</div>
			</main>

			{/* Shared Production Footer */}
			<Footer />
		</div>
	);
}
