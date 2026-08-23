'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
	Building2,
	Moon,
	Package,
	Plus,
	RotateCcw,
	Save,
	ShieldCheck,
	SlidersHorizontal,
	Sparkles,
	Timer,
	Trash2,
	VolumeX,
} from 'lucide-react';

type Unit = 'HP' | 'kW' | 'units';

interface CatalogProduct {
	id: string;
	name: string;
	priceMin: number;
	priceMax: number;
	unit: Unit;
	inStock: boolean;
}

interface SellerSettings {
	companyName: string;
	ownerName: string;
	gstin: string;
	whatsapp: string;
	products: CatalogProduct[];
	quietHoursEnabled: boolean;
	quietStart: string;
	quietEnd: string;
	hotThreshold: number;
	spamFilter: boolean;
	autoRefundSpam: boolean;
}

const DEFAULT_SETTINGS: SellerSettings = {
	companyName: '',
	ownerName: '',
	gstin: '',
	whatsapp: '',
	products: [],
	quietHoursEnabled: true,
	quietStart: '22:00',
	quietEnd: '07:00',
	hotThreshold: 70,
	spamFilter: true,
	autoRefundSpam: true,
};

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const UNITS: Unit[] = ['HP', 'kW', 'units'];

function newProductId() {
	return typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: `p-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

const inputCls =
	'h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder:text-muted-foreground focus:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-700';

function Field({
	label,
	children,
	error,
}: {
	label: string;
	children: React.ReactNode;
	error?: string | null;
}) {
	return (
		<label className="block">
			<span className="mb-1.5 block text-sm font-medium">{label}</span>
			{children}
			{error ? <span className="mt-1 block text-xs text-red-400">{error}</span> : null}
		</label>
	);
}

function Toggle({
	checked,
	onChange,
	label,
}: {
	checked: boolean;
	onChange: (v: boolean) => void;
	label: string;
}) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={() => onChange(!checked)}
			className="flex items-center gap-3 text-sm"
		>
			<span
				className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
					checked ? 'border-primary bg-primary' : 'border-zinc-700 bg-zinc-800'
				}`}
			>
				<span
					className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
						checked ? 'translate-x-6' : 'translate-x-1'
					}`}
				/>
			</span>
			<span className="text-zinc-300">{label}</span>
		</button>
	);
}

function Section({
	icon,
	title,
	description,
	children,
}: {
	icon: React.ReactNode;
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<section className="rounded-lg border border-zinc-800 bg-zinc-900/40">
			<div className="flex items-start gap-3 border-b border-zinc-800 px-6 py-4">
				<div className="mt-0.5 text-muted-foreground">{icon}</div>
				<div>
					<h2 className="text-sm font-semibold">{title}</h2>
					{description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
				</div>
			</div>
			<div className="space-y-4 px-6 py-5">{children}</div>
		</section>
	);
}

export default function SettingsPage() {
	const [saved, setSaved] = useState<SellerSettings>(DEFAULT_SETTINGS);
	const [draft, setDraft] = useState<SellerSettings>(DEFAULT_SETTINGS);

	const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
	const gstinInvalid = draft.gstin.length > 0 && !GSTIN_PATTERN.test(draft.gstin.toUpperCase());

	function update(patch: Partial<SellerSettings>) {
		setDraft((d) => ({ ...d, ...patch }));
	}

	function updateProduct(id: string, patch: Partial<CatalogProduct>) {
		update({ products: draft.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
	}

	function addProduct() {
		const product: CatalogProduct = {
			id: newProductId(),
			name: '',
			priceMin: 0,
			priceMax: 0,
			unit: 'HP',
			inStock: true,
		};
		update({ products: [...draft.products, product] });
	}

	function removeProduct(id: string) {
		update({ products: draft.products.filter((p) => p.id !== id) });
	}

	function handleSave() {
		if (!dirty || gstinInvalid) return;
		setSaved({
			...draft,
			gstin: draft.gstin.toUpperCase(),
			products: draft.products.map((p) => ({ ...p, name: p.name.trim() })),
		});
		setDraft((d) => ({
			...d,
			gstin: d.gstin.toUpperCase(),
			products: d.products.map((p) => ({ ...p, name: p.name.trim() })),
		}));
	}

	function handleReset() {
		setDraft(saved);
	}

	return (
		<main className="mx-auto max-w-3xl px-6 py-12 pb-28">
			<header className="mb-10">
				<Link href="/" className="text-xs text-muted-foreground hover:text-zinc-200">
					← Back to dashboard
				</Link>
				<h1 className="mt-3 text-2xl font-semibold tracking-tight">Seller Settings</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Business profile, catalog and lead-routing rules
				</p>
			</header>

			<div className="space-y-6">
				<Section icon={<Building2 size={16} />} title="Business Info" description="Shown in WhatsApp templates sent to buyers">
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Company name">
							<input
								className={inputCls}
								value={draft.companyName}
								onChange={(e) => update({ companyName: e.target.value })}
								placeholder="Bharat Pumps Pvt Ltd"
							/>
						</Field>
						<Field label="Owner name">
							<input
								className={inputCls}
								value={draft.ownerName}
								onChange={(e) => update({ ownerName: e.target.value })}
								placeholder="Rajesh Kumar"
							/>
						</Field>
						<Field
							label="GSTIN"
							error={gstinInvalid ? 'Enter a valid 15-character GSTIN' : null}
						>
							<input
								className={`${inputCls} uppercase ${gstinInvalid ? 'border-red-500 focus:ring-red-500/40' : ''}`}
								value={draft.gstin}
								maxLength={15}
								onChange={(e) => update({ gstin: e.target.value.toUpperCase().trim() })}
								placeholder="29ABCDE1234F1Z5"
							/>
						</Field>
						<Field label="WhatsApp Business number">
							<input
								className={inputCls}
								type="tel"
								value={draft.whatsapp}
								onChange={(e) => update({ whatsapp: e.target.value })}
								placeholder="+91 98765 43210"
							/>
						</Field>
					</div>
				</Section>

				<Section
					icon={<Package size={16} />}
					title="Product Catalog"
					description="What you sell, so AI can score incoming leads better"
				>
					<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Sparkles size={12} /> This helps AI score leads better
					</p>

					{draft.products.length === 0 ? (
						<p className="py-4 text-center text-sm text-muted-foreground">
							No products yet. Add what you sell.
						</p>
					) : (
						<div className="space-y-3">
							{draft.products.map((product) => (
								<div
									key={product.id}
									className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 p-3 sm:grid-cols-[1fr_180px_90px_auto]"
								>
									<input
										className={`${inputCls} h-8`}
										value={product.name}
										onChange={(e) => updateProduct(product.id, { name: e.target.value })}
										placeholder="Monoblock Water Pump"
										aria-label="Product name"
									/>
									<div className="flex items-center gap-1">
										<input
											className={`${inputCls} h-8 w-[72px] text-right tabular-nums`}
											type="number"
											min={0}
											value={product.priceMin || ''}
											onChange={(e) =>
												updateProduct(product.id, { priceMin: Number(e.target.value) })
											}
											placeholder="Min"
											aria-label="Minimum price"
										/>
										<span className="text-xs text-muted-foreground">–</span>
										<input
											className={`${inputCls} h-8 w-[72px] text-right tabular-nums`}
											type="number"
											min={0}
											value={product.priceMax || ''}
											onChange={(e) =>
												updateProduct(product.id, { priceMax: Number(e.target.value) })
											}
											placeholder="Max"
											aria-label="Maximum price"
										/>
									</div>
									<select
										className={`${inputCls} h-8 w-auto`}
										value={product.unit}
										onChange={(e) => updateProduct(product.id, { unit: e.target.value as Unit })}
										aria-label="Unit"
									>
										{UNITS.map((u) => (
											<option key={u} value={u}>
												{u}
											</option>
										))}
									</select>
									<div className="flex items-center justify-end gap-2">
										<Toggle
											checked={product.inStock}
											onChange={(v) => updateProduct(product.id, { inStock: v })}
											label=""
										/>
										<button
											type="button"
											onClick={() => removeProduct(product.id)}
											className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-zinc-800 hover:text-red-400"
											aria-label={`Delete ${product.name || 'product'}`}
										>
											<Trash2 size={14} />
										</button>
									</div>
								</div>
							))}
						</div>
					)}

					<button
						type="button"
						onClick={addProduct}
						className="inline-flex h-9 items-center gap-1.5 rounded-md border border-dashed border-zinc-700 px-3 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-900"
					>
						<Plus size={14} /> Add product
					</button>
				</Section>

				<Section icon={<Moon size={16} />} title="Quiet Hours" description="Don't ping buyers while they sleep">
					<Toggle
						checked={draft.quietHoursEnabled}
						onChange={(v) => update({ quietHoursEnabled: v })}
						label="Enable quiet hours"
					/>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Start time">
							<input
								className={inputCls}
								type="time"
								value={draft.quietStart}
								disabled={!draft.quietHoursEnabled}
								onChange={(e) => update({ quietStart: e.target.value })}
							/>
						</Field>
						<Field label="End time">
							<input
								className={inputCls}
								type="time"
								value={draft.quietEnd}
								disabled={!draft.quietHoursEnabled}
								onChange={(e) => update({ quietEnd: e.target.value })}
							/>
						</Field>
					</div>
					<p className={`flex items-center gap-1.5 text-xs text-muted-foreground ${!draft.quietHoursEnabled ? 'opacity-50' : ''}`}>
						<Timer size={12} /> WhatsApp messages during quiet hours are held and sent at 08:05 IST
					</p>
				</Section>

				<Section icon={<SlidersHorizontal size={16} />} title="Scoring Thresholds" description="How aggressively leads are routed to WhatsApp">
					<div>
						<div className="mb-2 flex items-center justify-between">
							<span className="text-sm font-medium">Hot threshold</span>
							<span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-xs tabular-nums text-zinc-100">
								{draft.hotThreshold}+
							</span>
						</div>
						<input
							type="range"
							min={50}
							max={90}
							step={1}
							value={draft.hotThreshold}
							onChange={(e) => update({ hotThreshold: Number(e.target.value) })}
							className="w-full accent-green-500"
							aria-label="Hot threshold"
						/>
						<p className="mt-1 text-xs text-muted-foreground">
							Leads scoring {draft.hotThreshold} or above get an instant WhatsApp reply
						</p>
					</div>
					<div className="space-y-3 pt-1">
						<div className="flex items-center justify-between gap-4">
							<div className="flex items-start gap-2">
								<VolumeX size={14} className="mt-1 text-muted-foreground" />
								<div>
									<p className="text-sm font-medium">Spam filter</p>
									<p className="text-xs text-muted-foreground">Drop junk leads before they reach you</p>
								</div>
							</div>
							<Toggle checked={draft.spamFilter} onChange={(v) => update({ spamFilter: v })} label="" />
						</div>
						<div className="flex items-center justify-between gap-4">
							<div className="flex items-start gap-2">
								<ShieldCheck size={14} className="mt-1 text-muted-foreground" />
								<div>
									<p className="text-sm font-medium">Auto-refund draft for spam</p>
									<p className="text-xs text-muted-foreground">File refund drafts for junk lead credits</p>
								</div>
							</div>
							<Toggle
								checked={draft.autoRefundSpam}
								onChange={(v) => update({ autoRefundSpam: v })}
								label=""
							/>
						</div>
					</div>
				</Section>

				<Section icon={<Sparkles size={16} />} title="Dynamic Industry Schema" description="Select the attribute extraction schema for your catalog">
					<div>
						<label className="mb-1.5 block text-sm font-medium">Active Category Schema</label>
						<select className={inputCls} defaultValue="industrial_pumps">
							<option value="industrial_pumps">Industrial Pumps & Pumping Systems (HP, Head m, Flow LPM, Phase)</option>
							<option value="air_compressors">Industrial Air Compressors (HP, Pressure Bar, CFM Delivery, Screw/Piston)</option>
							<option value="diesel_generators">Diesel & Gas Generators (kVA, CPCB Silent, Water/Air Cooled)</option>
							<option value="solar_inverters">Solar Inverters & Batteries (kVA, Battery Ah, MPPT)</option>
							<option value="generic_b2b">General B2B Industrial Goods (Dynamic NLP)</option>
						</select>
						<p className="mt-1 text-xs text-muted-foreground">
							The AI engine dynamically converts units (kW → HP, PSI → Bar, Feet → Meters) and extracts technical parameters without hardcoded constraints.
						</p>
					</div>
				</Section>

				<Section icon={<Building2 size={16} />} title="Telephony & Sarvam Voice AI" description="Exotel 160 DLT Service Route & Sarvam Bulbul Multilingual TTS">
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Exotel Account SID">
							<input className={inputCls} placeholder="e.g. bharatpumps_exo" defaultValue="bharatpumps_exo" />
						</Field>
						<Field label="ExoPhone (160 DLT Series)">
							<input className={inputCls} placeholder="e.g. 08047190000" defaultValue="08047190000" />
						</Field>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Sarvam AI Subscription Key">
							<input className={inputCls} type="password" placeholder="sk-sarvam-..." defaultValue="••••••••••••••••" />
						</Field>
						<Field label="Default Voice Dialect">
							<select className={inputCls} defaultValue="te-IN">
								<option value="te-IN">Telugu (te-IN · Anushka Voice)</option>
								<option value="hi-IN">Hindi / Hinglish (hi-IN · Abhilash Voice)</option>
								<option value="en-IN">Indian English (en-IN · Aditya Voice)</option>
							</select>
						</Field>
					</div>
				</Section>

				<Section icon={<ShieldCheck size={16} />} title="IndiaMart Push Webhook Gateway" description="Configure IndiaMart Gold/Push tier to deliver leads into your speed engine in <50ms">
					<Field label="Webhook Ingestion URL">
						<div className="flex gap-2">
							<input
								readOnly
								className={`${inputCls} font-mono text-xs text-amber-400`}
								value="https://leadspeed-worker.yourdomain.workers.dev/webhook/seller_bj01?token=im_push_tok_99182"
							/>
						</div>
					</Field>
					<p className="text-xs text-muted-foreground">
						Paste this URL into your IndiaMart Seller Central Webhook Settings. Incoming BuyLeads will be acknowledged and queued in &lt;50ms.
					</p>
				</Section>
			</div>

			<div className="sticky bottom-0 -mx-6 mt-10 flex items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-950/95 px-6 py-4 backdrop-blur">
				<span className="text-xs text-muted-foreground">
					{dirty ? (
						<span className="flex items-center gap-1.5">
							<span className="h-1.5 w-1.5 rounded-full bg-yellow-400" /> Unsaved changes
						</span>
					) : (
						'All changes saved'
					)}
				</span>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={handleReset}
						disabled={!dirty}
						className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-800 px-3 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 disabled:pointer-events-none disabled:opacity-40"
					>
						<RotateCcw size={14} /> Reset
					</button>
					<button
						type="button"
						onClick={handleSave}
						disabled={!dirty || gstinInvalid}
						className="inline-flex h-9 items-center gap-1.5 rounded-md bg-zinc-100 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-40"
					>
						<Save size={14} /> Save
					</button>
				</div>
			</div>
		</main>
	);
}
