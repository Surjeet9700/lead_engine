'use client';

import React, { useState } from 'react';
import {
	Phone,
	PhoneCall,
	PhoneIncoming,
	PhoneOff,
	Play,
	Pause,
	Sparkles,
	ShieldCheck,
	Mic,
	Volume2,
	Zap,
	Languages,
	CheckCircle2,
	Clock,
	Sliders,
	Radio,
	MessageSquare,
	RefreshCw,
	ArrowRight,
	Bot,
	FileText,
	Headphones,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { SimpleTable, SimpleTableRow } from '@/components/ui/simple-table';
import Link from 'next/link';

interface SimulatedTurn {
	speaker: 'AI Agent (Sarvam Bulbul)' | 'Verified Industrial Buyer' | 'Dealer Sales Engineer';
	text: string;
	timestamp: string;
	lang: string;
}

const SAMPLE_CALL_TRANSCRIPT: SimulatedTurn[] = [
	{
		speaker: 'AI Agent (Sarvam Bulbul)',
		text: 'Namaskaram Suresh garu, Bharat Industrial Equipment nundi AI assistant matladuthunnanu. IndiaMart lo 15HP Multistage Pump kosam hot lead vachindi. Buyer tho direct ga matladataniki 1 press cheyandi.',
		timestamp: '00:03',
		lang: 'te-IN',
	},
	{
		speaker: 'Dealer Sales Engineer',
		text: '[DTMF Key 1 Pressed — Bridging Call to Buyer]',
		timestamp: '00:08',
		lang: 'DTMF',
	},
	{
		speaker: 'Verified Industrial Buyer',
		text: 'Hello? Haan mujhe RO water treatment plant ke liye 15HP vertical multistage pump chahiye, 120 meters head ke sath. Stock ready hai kya?',
		timestamp: '00:14',
		lang: 'hi-IN',
	},
	{
		speaker: 'Dealer Sales Engineer',
		text: 'Haan sir! Model hamare central warehouse me ready stock hai. 120m head 250 LPM specification match hota hai. WhatsApp par quotation bhej raha hoon.',
		timestamp: '00:26',
		lang: 'hi-IN',
	},
];

const RECENT_CALL_LOGS = [
	{
		id: 'CALL-9941',
		buyer: 'Tata Projects Industrial Division',
		phone: '+91 98480 22338',
		location: 'Hyderabad, Telangana',
		spec: 'Vertical Multistage Pump 15HP',
		duration: '00:38s',
		lang: 'Telugu (te-IN)',
		dtmfPressed: true,
		cost: '₹1.42',
		status: 'Bridged & Converted',
		time: '12 mins ago',
	},
	{
		id: 'CALL-9940',
		buyer: 'Thermax Heavy Engineering',
		phone: '+91 98765 43210',
		location: 'Pune, Maharashtra',
		spec: 'Screw Compressor 20HP (8 Bar)',
		duration: '00:44s',
		lang: 'Hindi (hi-IN)',
		dtmfPressed: true,
		cost: '₹1.58',
		status: 'Bridged & Converted',
		time: '45 mins ago',
	},
	{
		id: 'CALL-9939',
		buyer: 'L&T Construction Equip',
		phone: '+91 98123 45678',
		location: 'Bengaluru, Karnataka',
		spec: 'Diesel Generator 125 kVA Silent',
		duration: '00:22s',
		lang: 'Indian English (en-IN)',
		dtmfPressed: false,
		cost: '₹0.95',
		status: 'Voicemail / WA Sent',
		time: '2 hours ago',
	},
];

export default function VoiceAiStudio() {
	const [activeTab, setActiveTab] = useState<'simulator' | 'scripts' | 'logs'>('simulator');
	const [activeMode, setActiveMode] = useState<'telephony_bridge' | 'conversational_agent'>('telephony_bridge');
	const [selectedLanguage, setSelectedLanguage] = useState<'te-IN' | 'hi-IN' | 'en-IN'>('te-IN');
	const [isCalling, setIsCalling] = useState(false);
	const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'connected' | 'completed'>('idle');
	const [currentStep, setCurrentStep] = useState(0);
	const [audioPlaying, setAudioPlaying] = useState(false);

	const handleSimulateCall = () => {
		setIsCalling(true);
		setCallStatus('ringing');
		setCurrentStep(0);
		setAudioPlaying(true);

		setTimeout(() => {
			setCallStatus('connected');
			setCurrentStep(1);
		}, 1500);

		setTimeout(() => {
			setCurrentStep(2);
		}, 3500);

		setTimeout(() => {
			setCurrentStep(3);
			setCallStatus('completed');
			setIsCalling(false);
			setAudioPlaying(false);
		}, 6500);
	};

	return (
		<div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<div className="flex items-center gap-2.5">
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							Voice AI &amp; Telephony Operations
						</h1>
						<Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs">
							<ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> TRAI 160 DLT Active
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground mt-0.5">
						Sub-second multilingual voice dispatch (Sarvam Bulbul TTS + Saaras STT) with 1-click DTMF buyer bridge.
					</p>
				</div>

				<div className="flex items-center gap-2.5 flex-wrap">
					<Button
						onClick={handleSimulateCall}
						disabled={isCalling}
						className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
					>
						{isCalling ? (
							<>
								<RefreshCw className="h-3.5 w-3.5 animate-spin" />
								<span>Exotel 160 Calling...</span>
							</>
						) : (
							<>
								<PhoneCall className="h-3.5 w-3.5" />
								<span>Simulate Telephony Bridge</span>
							</>
						)}
					</Button>
					<Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
						<Link href="/chat">
							<Sparkles className="h-3.5 w-3.5 text-amber-400" />
							<span>Configure in Eve</span>
						</Link>
					</Button>
				</div>
			</div>

			{/* KPI Telemetry Stat Cards */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
				<div className="rounded-xl border border-border/80 bg-card p-4">
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-muted-foreground">Telephony Latency</span>
						<Zap className="h-4 w-4 text-sky-400" />
					</div>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="text-2xl font-bold tracking-tight text-foreground font-mono">820ms</span>
						<span className="text-xs text-amber-400 font-medium">Exotel DLT</span>
					</div>
					<p className="text-[11px] text-muted-foreground mt-1">160-series compliant route</p>
				</div>

				<div className="rounded-xl border border-border/80 bg-card p-4">
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-muted-foreground">Sarvam Bulbul TTS</span>
						<Volume2 className="h-4 w-4 text-amber-400" />
					</div>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="text-2xl font-bold tracking-tight text-foreground font-mono">210ms</span>
						<span className="text-xs text-amber-400 font-medium">8kHz WAV</span>
					</div>
					<p className="text-[11px] text-muted-foreground mt-1">Natural Telugu &amp; Hindi models</p>
				</div>

				<div className="rounded-xl border border-border/80 bg-card p-4">
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-muted-foreground">DTMF Bridge Rate</span>
						<Radio className="h-4 w-4 text-amber-400 animate-pulse" />
					</div>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="text-2xl font-bold tracking-tight text-foreground font-mono">78.4%</span>
						<span className="text-xs text-amber-400 font-medium">↑ +14%</span>
					</div>
					<p className="text-[11px] text-muted-foreground mt-1">Dealers connected via Key 1</p>
				</div>

				<div className="rounded-xl border border-border/80 bg-card p-4">
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-muted-foreground">Avg Cost Per Dispatch</span>
						<Clock className="h-4 w-4 text-purple-400" />
					</div>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="text-2xl font-bold tracking-tight text-foreground font-mono">₹1.41</span>
						<span className="text-xs text-muted-foreground font-normal">/ call</span>
					</div>
					<p className="text-[11px] text-muted-foreground mt-1">Zero telecom waste</p>
				</div>
			</div>

			{/* Studio Tabs Navigation */}
			<div className="flex items-center gap-1.5 border-b border-border/80 pb-2">
				<Button
					size="sm"
					variant={activeTab === 'simulator' ? 'secondary' : 'ghost'}
					onClick={() => setActiveTab('simulator')}
					className="text-xs h-8 gap-1.5"
				>
					<Phone className="h-3.5 w-3.5" />
					<span>Interactive Call Simulator</span>
				</Button>
				<Button
					size="sm"
					variant={activeTab === 'scripts' ? 'secondary' : 'ghost'}
					onClick={() => setActiveTab('scripts')}
					className="text-xs h-8 gap-1.5"
				>
					<Languages className="h-3.5 w-3.5" />
					<span>Multilingual Prompt Studio</span>
				</Button>
				<Button
					size="sm"
					variant={activeTab === 'logs' ? 'secondary' : 'ghost'}
					onClick={() => setActiveTab('logs')}
					className="text-xs h-8 gap-1.5"
				>
					<Clock className="h-3.5 w-3.5" />
					<span>Recent Telephony Dispatches</span>
				</Button>
			</div>

			{/* TAB 1: Live Interactive Simulator */}
			{activeTab === 'simulator' && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left: Engine Config & Controls */}
					<div className="rounded-xl border border-border/80 bg-card p-5 flex flex-col gap-5">
						<div>
							<h3 className="text-sm font-semibold text-foreground">Telephony Configuration</h3>
							<p className="text-xs text-muted-foreground mt-0.5">
								Select voice dispatch mode and regional phonetic models
							</p>
						</div>

						<div className="flex flex-col gap-4">
							<div>
								<label className="text-xs font-medium text-foreground">Voice Engine Mode</label>
								<div className="mt-2 grid grid-cols-1 gap-2">
									<button
										type="button"
										onClick={() => setActiveMode('telephony_bridge')}
										className={`rounded-lg border p-3 text-left text-xs transition-all ${
											activeMode === 'telephony_bridge'
												? 'border-amber-500/60 bg-amber-500/10 shadow-xs'
												: 'border-border/80 bg-muted/20 hover:bg-muted/40'
										}`}
									>
										<div className="font-semibold text-foreground flex items-center justify-between">
											<span>Mode A: Telephony Bridge</span>
											<Badge variant="outline" className="text-[10px]">Instant</Badge>
										</div>
										<p className="mt-1 text-muted-foreground text-[11px] leading-relaxed">
											One-shot DLT alert call with DTMF Key 1 live bridge directly to buyer.
										</p>
									</button>

									<button
										type="button"
										onClick={() => setActiveMode('conversational_agent')}
										className={`rounded-lg border p-3 text-left text-xs transition-all ${
											activeMode === 'conversational_agent'
												? 'border-amber-500/60 bg-amber-500/10 shadow-xs'
												: 'border-border/80 bg-muted/20 hover:bg-muted/40'
										}`}
									>
										<div className="font-semibold text-foreground flex items-center justify-between">
											<span>Mode B: Autonomous Agent</span>
											<Badge variant="outline" className="text-[10px]">AI Voice</Badge>
										</div>
										<p className="mt-1 text-muted-foreground text-[11px] leading-relaxed">
											Conversational Sarvam Saaras STT + LLM spec qualification dialog.
										</p>
									</button>
								</div>
							</div>

							<div>
								<label className="text-xs font-medium text-foreground">Dialect &amp; Voice Model</label>
								<select
									value={selectedLanguage}
									onChange={(e) => setSelectedLanguage(e.target.value as 'te-IN' | 'hi-IN' | 'en-IN')}
									className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none"
								>
									<option value="te-IN">Telugu (te-IN · Sarvam Anushka · South Zone)</option>
									<option value="hi-IN">Hindi / Hinglish (hi-IN · Sarvam Abhilash · North/West)</option>
									<option value="en-IN">Indian English (en-IN · Sarvam Aditya · Corporate)</option>
								</select>
							</div>

							<div className="rounded-lg border border-border/70 bg-muted/30 p-3.5 space-y-2 text-xs">
								<div className="flex items-center justify-between text-muted-foreground">
									<span>TRAI 160 Header</span>
									<span className="font-mono text-amber-400 font-semibold">DLT-BHARAT-160</span>
								</div>
								<div className="flex items-center justify-between text-muted-foreground">
									<span>Quiet Hours Guard</span>
									<span className="text-foreground">22:00–07:00 IST (Enforced)</span>
								</div>
								<div className="flex items-center justify-between text-muted-foreground">
									<span>Trigger Delay</span>
									<span className="text-foreground">WhatsApp Unread &gt; 2 Min</span>
								</div>
							</div>
						</div>
					</div>

					{/* Right: Live Transcript & Waveform Studio */}
					<div className="lg:col-span-2 rounded-xl border border-border/80 bg-card p-5 flex flex-col justify-between">
						<div>
							<div className="flex items-center justify-between border-b border-border/60 pb-3.5">
								<div className="flex items-center gap-2.5">
									<div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
										<Headphones className="size-4" />
									</div>
									<div>
										<h3 className="text-sm font-semibold text-foreground">Live Telephony Stream</h3>
										<p className="text-[11px] text-muted-foreground">Real-time Exotel Bridge Telemetry</p>
									</div>
								</div>

								<div className="flex items-center gap-2">
									{/* Waveform visualizer */}
									<div className="flex items-center gap-0.5 h-5 px-2">
										{[40, 70, 30, 90, 50, 80, 45, 60, 95, 30].map((h, i) => (
											<span
												key={i}
												style={{ height: audioPlaying ? `${h}%` : '20%' }}
												className={`w-0.5 rounded-full transition-all duration-200 ${
													audioPlaying ? 'bg-amber-400' : 'bg-muted-foreground/30'
												}`}
											/>
										))}
									</div>

									<Badge
										variant="outline"
										className={
											callStatus === 'connected'
												? 'border-amber-500/40 bg-amber-500/10 text-amber-400 animate-pulse text-xs'
												: callStatus === 'ringing'
													? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400 text-xs'
													: callStatus === 'completed'
														? 'border-border bg-muted/40 text-foreground text-xs'
														: 'border-border text-muted-foreground text-xs'
										}
									>
										{callStatus === 'connected'
											? 'CALL BRIDGED (DTMF 1)'
											: callStatus === 'ringing'
												? 'DIALING EXOTEL 160...'
												: callStatus === 'completed'
													? 'COMPLETED (38s)'
													: 'STANDBY'}
									</Badge>
								</div>
							</div>

							{/* Transcript Stream Feed */}
							<div className="mt-5 space-y-3 max-h-80 overflow-y-auto pr-1">
								{SAMPLE_CALL_TRANSCRIPT.slice(0, currentStep + 1).map((turn, i) => (
									<div
										key={i}
										className={`rounded-xl p-3.5 border text-xs transition-all duration-300 ${
											turn.speaker.includes('AI Agent')
												? 'border-amber-500/30 bg-amber-500/5 text-foreground ml-4'
												: turn.speaker.includes('Dealer')
													? 'border-border/80 bg-muted/40 text-foreground mr-4 font-mono'
													: 'border-sky-500/30 bg-sky-500/5 text-foreground mr-4'
										}`}
									>
										<div className="flex items-center justify-between text-[10px] text-muted-foreground pb-1.5 border-b border-border/40 mb-1.5">
											<span className="font-semibold text-foreground">{turn.speaker}</span>
											<div className="flex items-center gap-2 font-mono">
												<Badge variant="outline" className="text-[9px] py-0 px-1">
													{turn.lang}
												</Badge>
												<span>{turn.timestamp}</span>
											</div>
										</div>
										<p className="leading-relaxed">{turn.text}</p>
									</div>
								))}
							</div>
						</div>

						{/* Bottom Summary Bar */}
						<div className="mt-5 rounded-lg border border-border/80 bg-muted/30 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
								<span className="text-foreground">
									Extracted Specs: <strong>15HP Vertical Multistage (120m Head)</strong> · SKU: <code>CR-15-120M</code>
								</span>
							</div>
							<div className="flex items-center gap-3 font-mono text-muted-foreground shrink-0">
								<span>Duration: 00:38s</span>
								<span className="text-amber-400 font-semibold">₹1.42 billed</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* TAB 2: Multilingual Prompt Studio */}
			{activeTab === 'scripts' && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="rounded-xl border border-border/80 bg-card p-5 flex flex-col gap-4">
						<h3 className="text-sm font-semibold text-foreground">Regional Dialect Templates</h3>
						<p className="text-xs text-muted-foreground">
							Choose language model template to preview phonetics and dynamic parameter injections.
						</p>

						<div className="space-y-2">
							{[
								{ id: 'te-IN', label: 'Telugu (Andhra & Telangana)', voice: 'Sarvam Anushka', badge: 'High Engagement' },
								{ id: 'hi-IN', label: 'Hindi / Hinglish (Pan-India Industrial)', voice: 'Sarvam Abhilash', badge: 'Standard' },
								{ id: 'en-IN', label: 'Indian English (Corporate Industrial)', voice: 'Sarvam Aditya', badge: 'Tier-1 Metro' },
							].map((item) => (
								<button
									type="button"
									key={item.id}
									onClick={() => setSelectedLanguage(item.id as any)}
									className={`flex flex-col w-full text-left p-3 rounded-lg border transition-all ${
										selectedLanguage === item.id
											? 'border-amber-500/60 bg-amber-500/10'
											: 'border-border/70 hover:bg-muted/40'
									}`}
								>
									<div className="flex items-center justify-between">
										<span className="font-semibold text-xs text-foreground">{item.label}</span>
										<Badge variant="outline" className="text-[10px]">{item.badge}</Badge>
									</div>
									<span className="text-[11px] text-muted-foreground mt-1">Voice: {item.voice}</span>
								</button>
							))}
						</div>
					</div>

					<div className="lg:col-span-2 rounded-xl border border-border/80 bg-card p-5 flex flex-col justify-between gap-5">
						<div>
							<div className="flex items-center justify-between border-b border-border/60 pb-3">
								<div>
									<h3 className="text-sm font-semibold text-foreground">TTS Phonetic Script</h3>
									<p className="text-xs text-muted-foreground">Dynamic variables injected in sub-100ms at edge</p>
								</div>
								<Badge variant="outline" className="text-xs font-mono">{selectedLanguage}</Badge>
							</div>

							<div className="mt-4 rounded-lg border border-border/80 bg-muted/30 p-4 font-mono text-xs text-foreground leading-relaxed">
								{selectedLanguage === 'te-IN' && (
									<>
										&quot;Namaskaram <span className="text-amber-400 bg-amber-500/10 px-1 rounded">{'{seller_owner_name}'}</span> garu, <span className="text-sky-400 bg-sky-500/10 px-1 rounded">{'{company_name}'}</span> nundi AI assistant matladuthunnanu. IndiaMart lo <span className="text-amber-400 bg-amber-500/10 px-1 rounded">{'{product_spec}'}</span> kosam high-intent BuyLead vachindi. Buyer tho direct ga matladataniki 1 press cheyandi.&quot;
									</>
								)}
								{selectedLanguage === 'hi-IN' && (
									<>
										&quot;Namaste <span className="text-amber-400 bg-amber-500/10 px-1 rounded">{'{seller_owner_name}'}</span>, main <span className="text-sky-400 bg-sky-500/10 px-1 rounded">{'{company_name}'}</span> ka AI assistant bol raha hoon. IndiaMart par <span className="text-amber-400 bg-amber-500/10 px-1 rounded">{'{product_spec}'}</span> ke liye urgent inquiry aayi hai. Buyer se turant connect karne ke liye 1 dabayein.&quot;
									</>
								)}
								{selectedLanguage === 'en-IN' && (
									<>
										&quot;Hello <span className="text-amber-400 bg-amber-500/10 px-1 rounded">{'{seller_owner_name}'}</span>, this is the automated assistant for <span className="text-sky-400 bg-sky-500/10 px-1 rounded">{'{company_name}'}</span>. We have captured an urgent IndiaMart lead for <span className="text-amber-400 bg-amber-500/10 px-1 rounded">{'{product_spec}'}</span>. Press 1 to connect with the buyer right now.&quot;
									</>
								)}
							</div>
						</div>

						<div className="flex items-center justify-between pt-3 border-t border-border/60">
							<span className="text-xs text-muted-foreground">Estimated TTS generation latency: <strong>180ms</strong></span>
							<Button size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
								<Sparkles className="size-3.5" />
								<span>Save Script Changes</span>
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* TAB 3: Recent Telephony Dispatches */}
			{activeTab === 'logs' && (
				<div className="rounded-xl border border-border/80 bg-card overflow-hidden">
					<SimpleTable
						columns={[
							{ id: 'call', header: 'Call ID & Buyer', width: 'w-2/5' },
							{ id: 'location', header: 'Location', width: 'w-1/5' },
							{ id: 'language', header: 'Dialect', width: 'w-1/6' },
							{ id: 'duration', header: 'Duration / Cost', width: 'w-28', align: 'center' },
							{ id: 'status', header: 'DTMF Status', width: 'w-36', align: 'right' },
						]}
					>
						{RECENT_CALL_LOGS.map((log) => (
							<SimpleTableRow key={log.id}>
								<td className="px-4 py-3">
									<div className="flex flex-col">
										<span className="font-medium text-sm text-foreground">{log.buyer}</span>
										<span className="text-xs text-muted-foreground font-mono">
											{log.id} · {log.spec}
										</span>
									</div>
								</td>
								<td className="px-4 py-3 text-xs text-muted-foreground">
									{log.location}
								</td>
								<td className="px-4 py-3 text-xs text-muted-foreground">
									{log.lang}
								</td>
								<td className="px-4 py-3 text-center text-xs">
									<div className="font-mono text-foreground font-medium">{log.duration}</div>
									<div className="text-[10px] text-amber-400 font-mono">{log.cost}</div>
								</td>
								<td className="px-4 py-3 text-right">
									<Badge
										variant="outline"
										className={
											log.dtmfPressed
												? 'border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs'
												: 'border-border text-muted-foreground text-xs'
										}
									>
										{log.status}
									</Badge>
								</td>
							</SimpleTableRow>
						))}
					</SimpleTable>
				</div>
			)}
		</div>
	);
}
