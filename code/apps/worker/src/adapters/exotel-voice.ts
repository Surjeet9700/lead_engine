// VoicePort adapter: Exotel connect.json + Sarvam Bulbul TTS.
// All params verified against primary sources:
//   - Exotel: developer.exotel.com/docs/voice-v1/api-reference/connect-two-numbers
//   - Sarvam: docs.sarvam.ai/api-reference/text-to-speech/convert
// One-shot notification bridge — NOT conversational AI.
import type { VoicePort, VoiceCallStatus } from '../ports';
import { RetryableError } from '../errors';

export interface ExotelConfig {
	sid: string;
	token: string;
	subdomain: string; // e.g. "yourcompany" → yourcompany.exotel.com
	callerId: string; // ExoPhone number (160-series preferred)
}

export interface SarvamConfig {
	apiKey: string;
	model?: 'bulbul:v2' | 'bulbul:v3';
}

// Verified speakers per Sarvam docs (case-sensitive, lowercase)
const SARVAM_SPEAKERS = {
	'bulbul:v2': { female: 'anushka', male: 'abhilash' },
	'bulbul:v3': { female: 'shubh', male: 'aditya' },
} as const;

/**
 * Generate TTS audio via Sarvam Bulbul.
 * Request body verified from docs.sarvam.ai/api-reference/text-to-speech/convert:
 *   POST https://api.sarvam.ai/text-to-speech
 *   Headers: api-subscription-key
 *   Body: { text: string, target_language_code: string, speaker: string, model: string, ... }
 *   Response: { request_id: string, audios: string[] } // base64 WAV
 */
export async function generateTts(
	text: string,
	langCode: 'hi-IN' | 'te-IN',
	config: SarvamConfig,
): Promise<string> {
	const model = config.model ?? 'bulbul:v2';
	const speaker = SARVAM_SPEAKERS[model]?.female ?? 'anushka';

	const body: Record<string, unknown> = {
		text,
		target_language_code: langCode,
		speaker,
		model,
		output_audio_codec: 'wav',
		speech_sample_rate: 8000, // telephony-grade sample rate for Exotel
	};

	if (model === 'bulbul:v2') {
		body.pitch = 0;
		body.pace = 1.0;
	}

	const res = await fetch('https://api.sarvam.ai/text-to-speech', {
		method: 'POST',
		headers: {
			'api-subscription-key': config.apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		throw new RetryableError('WA_TRANSIENT', `sarvam_tts_${res.status}:${await res.text().then((t) => t.slice(0, 200))}`);
	}

	const data = (await res.json()) as { audios?: string[] };
	if (!data.audios?.[0]) throw new RetryableError('WA_TRANSIENT', 'sarvam_tts_empty_response');
	return data.audios[0]; // base64-encoded WAV
}

/** Build voice intro script with mandatory TRAI AI disclosure. */
export function buildVoiceScript(ownerName: string, product: string, company: string): string {
	return (
		`Namaste ${ownerName}, main ${company} ka AI assistant bol raha hoon.` +
		` Aapke liye ek hot ${product} enquiry aayi hai IndiaMart par.` +
		` Buyer se baat karne ke liye rukiye.` +
		` Ye call record ho rahi hai.`
	);
}

export class ExotelVoice implements VoicePort {
	constructor(
		private exotel: ExotelConfig,
		private sarvam: SarvamConfig,
	) {}

	async call(input: {
		to: string;
		buyerPhone: string;
		ownerName: string;
		product: string;
		company: string;
		lang?: string;
		leadDedupKey: string;
	}): Promise<{ callId: string; status: VoiceCallStatus }> {
		// TRAI compliance: 9AM–9PM IST only
		const istHourStr = new Date().toLocaleString('en-IN', {
			timeZone: 'Asia/Kolkata',
			hour: 'numeric',
			hour12: false,
		});
		const istHour = Number(istHourStr);
		if (istHour < 9 || istHour >= 21) {
			return { callId: '', status: 'failed' };
		}

		// Pre-generate TTS audio (fail fast before placing paid call)
		const lang = input.lang === 'te-IN' ? ('te-IN' as const) : ('hi-IN' as const);
		await generateTts(buildVoiceScript(input.ownerName, input.product, input.company), lang, this.sarvam);

		// Exotel Connect Two Numbers API (verified from developer.exotel.com)
		// Endpoint: POST /v1/Accounts/{sid}/Calls/connect.json
		// Auth: Basic base64(sid:token)
		// Content-Type: application/x-www-form-urlencoded
		// Params (form-data): From, To, CallerId, CallType, TimeLimit, StatusCallback
		const url = `https://${this.exotel.subdomain}.exotel.com/v1/Accounts/${this.exotel.sid}/Calls/connect.json`;

		const params = new URLSearchParams();
		params.set('From', input.to); // owner's phone (called first)
		params.set('To', input.buyerPhone); // buyer's phone (connected after owner picks up)
		params.set('CallerId', this.exotel.callerId); // ExoPhone virtual number
		params.set('CallType', 'trans'); // transactional
		params.set('TimeLimit', '90'); // max 90 seconds
		params.set('StatusCallback', `https://lead-speed-engine.surjeethkumar4.workers.dev/webhook/voice/exotel?leadKey=${encodeURIComponent(input.leadDedupKey)}`);
		params.set('StatusCallbackEvents[0]', 'terminal');
		params.set('CustomField', input.leadDedupKey.slice(0, 128));

		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Basic ${btoa(`${this.exotel.sid}:${this.exotel.token}`)}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: params.toString(),
			});

			// Verified response format from Exotel docs:
			// { Call: { Sid, Status, Direction, ... } }
			const data = (await res.json().catch(() => ({}))) as { Call?: { Sid?: string; Status?: string } };

			if (!res.ok) {
				// Exotel returns 200 even for queued calls; non-200 means API error
				const detail = JSON.stringify(data).slice(0, 200);
				throw new RetryableError('WA_TRANSIENT', `exotel_api_${res.status}:${detail}`);
			}

			const sid = data.Call?.Sid ?? '';
			const status = data.Call?.Status ?? '';

			// Map Exotel status to our VoiceCallStatus (verified from docs)
			let mapped: VoiceCallStatus;
			switch (status) {
				case 'queued':
				case 'in-progress':
					mapped = 'dialling';
					break;
				case 'completed':
					mapped = 'answered';
					break;
				case 'busy':
					mapped = 'busy';
					break;
				case 'no-answer':
					mapped = 'no_answer';
					break;
				case 'failed':
					mapped = 'failed';
					break;
				default:
					mapped = 'dialling';
			}

			return { callId: sid, status: mapped };
		} catch (e) {
			if (e instanceof RetryableError) throw e;
			throw new RetryableError('WA_TRANSIENT', `exotel_network:${e instanceof Error ? e.message : String(e)}`);
		}
	}

	async checkStatus(callSid: string): Promise<'answered' | 'no_answer' | 'busy' | 'failed'> {
		const url = `https://${this.exotel.subdomain}.exotel.com/v1/Accounts/${this.exotel.sid}/Calls/${callSid}.json`;
		const res = await fetch(url, {
			headers: { Authorization: `Basic ${btoa(`${this.exotel.sid}:${this.exotel.token}`)}` },
		});
		const data = (await res.json().catch(() => ({}))) as { Call?: { Status?: string } };
		switch (data.Call?.Status) {
			case 'completed':
				return 'answered';
			case 'busy':
				return 'busy';
			case 'failed':
				return 'failed';
			default:
				return 'no_answer';
		}
	}
}
