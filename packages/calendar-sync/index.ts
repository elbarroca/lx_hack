// This is the entry point for your scheduled cron job.
// You would configure your provider (Vercel, Supabase) to run this script.
import { google } from 'googleapis';
import { db } from '../db/client';
import { inngest } from '../api/inngest/client';
import { Credentials } from 'google-auth-library';

async function checkForMeetings() {
  console.log('Cron job started: Checking for new meetings...');

  const users = await db.user.findMany({
    where: { googleTokens: { not: null }, vexoApiKey: { not: null } },
  });

  for (const user of users) {
    if (!user.googleTokens) continue;

    const auth = new google.auth.OAuth2();
    auth.setCredentials(user.googleTokens as Credentials);
    const calendar = google.calendar({ version: 'v3', auth });

    const timeMin = new Date();
    const timeMax = new Date(timeMin.getTime() + 5 * 60 * 1000); // Check 5 mins window

    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    if (!res.data.items) continue;

    for (const event of res.data.items) {
      if (event.hangoutLink) {
        const nativeMeetingId = event.hangoutLink.split('/').pop()!;
        
        const existingMeeting = await db.meeting.findUnique({
          where: { platform_nativeMeetingId: { platform: 'google_meet', nativeMeetingId } },
        });

        if (!existingMeeting) {
          console.log(`New meeting found: ${event.summary} (${nativeMeetingId})`);
          const newMeeting = await db.meeting.create({
            data: {
              nativeMeetingId,
              title: event.summary || 'Untitled Meeting',
              scheduledAt: event.start?.dateTime ? new Date(event.start.dateTime) : new Date(),
              userId: user.id,
            },
          });

          // THE HANDOFF: This sends an event to our workflow engine to start the main process.
          await inngest.send({
            name: 'meeting/detected',
            data: { meetingId: newMeeting.id },
            user: { email: user.email }, // Pass user info for context
          });
        }
      }
    }
  }

  console.log('Cron job finished.');
}

checkForMeetings().catch(console.error); 