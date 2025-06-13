import { WebClient } from '@slack/web-api';
import { AnalysisResult } from '../core/types';

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

interface SummaryPayload {
    slackUserId?: string | null;
    meetingTitle?: string | null;
    analysis: AnalysisResult;
}

async function sendSummaryToSlack({ slackUserId, meetingTitle, analysis }: SummaryPayload) {
    if (!slackUserId) {
      console.log("No Slack user ID provided, skipping notification.");
      return;
    }

    const actionItemsText = analysis.actionItems.length > 0
        ? analysis.actionItems.map(item => `• *${item.owner}:* ${item.taskDescription}`).join('\n')
        : '_No action items were identified._';

    await slackClient.chat.postMessage({
        channel: slackUserId, // DM the user who initiated the meeting
        text: `Meeting Summary: ${meetingTitle}`, // Fallback for mobile notifications
        blocks: [
            {
                type: 'header',
                text: { type: 'plain_text', text: `Summary for: ${meetingTitle || 'Your Recent Meeting'}`, emoji: true },
            },
            { type: 'divider' },
            {
                type: 'section',
                text: { type: 'mrkdwn', text: `*Key Takeaways:*\n${analysis.summary}` },
            },
            {
                type: 'section',
                text: { type: 'mrkdwn', text: `*Action Items:*\n${actionItemsText}` },
            },
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: `*Sentiment:* ${analysis.sentiment} (${analysis.sentimentScore.toFixed(2)}) | *Topics:* ${analysis.keyTopics.join(', ')}`,
                    },
                ],
            },
        ],
    });
}

export const notificationService = { sendSummaryToSlack }; 