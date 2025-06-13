import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          vexa_api_key: string | null;
          calendar_email: string | null;
          google_calendar_token: string | null;
          monitoring_enabled: boolean | null;
        };
      };
      meetings: {
        Insert: {
          user_id: string;
          native_meeting_id: string;
          meeting_url: string;
          meeting_title: string;
          status: string;
          scheduled_at: string;
          started_at?: string;
          user_email: string;
          is_instant?: boolean;
        };
      };
    };
  };
}

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string; };
  end?: { dateTime?: string; date?: string; };
  hangoutLink?: string;
  organizer?: { email?: string; };
  created?: string;
}

// STEP 1: Calendar Events Monitor
// Monitors user calendars based on email domains and detects upcoming meetings
Deno.serve(async (req: Request) => {
  try {
    // Security check for cron or manual trigger
    const userAgent = req.headers.get('user-agent');
    const isCronJob = userAgent?.includes('Supabase-Cron') || req.headers.get('x-cron-signature');
    
    if (!isCronJob && req.method !== 'POST') {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    console.log('📅 STEP 1: Starting calendar events monitoring...');

    // Get active users with monitoring enabled
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('monitoring_enabled', true)
      .not('google_calendar_token', 'is', null);

    if (usersError) throw usersError;
    if (!users?.length) {
      console.log('No active users to monitor');
      return new Response(JSON.stringify({ 
        step: 1,
        message: 'No users to monitor',
        users_monitored: 0
      }));
    }

    console.log(`👥 Monitoring ${users.length} users`);

    let eventsDetected = 0;
    let instantMeetings = 0;
    let scheduledMeetings = 0;

    // Check each user's calendar
    for (const user of users) {
      try {
        const calendarEmail = user.calendar_email || user.email;
        
        // Parse Google Calendar token
        let googleTokens;
        try {
          googleTokens = typeof user.google_calendar_token === 'string' 
            ? JSON.parse(user.google_calendar_token)
            : user.google_calendar_token;
        } catch (e) {
          console.error(`Invalid Google token for ${user.email}`);
          continue;
        }

        if (!googleTokens?.access_token) {
          console.error(`No access token for ${user.email}`);
          continue;
        }

        // Check for events in the next 2 hours
        const now = new Date();
        const timeMin = new Date(now.getTime() - 5 * 60 * 1000); // 5 min ago
        const timeMax = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours ahead

        const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarEmail)}/events?` +
          `timeMin=${timeMin.toISOString()}&` +
          `timeMax=${timeMax.toISOString()}&` +
          `singleEvents=true&` +
          `orderBy=startTime&` +
          `maxResults=20`;

        const response = await fetch(calendarUrl, {
          headers: {
            'Authorization': `Bearer ${googleTokens.access_token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          console.error(`Calendar API error for ${user.email}: ${response.status}`);
          continue;
        }

        const calendarData = await response.json();
        const events: GoogleCalendarEvent[] = calendarData.items || [];

        console.log(`📋 Found ${events.length} events for ${user.email}`);

        // Process each event
        for (const event of events) {
          if (!event.hangoutLink?.includes('meet.google.com')) continue;

          const meetingId = event.hangoutLink.split('/').pop();
          if (!meetingId) continue;

          const startTime = new Date(event.start?.dateTime || event.start?.date || '');
          const eventCreatedTime = new Date(event.created || '');
          
          // Determine if this is instant (created within last 10 minutes) or scheduled
          const isInstant = (now.getTime() - eventCreatedTime.getTime()) < (10 * 60 * 1000);
          
          // Check if we're already tracking this meeting
          const { data: existingMeeting } = await supabase
            .from('meetings')
            .select('id')
            .eq('native_meeting_id', meetingId)
            .single();

          if (existingMeeting) {
            console.log(`📝 Meeting ${meetingId} already tracked`);
            continue;
          }

          // Create new meeting record
          const { error: insertError } = await supabase
            .from('meetings')
            .insert({
              user_id: user.id,
              user_email: user.email,
              native_meeting_id: meetingId,
              meeting_url: event.hangoutLink,
              meeting_title: event.summary || 'Untitled Meeting',
              status: 'detected',
              scheduled_at: startTime.toISOString(),
              is_instant: isInstant
            });

          if (insertError) {
            console.error(`Error creating meeting record: ${insertError.message}`);
            continue;
          }

          console.log(`✅ Detected ${isInstant ? 'INSTANT' : 'SCHEDULED'} meeting: ${event.summary} (${meetingId})`);
          eventsDetected++;
          
          if (isInstant) {
            instantMeetings++;
          } else {
            scheduledMeetings++;
          }
        }

      } catch (userError) {
        console.error(`Error processing user ${user.email}:`, userError);
      }
    }

    const result = {
      step: 1,
      status: 'success',
      users_monitored: users.length,
      events_detected: eventsDetected,
      instant_meetings: instantMeetings,
      scheduled_meetings: scheduledMeetings,
      timestamp: new Date().toISOString()
    };

    console.log('📊 STEP 1 Summary:', result);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ STEP 1 Error:', error);
    return new Response(JSON.stringify({ 
      step: 1,
      error: 'Calendar events monitoring failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 