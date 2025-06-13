// This file defines the main, stateful workflow for processing a meeting.
// Inngest automatically handles retries, state, and waiting.
import { inngest } from './client';
import { db } from '../../db/client';
import { vexaService } from '../../core/vexa.service';
import { agent } from '../../intelligence/agent';
import { notificationService } from '../../notifications/service';
import { AnalysisResult, ActionItemData } from '../../core/types';
import { EventPayload } from 'inngest';
import { n8nService } from '../../n8n/service';

type MeetingDetectedPayload = EventPayload<(typeof inngest.events)['meeting/detected']>;
type MeetingAnalysisCompletePayload = EventPayload<(typeof inngest.events)['meeting/analysis.complete']>;

export const processMeetingWorkflow = inngest.createFunction(
  { id: 'process-meeting-workflow', concurrency: 5 }, // Process up to 5 meetings at once
  { event: 'meeting/detected' },
  async ({ event, step }: { event: MeetingDetectedPayload; step: any }) => {
    const { meetingId } = event.data;

    await step.run('notify-n8n-of-meeting', () => n8nService.callVexaMeetingIngest(meetingId));

    /*
     * The following steps are now presumably handled by your n8n workflow.
     * If you want to run them here in parallel, you can uncomment them.
     */

    // const meeting = await step.run('fetch-meeting-data', () =>
    //   db.meeting.findUnique({ where: { id: meetingId }, include: { user: true } })
    // );

    // if (!meeting || !meeting.user.vexoApiKey) {
    //   throw new Error(`Meeting ${meetingId} or user API key not found.`);
    // }

    // await step.run('request-vexa-bot', () =>
    //   vexaService.requestBot({
    //     apiKey: meeting.user.vexoApiKey!,
    //     nativeMeetingId: meeting.nativeMeetingId,
    //   })
    // );
    
    // // Inngest will sleep and resume here. The workflow can run for hours.
    // await step.sleep('wait-for-meeting-to-progress', '3m');
    
    // const fullTranscript = await step.run('poll-for-final-transcript', () => 
    //   vexaService.pollTranscript({
    //       apiKey: meeting.user.vexoApiKey!,
    //       nativeMeetingId: meeting.nativeMeetingId,
    //   })
    // );

    // if (fullTranscript.length < 50) {
    //   return { status: 'Skipped', reason: 'Transcript too short.' };
    // }
    
    // const analysis: AnalysisResult = await step.run('analyze-transcript-with-ai', () =>
    //   agent.finalAnalysis(fullTranscript)
    // );

    // await step.run('save-analysis-to-database', async () => {
    //   await db.analysis.create({
    //     data: {
    //       meetingId: meeting.id,
    //       summary: analysis.summary,
    //       sentiment: analysis.sentiment,
    //       sentimentScore: analysis.sentimentScore,
    //       keyTopics: analysis.keyTopics,
    //     },
    //   });
    //   if (analysis.actionItems.length > 0) {
    //     await db.actionItem.createMany({
    //       data: analysis.actionItems.map((item: ActionItemData) => ({ ...item, meetingId: meeting.id })),
    //     });
    //   }
    // });

    // // Send a new event to trigger notifications separately.
    // // This makes the system more modular.
    // await step.sendEvent('send-notification', {
    //   name: 'meeting/analysis.complete',
    //   data: { meetingId: meeting.id, analysis },
    // });

    return { status: 'Handed off to n8n' };
  }
);

// A separate workflow for notifications, triggered by the main one.
export const notificationWorkflow = inngest.createFunction(
  { id: 'notification-workflow' },
  { event: 'meeting/analysis.complete' },
  async ({ event, step }: { event: MeetingAnalysisCompletePayload; step: any }) => {
    const { meetingId, analysis } = event.data;
    
    const meeting = await step.run('fetch-meeting-for-notification', () => 
      db.meeting.findUnique({ where: { id: meetingId }, include: { user: true } })
    );

    if (!meeting) throw new Error("Meeting not found for notification.");

    await step.run('send-slack-summary', () => 
      notificationService.sendSummaryToSlack({
          slackUserId: meeting.user.slackUserId,
          meetingTitle: meeting.title,
          analysis,
      })
    );
    
    return { status: "Notification sent" };
  }
); 