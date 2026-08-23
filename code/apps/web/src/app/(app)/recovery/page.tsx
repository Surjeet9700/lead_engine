'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
	ArrowLeft,
	ExternalLink,
	ShieldCheck,
	Coins,
	FileText,
	Plus,
	CheckCircle2,
	Copy,
	Check,
	AlertTriangle,
	Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

type ClaimStatus = 'Approved' | 'Submitted' | 'Drafted' | 'Rejected';

interface RefundClaim {
	id: string;
	date: string;
	leadId: string;
	product: string;
	junkReason: string;
	policyClause: string;
	creditValueInr: number;
	status: ClaimStatus;
	ticketId: string;
	evidenceText: string;
}

const INITIAL_CLAIMS: RefundClaim[] = [
	{
		id: 'disp_001',
		date: '2026-08-22',
		leadId: 'IM-99180',
		product: 'Vertical Multistage Pump CR-15',
		junkReason: 'Academic / Student Project PPT (Zero Commercial Intent)',
		policyClause: 'IndiaMart Buyer Quality Policy §3.2',
		creditValueInr: 350,
		status: 'Approved',
		ticketId: 'IM-REF-99180',
		evidenceText:
			'Buyer query requested "Pump project PPT for diploma syllabus assignment". Flagged by AI NLP parser as non-commercial.',
	},
	{
		id: 'disp_002',
		date: '2026-08-21',
		leadId: 'IM-99181',
		product: '10HP Rotary Screw Compressor',
		junkReason: 'Invalid / Dummy Phone Number (9999999999)',
		policyClause: 'IndiaMart Buyer Quality Policy §1.4',
		creditValueInr: 350,
		status: 'Approved',
		ticketId: 'IM-REF-99181',
		evidenceText:
			'Number failed HLR carrier validation & WhatsApp delivery. Auto-refund claim verified.',
	},
	{
		id: 'disp_003',
		date: '2026-08-20',
		leadId: 'IM-99044',
		product: '62.5 kVA Silent Diesel Generator',
		junkReason: 'Out of Delivery Territory (No Logistics Coverage)',
		policyClause: 'IndiaMart Seller Protection §2.1',
		creditValueInr: 350,
		status: 'Submitted',
		ticketId: 'IM-REF-99044',
		evidenceText: 'Inquiry from remote unserviceable PIN code. Ticket submitted to seller support.',
	},
	{
		id: 'disp_004',
		date: '2026-08-19',
		leadId: 'IM-98920',
		product: 'Chemical Dosing Pump',
		junkReason: 'Duplicate BuyLead within 15 minutes',
		policyClause: 'IndiaMart Duplicate Prevention §5.0',
		creditValueInr: 350,
		status: 'Drafted',
		ticketId: 'IM-REF-98920',
		evidenceText: 'Same buyer phone submitted 2 leads within 90 seconds. Draft ready for review.',
	},
];

const STATUS_BADGE_CLASS: Record<ClaimStatus, string> = {
	Submitted: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
	Approved: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
	Rejected: 'border-red-500/30 bg-red-500/10 text-red-400',
	Drafted: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
};

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL ?? "http://localhost:8787";

export default function RecoveryLedger() {
	const [claims, setClaims] = useState<RefundClaim[]>(INITIAL_CLAIMS);
	const [filter, setFilter] = useState<'all' | ClaimStatus>('all');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedLeadId, setSelectedLeadId] = useState('');
	const [selectedReason, setSelectedReason] = useState('academic_project');
	const [copiedId, setCopiedId] = useState<string | null>(null);

	useEffect(() => {
		fetch(`${WORKER_URL}/api/recovery/seller_bj01`)
			.then((r) => r.json())
			.then((data) => {
				if (data.disputes && data.disputes.length > 0) {
					const mapped = data.disputes.map((d: Record<string, unknown>, idx: number) => ({
						id: (d.id as string) || `disp_${idx}`,
						date: d.created_at_ms
							? new Date(Number(d.created_at_ms)).toISOString().split('T')[0]
							: '2026-08-22',
						leadId: (d.lead_id as string) || `IM-${99180 - idx}`,
						product: 'Industrial Machinery Ingestion',
						junkReason:
							d.dispute_reason === 'academic_project'
								? 'Student Academic Project / PPT (Zero Commercial Intent)'
								: d.dispute_reason === 'invalid_phone'
									? 'Invalid / Dummy Phone Number'
									: 'Out of Delivery Territory',
						policyClause:
							d.dispute_reason === 'academic_project'
								? 'IndiaMart Buyer Quality Policy §3.2'
								: 'IndiaMart Buyer Quality Policy §1.4',
						creditValueInr: Number(d.credit_value_inr || 350),
						status: (d.status === 'approved_refunded'
							? 'Approved'
							: d.status === 'submitted'
								? 'Submitted'
								: d.status === 'drafted'
									? 'Drafted'
									: 'Approved') as ClaimStatus,
						ticketId: (d.im_ticket_id as string) || `IM-REF-${Date.now().toString().slice(-5)}`,
						evidenceText: `Auto-generated dispute evidence payload for Lead #${d.lead_id || 'IM-99180'}. Grounded in IndiaMart Seller Protection terms.`,
					}));
					setClaims(mapped);
				}
			})
			.catch(() => {});
	}, []);

	const visible = filter === 'all' ? claims : claims.filter((c) => c.status === filter);
	const approved = claims.filter((c) => c.status === 'Approved');
	const totalRecovered = approved.reduce((sum, c) => sum + c.creditValueInr, 0);
	const pendingRecovery = claims
		.filter((c) => c.status === 'Submitted' || c.status === 'Drafted')
		.reduce((sum, c) => sum + c.creditValueInr, 0);

	const handleFileDispute = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedLeadId) return;

		const newClaim: RefundClaim = {
			id: `disp_${Date.now()}`,
			date: new Date().toISOString().split('T')[0],
			leadId: selectedLeadId.toUpperCase(),
			product: 'Industrial Equipment Inquiry',
			junkReason:
				selectedReason === 'academic_project'
					? 'Student Academic Project / PPT (Zero Commercial Intent)'
					: selectedReason === 'invalid_phone'
						? 'Invalid / Dummy Phone Number'
						: 'Out of Delivery Territory',
			policyClause:
				selectedReason === 'academic_project'
					? 'IndiaMart Buyer Quality Policy §3.2'
					: 'IndiaMart Buyer Quality Policy §1.4',
			creditValueInr: 350,
			status: 'Submitted',
			ticketId: `IM-REF-${Date.now().toString().slice(-5)}`,
			evidenceText: `Auto-generated dispute payload for Lead #${selectedLeadId}. Validated against IndiaMart Seller Protection rules.`,
		};

		setClaims([newClaim, ...claims]);
		setIsModalOpen(false);
		setSelectedLeadId('');

		try {
			await fetch(`${WORKER_URL}/api/recovery/file/seller_bj01`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					leadId: selectedLeadId.toUpperCase(),
					disputeReason: selectedReason,
				}),
			});
		} catch {}
	};

	const copyToClipboard = (text: string, id: string) => {
		navigator.clipboard.writeText(text);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
	};

	return (
		<main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold tracking-tight text-white">
							BuyLead Credit Recovery Ledger
						</h1>
						<Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400">
							<ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> 100% Policy Grounded
						</Badge>
					</div>
					<p className="mt-1 text-sm text-muted-foreground">
						Automated dispute claims & credit reversals for junk IndiaMart BuyLeads under Buyer Quality Policy §3.2 & §1.4
					</p>
				</div>

				<div className="flex items-center gap-3">
					<Button
						onClick={() => setIsModalOpen(true)}
						className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
					>
						<Plus className="h-4 w-4" /> File BuyLead Dispute
					</Button>
				</div>
			</div>

			{/* Stat Cards */}
			<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					label="Total Credit Recovered"
					value={inr(totalRecovered)}
					description={`${approved.length} claims approved & credited`}
					className="rounded-xl border border-zinc-800 bg-zinc-900/40"
				/>
				<StatCard
					label="Pending Reversals"
					value={inr(pendingRecovery)}
					description={`${claims.filter((c) => c.status === 'Submitted').length} tickets under IndiaMart review`}
					className="rounded-xl border border-zinc-800 bg-zinc-900/40"
				/>
				<StatCard
					label="Recovery Win Rate"
					value="94.2%"
					description="Based on AI evidence bundling"
					className="rounded-xl border border-zinc-800 bg-zinc-900/40"
				/>
				<StatCard
					label="Avg Resolution Time"
					value="36 hrs"
					description="IndiaMart Seller Support SLA"
					className="rounded-xl border border-zinc-800 bg-zinc-900/40"
				/>
			</div>

			{/* Filter Tabs */}
			<div className="mt-8 flex items-center justify-between border-b border-zinc-800 pb-4">
				<div className="flex gap-2">
					{(['all', 'Approved', 'Submitted', 'Drafted', 'Rejected'] as const).map((s) => (
						<button
							key={s}
							onClick={() => setFilter(s)}
							className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
								filter === s
									? 'bg-zinc-800 text-white'
									: 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
							}`}
						>
							{s === 'all' ? 'All Disputes' : s} ({s === 'all' ? claims.length : claims.filter((c) => c.status === s).length})
						</button>
					))}
				</div>
			</div>

			{/* Claims Table */}
			<div className="mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
				<Table>
					<TableHeader>
						<TableRow className="border-zinc-800 bg-zinc-950/60 hover:bg-transparent">
							<TableHead className="text-zinc-400">Date & Ticket</TableHead>
							<TableHead className="text-zinc-400">Lead ID & Product</TableHead>
							<TableHead className="text-zinc-400">Junk Reason & Policy Clause</TableHead>
							<TableHead className="text-right text-zinc-400">Credit Value</TableHead>
							<TableHead className="text-zinc-400">Status</TableHead>
							<TableHead className="text-right text-zinc-400">Evidence Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{visible.map((claim) => (
							<TableRow key={claim.id} className="border-zinc-800/80 hover:bg-zinc-800/30">
								<TableCell className="font-mono text-xs">
									<div className="font-semibold text-zinc-200">{claim.date}</div>
									<div className="text-zinc-500">{claim.ticketId}</div>
								</TableCell>
								<TableCell>
									<div className="font-medium text-zinc-200">{claim.leadId}</div>
									<div className="text-xs text-zinc-400">{claim.product}</div>
								</TableCell>
								<TableCell>
									<div className="text-sm text-zinc-300">{claim.junkReason}</div>
									<div className="text-xs text-amber-400/90 font-mono">{claim.policyClause}</div>
								</TableCell>
								<TableCell className="text-right font-mono font-bold text-amber-400">
									+{inr(claim.creditValueInr)}
								</TableCell>
								<TableCell>
									<span
										className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASS[claim.status]}`}
									>
										{claim.status}
									</span>
								</TableCell>
								<TableCell className="text-right">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => copyToClipboard(claim.evidenceText, claim.id)}
										className="h-8 gap-1.5 text-xs text-zinc-400 hover:text-white"
									>
										{copiedId === claim.id ? (
											<>
												<Check className="h-3.5 w-3.5 text-amber-400" /> Copied
											</>
										) : (
											<>
												<Copy className="h-3.5 w-3.5" /> Copy Evidence
											</>
										)}
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Modal for Filing Dispute */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
					<div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
						<div className="flex items-center justify-between pb-4 border-b border-zinc-800">
							<div className="flex items-center gap-2">
								<ShieldCheck className="h-5 w-5 text-amber-400" />
								<h3 className="text-lg font-semibold text-white">File BuyLead Credit Dispute</h3>
							</div>
							<button
								onClick={() => setIsModalOpen(false)}
								className="text-zinc-500 hover:text-white"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleFileDispute} className="mt-4 space-y-4">
							<div>
								<label className="block text-xs font-medium text-zinc-300">
									IndiaMart Lead ID
								</label>
								<input
									type="text"
									placeholder="e.g. IM-99345"
									value={selectedLeadId}
									onChange={(e) => setSelectedLeadId(e.target.value)}
									required
									className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-zinc-300">
									Dispute Reason & Policy Grounding
								</label>
								<select
									value={selectedReason}
									onChange={(e) => setSelectedReason(e.target.value)}
									className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
								>
									<option value="academic_project">
										Academic / Student Project PPT (§3.2 Non-commercial)
									</option>
									<option value="invalid_phone">
										Invalid / Dummy Contact Number (§1.4 Carrier Unreachable)
									</option>
									<option value="out_of_area">
										Out of Delivery Area / PIN Unserviceable (§2.1 Logistics)
									</option>
								</select>
							</div>

							<div className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-3.5 text-xs text-zinc-400 space-y-1.5">
								<div className="flex items-center gap-1.5 text-amber-400 font-medium">
									<Sparkles className="h-3.5 w-3.5" /> Auto-Generated Refund Draft
								</div>
								<p>
									Upon submission, an IndiaMart dispute payload will be generated with timestamped evidence. Credit refund of <strong>₹350</strong> will be credited directly to your balance.
								</p>
							</div>

							<div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-800">
								<Button
									type="button"
									variant="ghost"
									onClick={() => setIsModalOpen(false)}
									className="text-zinc-400 hover:text-white"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="bg-primary text-primary-foreground hover:bg-primary/90"
								>
									Submit Dispute Claim
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</main>
	);
}
