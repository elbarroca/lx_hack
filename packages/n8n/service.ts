import axios from 'axios';

const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

async function callVexaMeetingIngest(meetingId: string) {
  if (!n8nWebhookUrl) {
    console.error('N8N_WEBHOOK_URL is not set. Skipping call to n8n.');
    throw new Error('N8N_WEBHOOK_URL is not configured.');
  }

  console.log(`Calling n8n webhook for meeting: ${meetingId}`);

  try {
    await axios.post(n8nWebhookUrl, {
      meetingId,
    });
    console.log(`Successfully called n8n webhook for meeting: ${meetingId}`);
    return { success: true, message: 'Webhook triggered successfully.' };
  } catch (error) {
    console.error(`Error calling n8n webhook for meeting ${meetingId}:`, error);
    throw new Error('Failed to trigger n8n webhook.');
  }
}

export const n8nService = {
  callVexaMeetingIngest,
}; 