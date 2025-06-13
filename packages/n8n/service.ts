import axios from 'axios';

const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

async function callVexaMeetingIngest(meetingId: string) {
  if (!n8nWebhookUrl) {
    console.error('N8N_WEBHOOK_URL is not set. Skipping call to n8n.');
    // In a real app, you might want to throw an error or handle this differently.
    return;
  }

  try {
    await axios.post(n8nWebhookUrl, {
      meetingId,
    });
    console.log(`Successfully called n8n webhook for meeting: ${meetingId}`);
  } catch (error) {
    console.error(`Error calling n8n webhook for meeting ${meetingId}:`, error);
    // Handle error appropriately
  }
}

export const n8nService = {
  callVexaMeetingIngest,
}; 