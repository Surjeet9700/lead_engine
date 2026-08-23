import type { ReactNode } from 'react';

// Sample IDs only — real leads render dynamically from live data.
// Hyphens instead of ':' because static export writes <id>.html/.rsc filenames and Windows forbids ':'.
export function generateStaticParams() {
	return [
		{ id: 'lead-seller_bj01-Q-001' },
		{ id: 'lead-seller_bj01-Q-002' },
		{ id: 'sample-1' },
		{ id: 'sample-2' },
	];
}

export default function LeadLayout({ children }: { children: ReactNode }) {
	return children;
}
