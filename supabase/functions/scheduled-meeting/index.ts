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
        };
      };
      meetings: {
        Row: {
          id: string;
          user_id: string;
          native_meeting_id: string;
          meeting_url: string;
          meeting_title: string;
          status: string;
          scheduled_at: string;
          is_instant: boolean;
          user_email: string;
        };
        Update: {
          status?: string;
          bot_joined_at?: string;
          started_at?: string;
        };
      };
    };
  };
}

// STEP 3: Scheduled Meeting Handler
// Handles scheduled meetings based on timing (join 2 minutes before start)
Deno.serve(async (req: Request) => {
  try {
    // Security check
    const userAgent = req.headers.get('user-agent');
    const isCronJob = userAgent?.includes('Supabase-Cron') || req.headers.get('x-cron-signature');
    
    if (!isCronJob && req.method !== 'POST') {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    console.log('📅 STEP 3: Starting scheduled meeting processing...');

    const now = new Date();
    
    // Find scheduled meetings that need bot joining (within 2 minutes of start time)
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select(`
        id, user_id, native_meeting_id, meeting_url, meeting_title, 
        status, scheduled_at, is_instant, user_email,
        users!meetings_user_id_fkey(id, email, vexa_api_key)
      `)
      .eq('status', 'detected')
      .eq('is_instant', false)
      .limit(10);

    if (meetingsError) throw meetingsError;
    if (!meetings?.length) {
      console.log('No scheduled meetings need processing');
      return new Response(JSON.stringify({ 
        step: 3,
        message: 'No scheduled meetings to process',
        processed: 0
      }));
    }

    console.log(`📅 Found ${meetings.length} scheduled meetings to check`);

    let botsJoined = 0;
    let tooEarly = 0;
    let failed = 0;

    for (const meeting of meetings) {
      try {
        const user = Array.isArray(meeting.users) ? meeting.users[0] : meeting.users;
        
        if (!user?.vexa_api_key) {
          console.error(`No Vexa API key for meeting ${meeting.id}`);
          await supabase
            .from('meetings')
            .update({ status: 'failed' })
            .eq('id', meeting.id);
          failed++;
          continue;
        }

        const scheduledTime = new Date(meeting.scheduled_at);
        const timeDiff = scheduledTime.getTime() - now.getTime();
        
        // Join if within 2 minutes of start time or meeting has already started (up to 5 minutes late)
        const shouldJoin = timeDiff <= 2 * 60 * 1000 && timeDiff >= -5 * 60 * 1000;
        
        if (!shouldJoin) {
          console.log(`⏰ Meeting ${meeting.id} not ready yet (${Math.round(timeDiff / 60000)} minutes until start)`);
          tooEarly++;
          continue;
        }

        console.log(`🚀 Joining SCHEDULED meeting: ${meeting.meeting_title}`);

        // Request Vexa bot to join the meeting
        const vexaResponse = await fetch('https://gateway.dev.vexa.ai/bots', {
          method: 'POST',
          headers: {
            'X-API-Key': user.vexa_api_key,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            platform: 'google_meet',
            native_meeting_id: meeting.native_meeting_id,
            bot_name: 'Veritas AI Assistant',
            language: 'en'
          })
        });

        if (vexaResponse.ok) {
          // Update meeting status to bot_joined
          await supabase
            .from('meetings')
            .update({
              status: 'bot_joined',
              bot_joined_at: new Date().toISOString(),
              started_at: new Date().toISOString()
            })
            .eq('id', meeting.id);
            
          console.log(`✅ Bot successfully joined scheduled meeting ${meeting.native_meeting_id}`);
          botsJoined++;
          
        } else {
          const errorText = await vexaResponse.text();
          console.error(`❌ Vexa API error for meeting ${meeting.id}: ${vexaResponse.status} - ${errorText}`);
          
          // Update meeting status to failed
          await supabase
            .from('meetings')
            .update({ status: 'failed' })
            .eq('id', meeting.id);
          failed++;
        }

      } catch (meetingError) {
        console.error(`Error processing meeting ${meeting.id}:`, meetingError);
        await supabase
          .from('meetings')
          .update({ status: 'failed' })
          .eq('id', meeting.id);
        failed++;
      }
    }

    const result = {
      step: 3,
      status: 'success',
      scheduled_meetings_checked: meetings.length,
      bots_joined: botsJoined,
      too_early: tooEarly,
      failed: failed,
      timestamp: new Date().toISOString()
    };

    console.log('📊 STEP 3 Summary:', result);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ STEP 3 Error:', error);
    return new Response(JSON.stringify({ 
      step: 3,
      error: 'Scheduled meeting processing failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 