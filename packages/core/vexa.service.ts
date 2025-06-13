// This service encapsulates all communication with the Vexa AI API.
// No other part of the app needs to know about Vexa's specific endpoints.
import axios from 'axios';

const VEXA_BASE_URL = "https://gateway.dev.vexa.ai";

interface VexaApiParams {
  apiKey: string;
  platform?: string;
  nativeMeetingId: string;
}

interface RequestBotParams extends VexaApiParams {
  botName?: string;
  language?: string;
}

// Function to request a Vexa bot to join a meeting.
async function requestBot(params: RequestBotParams) {
  const { apiKey, nativeMeetingId, platform = 'google_meet', botName = 'AI Assistant' } = params;
  
  await axios.post(
    `${VEXA_BASE_URL}/bots`,
    {
      platform,
      native_meeting_id: nativeMeetingId,
      bot_name: botName,
    },
    { headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' } }
  );
  console.log(`Vexa bot requested for meeting: ${nativeMeetingId}`);
}

interface TranscriptSegment {
    speaker: string;
    text: string;
}

// Function to poll the transcript until the meeting is over.
async function pollTranscript(params: VexaApiParams): Promise<string> {
    const { apiKey, nativeMeetingId, platform = 'google_meet' } = params;
    const url = `${VEXA_BASE_URL}/transcripts/${platform}/${nativeMeetingId}`;

    let fullTranscriptText = '';
    let inactivityCounter = 0;
    const MAX_INACTIVITY = 10; // Stop after 5 minutes of no new content (10 * 30s)

    while (inactivityCounter < MAX_INACTIVITY) {
        // Wait 30 seconds between polls
        await new Promise(resolve => setTimeout(resolve, 30000));

        const response = await axios.get<{ transcript: TranscriptSegment[] }>(url, { headers: { 'X-API-Key': apiKey } });
        const transcriptSegments = response.data.transcript || [];
        
        const currentTranscript = transcriptSegments
            .map((segment: TranscriptSegment) => `${segment.speaker}: ${segment.text}`)
            .join('\n');
            
        if (currentTranscript.length > fullTranscriptText.length) {
            fullTranscriptText = currentTranscript;
            inactivityCounter = 0; // Reset counter on new content
            console.log(`Transcript updated for ${nativeMeetingId}. Length: ${fullTranscriptText.length}`);
        } else {
            inactivityCounter++;
            console.log(`Inactivity counter for ${nativeMeetingId}: ${inactivityCounter}/${MAX_INACTIVITY}`);
        }
    }
    
    console.log(`Polling finished for meeting: ${nativeMeetingId}`);
    return fullTranscriptText;
}

export const vexaService = { requestBot, pollTranscript }; 