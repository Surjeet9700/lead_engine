'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { LeadRow } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

const routeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
	wa_now: 'default',
	wa_defer_digest: 'secondary',
	human: 'outline',
	silent_spam: 'destructive',
};

const outcomeClass: Record<string, string> = {
	sent: 'text-green-400',
	delivered: 'text-green-300',
	read: 'text-white',
	replied: 'font-bold text-white',
	deferred: 'text-yellow-400',
	spam_skipped: 'text-muted-foreground',
	failed_permanent: 'text-destructive',
	dead_lettered: 'text-red-500',
	retrying: 'text-orange-400',
	received: 'text-muted-foreground',
};

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL ?? 'http://localhost:8787';

export default function LeadsTable() {
	const [leads, setLeads] = useState<LeadRow[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch(`${WORKER_URL}/api/leads/seller_bj01`)
			.then((r) => r.json())
			.then((d) => setLeads(d.leads ?? []))
			.catch(() => setLeads([]))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<div className="space-y-2">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className="h-12 w-full" />
				))}
			</div>
		);
	}

	if (leads.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				No leads yet. Connect IndiaMart Push API to start.
			</p>
		);
	}

	return (
		<div className="rounded-lg border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Product</TableHead>
						<TableHead>City</TableHead>
						<TableHead className="text-right">Priority</TableHead>
						<TableHead>Route</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="text-right">Time</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{leads.map((lead) => (
						<TableRow key={lead.dedupKey}>
							<TableCell className="font-medium">
								<Link
									href={`/leads/${lead.dedupKey}`}
									className="transition-colors hover:text-white hover:underline"
								>
									{lead.product || <span className="text-muted-foreground">—</span>}
								</Link>
							</TableCell>
							<TableCell className="text-muted-foreground">{lead.city || '—'}</TableCell>
							<TableCell className="text-right tabular-nums">
								<span className={lead.priority >= 70 ? 'font-semibold text-green-400' : lead.priority >= 45 ? 'text-yellow-400' : 'text-muted-foreground'}>
									{lead.priority}
								</span>
							</TableCell>
							<td>
								<Badge variant={routeVariant[lead.route] ?? 'outline'}>{lead.route.replace(/_/g, ' ')}</Badge>
							</td>
							<td className={outcomeClass[lead.outcome] ?? ''}>{lead.outcome.replace(/_/g, ' ')}</td>
							<TableCell className="text-right text-xs tabular-nums text-muted-foreground">
								{new Date(lead.createdAtMs).toLocaleTimeString('en-IN')}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
