'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
	ArrowRight,
	Building2,
	CheckCircle2,
	Copy,
	FileText,
	Phone,
	Play,
	ShieldCheck,
	Sparkles,
	Timer,
	Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const STEP_LABELS = ['Business Profile', 'Industry Schema', 'Webhook Setup', 'Live Test & Launch'];

const WORKER_BASE_URL =
	process.env.NEXT_PUBLIC_WORKER_URL || 'https://lead-speed-engine.surjeethkumar4.workers.dev';

export default function OnboardPage() {
	const [currentStep, setCurrentStep] = useState(0);

	// Form State
	const [companyName, setCompanyName] = useState('Bharat Pumps & Equipment');
	const [sellerId, setSellerId] = useState('seller_bj01');
	const [gstin, setGstin] = useState('36AABCB1234F1Z5');
	const [phone, setPhone] = useState('+91 98480 22338');
	const [category, setCategory] = useState('industrial_pumps');
	const [copied, setCopied] = useState(false);

	// Simulation State
	const [simulating, setSimulating] = useState(false);
	const [simComplete, setSimComplete] = useState(false);
	const [simLatency, setSimLatency] = useState(1.8);

	const webhookUrl = `${WORKER_BASE_URL}/webhook/${sellerId.trim() || 'seller_bj01'}?token=im_push_tok_99182`;

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {}
	}

	function runLiveTest() {
		setSimulating(true);
		setSimComplete(false);
		setTimeout(() => {
			setSimulating(false);
			setSimComplete(true);
			setSimLatency(1.9);
		}, 1800);
	}

	return (
		<main className="mx-auto max-w-2xl px-6 py-10">
			{/* Header */}
			<div className="mb-8 flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[11px]">
						60-Second Instant Setup
					</Badge>
					<span className="text-xs text-muted-foreground">· IndiaMart Lead Speed Engine</span>
				</div>
				<h1 className="text-2xl font-bold tracking-tight text-foreground">
					Seller Onboarding Wizard
				</h1>
				<p className="text-sm text-muted-foreground">
					Connect your IndiaMart account to deliver instant sub-45s WhatsApp quotations & auto-refund junk leads.
				</p>
			</div>

			{/* Step Progress Tracker */}
			<div className="mb-8 grid grid-cols-4 gap-2">
				{STEP_LABELS.map((label, idx) => {
					const isDone = idx < currentStep;
					const isCurrent = idx === currentStep;
					return (
						<div
							key={label}
							className={`flex flex-col gap-1.5 rounded-lg border p-3 transition-colors ${
								isCurrent
									? 'border-amber-500/60 bg-amber-500/5'
									: isDone
										? 'border-amber-500/30 bg-muted/40'
										: 'border-border/60 bg-muted/10 opacity-60'
							}`}
						>
							<div className="flex items-center justify-between">
								<span className="font-mono text-[10px] text-muted-foreground">Step 0{idx + 1}</span>
								{isDone ? (
									<CheckCircle2 className="size-3.5 text-amber-400" />
								) : isCurrent ? (
									<span className="size-2 rounded-full bg-amber-400 animate-pulse" />
								) : null}
							</div>
							<span className="text-xs font-semibold text-foreground truncate">{label}</span>
						</div>
					);
				})}
			</div>

			{/* Wizard Container */}
			<div className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-sm">
				{/* Step 1: Business Profile */}
				{currentStep === 0 && (
					<div className="flex flex-col gap-5">
						<div className="flex items-center gap-2.5 text-foreground font-medium">
							<Building2 className="size-5 text-amber-400" />
							<span>Step 1: Business Profile & Mobile</span>
						</div>
						<p className="text-xs text-muted-foreground">
							Enter your registered business identity for generating official quotations and WhatsApp notifications.
						</p>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="flex flex-col gap-1.5">
								<label className="text-xs font-medium text-foreground">Company Name</label>
								<input
									value={companyName}
									onChange={(e) => setCompanyName(e.target.value)}
									placeholder="e.g. Bharat Pumps & Equipment"
									className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-amber-500 focus:outline-none"
								/>
							</div>

							<div className="flex flex-col gap-1.5">
								<label className="text-xs font-medium text-foreground">Seller Identifier (slug)</label>
								<input
									value={sellerId}
									onChange={(e) => setSellerId(e.target.value)}
									placeholder="e.g. seller_bj01"
									className="h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:border-amber-500 focus:outline-none"
								/>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="flex flex-col gap-1.5">
								<label className="text-xs font-medium text-foreground">GSTIN (For Quotation Header)</label>
								<input
									value={gstin}
									onChange={(e) => setGstin(e.target.value.toUpperCase())}
									placeholder="36AABCB1234F1Z5"
									className="h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:border-amber-500 focus:outline-none"
								/>
							</div>

							<div className="flex flex-col gap-1.5">
								<label className="text-xs font-medium text-foreground">Owner WhatsApp Phone</label>
								<input
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									placeholder="+91 98480 22338"
									className="h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:border-amber-500 focus:outline-none"
								/>
							</div>
						</div>

						<div className="pt-3 flex justify-end">
							<Button onClick={() => setCurrentStep(1)} className="gap-2">
								<span>Next: Select Category Schema</span>
								<ArrowRight className="size-4" />
							</Button>
						</div>
					</div>
				)}

				{/* Step 2: Industry Schema */}
				{currentStep === 1 && (
					<div className="flex flex-col gap-5">
						<div className="flex items-center gap-2.5 text-foreground font-medium">
							<Sparkles className="size-5 text-amber-400" />
							<span>Step 2: Dynamic Category & Spec Sizing</span>
						</div>
						<p className="text-xs text-muted-foreground">
							Select the product domain your company sells on IndiaMart for dynamic spec extraction and unit conversions.
						</p>

						<div className="grid gap-3 sm:grid-cols-2">
							{[
								{
									id: 'industrial_pumps',
									title: 'Industrial Pumps & Systems',
									desc: 'HP, Head (m/ft), Flow (LPM), Phase 415V',
									badge: 'Pumps & Motors',
								},
								{
									id: 'air_compressors',
									title: 'Industrial Air Compressors',
									desc: 'HP, Pressure (Bar/PSI), CFM Delivery',
									badge: 'Screw & Piston',
								},
								{
									id: 'diesel_generators',
									title: 'Diesel & Gas DG Sets',
									desc: 'kVA Rating, CPCB Silent Canopy',
									badge: 'Power Gen',
								},
								{
									id: 'solar_inverters',
									title: 'Solar Inverters & Systems',
									desc: 'kW/kVA Capacity, MPPT, Battery Ah',
									badge: 'Solar Power',
								},
							].map((item) => (
								<button
									type="button"
									key={item.id}
									onClick={() => setCategory(item.id)}
									className={`flex flex-col items-start gap-1.5 p-4 rounded-lg border text-left transition-all ${
										category === item.id
											? 'border-amber-500 bg-amber-500/10 shadow-sm'
											: 'border-border bg-card hover:bg-muted/40'
									}`}
								>
									<div className="flex items-center justify-between w-full">
										<span className="font-semibold text-sm text-foreground">{item.title}</span>
										<Badge variant="outline" className="text-[10px]">{item.badge}</Badge>
									</div>
									<p className="text-xs text-muted-foreground">{item.desc}</p>
								</button>
							))}
						</div>

						<div className="pt-3 flex justify-between items-center">
							<Button variant="ghost" onClick={() => setCurrentStep(0)}>
								Back
							</Button>
							<Button onClick={() => setCurrentStep(2)} className="gap-2">
								<span>Next: Setup Webhook</span>
								<ArrowRight className="size-4" />
							</Button>
						</div>
					</div>
				)}

				{/* Step 3: Webhook Setup */}
				{currentStep === 2 && (
					<div className="flex flex-col gap-5">
						<div className="flex items-center gap-2.5 text-foreground font-medium">
							<ShieldCheck className="size-5 text-amber-400" />
							<span>Step 3: IndiaMart Push Webhook Configuration</span>
						</div>
						<p className="text-xs text-muted-foreground">
							Paste this webhook listener URL into your IndiaMart Seller Central account to receive leads in &lt;50ms.
						</p>

						<div className="rounded-lg border border-border bg-muted/40 p-4 flex flex-col gap-3">
							<label className="text-xs font-semibold text-foreground">Your Production Ingestion URL</label>
							<div className="flex gap-2">
								<input
									readOnly
									value={webhookUrl}
									className="h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-xs text-amber-400 focus:outline-none"
								/>
								<Button
									variant="outline"
									onClick={() => copyToClipboard(webhookUrl)}
									className="shrink-0 gap-1.5"
								>
									<Copy className="size-3.5" />
									<span>{copied ? 'Copied!' : 'Copy'}</span>
								</Button>
							</div>
						</div>

						<div className="rounded-lg border border-border/80 p-4 text-xs text-muted-foreground flex flex-col gap-2">
							<span className="font-semibold text-foreground">Where to paste in IndiaMart:</span>
							<ol className="list-decimal list-inside space-y-1">
								<li>Log into <code className="text-foreground">seller.indiamart.com</code></li>
								<li>Navigate to <b>Lead Manager</b> &gt; <b>Import/Export Leads</b> &gt; <b>Push API</b></li>
								<li>Select <b>CRM: Other</b> and paste the URL above into <b>Webhook Listener URL</b></li>
								<li>Save changes. Your speed engine is now connected 24/7!</li>
							</ol>
						</div>

						<div className="pt-3 flex justify-between items-center">
							<Button variant="ghost" onClick={() => setCurrentStep(1)}>
								Back
							</Button>
							<Button onClick={() => setCurrentStep(3)} className="gap-2">
								<span>Next: Test & Launch</span>
								<ArrowRight className="size-4" />
							</Button>
						</div>
					</div>
				)}

				{/* Step 4: Live Test & Launch */}
				{currentStep === 3 && (
					<div className="flex flex-col gap-5">
						<div className="flex items-center gap-2.5 text-foreground font-medium">
							<Zap className="size-5 text-amber-400" />
							<span>Step 4: Live Test Lead & Pipeline Verification</span>
						</div>

						<div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5 flex flex-col gap-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Timer className="size-4 text-amber-400" />
									<span className="text-sm font-semibold text-foreground">Sub-45s SLA Simulation</span>
								</div>
								{simComplete && (
									<Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
										✓ Latency: {simLatency}s
									</Badge>
								)}
							</div>

							<p className="text-xs text-muted-foreground">
								Click the button below to simulate an incoming high-priority BuyLead (15HP Multistage Pump) through the dynamic spec engine and quotation generator.
							</p>

							<Button
								onClick={runLiveTest}
								disabled={simulating}
								className="gap-2 w-full sm:w-auto"
							>
								<Play className="size-4 fill-current" />
								<span>{simulating ? 'Processing Sub-45s Pipeline...' : 'Trigger Test BuyLead'}</span>
							</Button>

							{simComplete && (
								<div className="mt-2 rounded-md border border-amber-500/40 bg-background p-4 flex flex-col gap-3">
									<div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
										<CheckCircle2 className="size-4" />
										<span>Lead Ingested &amp; Quotation Generated in {simLatency} seconds!</span>
									</div>
									<div className="grid gap-2 text-xs text-muted-foreground font-mono">
										<div>• Extracted Specs: 15 HP · 120m Head · Three Phase · Intent 96/100</div>
										<div>• Quotation: CR-15-120M-3P (₹85,000 + 18% GST = ₹1,00,300)</div>
										<div>• Telephony Voice Alert: Telugu/Hindi prompt dispatched to Exotel 160</div>
									</div>
									<div className="pt-2">
										<Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
											<a
												href={`${WORKER_BASE_URL}/api/quotation/pdf/${sellerId}/IM-TEST-9901`}
												target="_blank"
												rel="noopener noreferrer"
											>
												<FileText className="size-3.5 text-amber-400" />
												<span>Preview Generated PDF Quote</span>
											</a>
										</Button>
									</div>
								</div>
							)}
						</div>

						<div className="pt-4 flex justify-between items-center">
							<Button variant="ghost" onClick={() => setCurrentStep(2)}>
								Back
							</Button>
							<Button asChild className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
								<Link href="/dashboard">
									<span>Go to Live CRM Dashboard</span>
									<ArrowRight className="size-4" />
								</Link>
							</Button>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
