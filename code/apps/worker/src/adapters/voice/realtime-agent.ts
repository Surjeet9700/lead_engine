// Conversational Realtime Voice Agent: Multilingual STT + Fast LLM Spec Qualification + Low-latency TTS.

import type { ExtractedPumpSpec } from '../../domain/llm-spec';
import { extractPumpSpecs } from '../../domain/llm-spec';

export interface VoiceConversationTurn {
	role: 'user' | 'assistant' | 'system';
	text: string;
	timestampMs: number;
}

export interface VoiceAgentSession {
	sessionId: string;
	leadDedupKey: string;
	sellerId: string;
	buyerPhone: string;
	language: 'te-IN' | 'hi-IN' | 'en-IN';
	turns: VoiceConversationTurn[];
	extractedSpec?: ExtractedPumpSpec;
	status: 'active' | 'completed' | 'transferred';
}

export class RealtimeVoiceAgent {
	constructor(
		public readonly apiKey: string,
		public readonly dealerCompany: string,
	) {}

	/**
	 * Generate opening greeting for outbound buyer qualification call.
	 */
	getOpeningGreeting(buyerName: string, product: string, lang: 'te-IN' | 'hi-IN' | 'en-IN' = 'hi-IN'): string {
		if (lang === 'te-IN') {
			return (
				`Namaskaram ${buyerName} garu, ${this.dealerCompany} nundi matladuthunnamu. ` +
				`Meer IndiaMart lo ${product} gurinchi adigaru. ` +
				`Mee requirement entha HP and Head avasaram untundi?`
			);
		}
		return (
			`Namaste ${buyerName} ji, main ${this.dealerCompany} se baat kar raha hoon. ` +
			`Aapne IndiaMart par ${product} ke liye enquiry ki thi. ` +
			`Aapko kitne HP aur kitne meters head ki requirement hai?`
		);
	}

	/**
	 * Process incoming buyer speech transcription and formulate next conversational turn.
	 */
	processBuyerTurn(
		session: VoiceAgentSession,
		buyerSpeech: string,
	): { responseText: string; updatedSpec: ExtractedPumpSpec; isReadyToQuote: boolean } {
		session.turns.push({
			role: 'user',
			text: buyerSpeech,
			timestampMs: Date.now(),
		});

		// Accumulate full conversation history for spec extraction
		const conversationText = session.turns
			.filter((t) => t.role === 'user')
			.map((t) => t.text)
			.join(' ');

		const updatedSpec = extractPumpSpecs(conversationText);
		session.extractedSpec = updatedSpec;

		let responseText = '';
		let isReadyToQuote = false;

		if (updatedSpec.powerHp !== null && (updatedSpec.headMeters !== null || updatedSpec.flowLpm !== null)) {
			// Ready to send formal quotation
			isReadyToQuote = true;
			if (session.language === 'te-IN') {
				responseText =
					`Chala dhanyavadamulu. Mee ${updatedSpec.powerHp}HP requirement ki mana daggara stock undi. ` +
					`Official WhatsApp quotation and technical catalog ippude meeku send chesthunnamu. ` +
					`Maa sales engineer direct ga contact chestharu.`;
			} else {
				responseText =
					`Bahut dhanyawad. Aapki ${updatedSpec.powerHp}HP requirement ka stock ready hai. ` +
					`Main turant official quotation aur technical catalog aapke WhatsApp par bhej raha hoon. ` +
					`Hamare engineer aapse direct baat karenge.`;
			}
		} else if (updatedSpec.powerHp === null) {
			// Ask for HP rating
			if (session.language === 'te-IN') {
				responseText = `Meeku kitna HP motor kavali? (e.g. 5HP, 7.5HP, leka 15HP)`;
			} else {
				responseText = `Aapko kitne HP ki motor chahiye? Jaise 5HP, 7.5HP ya 15HP?`;
			}
		} else {
			// Ask for Head or application
			if (session.language === 'te-IN') {
				responseText = `Ee pump borewell kosama leka industrial water delivery kosama? Head depth entha?`;
			} else {
				responseText = `Yeh pump borewell ke liye chahiye ya industrial factory ke liye? Kitne feet ya meter head hai?`;
			}
		}

		session.turns.push({
			role: 'assistant',
			text: responseText,
			timestampMs: Date.now(),
		});

		return {
			responseText,
			updatedSpec,
			isReadyToQuote,
		};
	}
}
