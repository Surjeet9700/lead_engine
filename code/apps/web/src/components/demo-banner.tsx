'use client';

import { useEffect, useState } from 'react';

const DISMISS_KEY = 'lse_demo_banner_dismissed';
const LIVE_DATA_KEY = 'lse_live_connected';

export default function DemoBanner() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const dismissed = window.localStorage.getItem(DISMISS_KEY) === '1';
		const hasLiveData = window.localStorage.getItem(LIVE_DATA_KEY) === '1';
		const forcedDemo = new URLSearchParams(window.location.search).get('demo') === '1';
		setVisible(!dismissed && (forcedDemo || !hasLiveData));
	}, []);

	const dismiss = () => {
		window.localStorage.setItem(DISMISS_KEY, '1');
		setVisible(false);
	};

	if (!visible) return null;

	return (
		<div
			role="status"
			className="flex items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300"
		>
			<p>
				You&apos;re viewing <span className="font-semibold">demo data</span>. Connect IndiaMart Push API to see live leads.
			</p>
			<button
				type="button"
				onClick={dismiss}
				aria-label="Dismiss demo banner"
				className="shrink-0 rounded px-2 py-0.5 text-amber-400 transition-colors hover:bg-amber-500/20 hover:text-amber-100"
			>
				&times;
			</button>
		</div>
	);
}
