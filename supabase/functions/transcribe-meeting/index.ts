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
        Row: {
          id: string;
          user_id: string;
          native_meeting_id: string;
          meeting_url: string;
          meeting_title: string;
          status: string;
          scheduled_at: string;
          started_at: string | null;
          ended_at: string | null;
          user_email: string;
          is_instant: boolean | null;
        };
        Update: {
          status?: string;
          ended_at?: string;
        };
      };
      transcripts: {
        Insert: {
          meeting_id: string;
          user_id: string;
          transcript_text: string;
          transcript_data: Record<string, unknown>;
          processed_at?: string;
          word_count?: number;
          duration_seconds?: number;
        };
      };
    };
  };
}

interface VEXTranscriptResponse {
  transcript: string;
  meeting_id: string;
  participants: Array<{
    name: string;
    email?: string;
    speaking_time: number;
  }>;
  duration: number;
  word_count: number;
  segments?: Array<{
    speaker: string;
    text: string;
    start_time: number;
    end_time: number;
  }>;
}

// STEP 4: Transcribe Meeting
// Retrieves transcripts from VEX AI for completed meetings and stores them in Supabase
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

    console.log('📝 STEP 4: Starting transcript retrieval and storage...');

    // Get meetings that have ended but don't have transcripts yet
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select(`
        *,
        users!inner(vexa_api_key),
        transcripts(id)
      `)
      .eq('status', 'bot_joined')
      .is('transcripts.id', null)
      .not('ended_at', 'is', null);

    if (meetingsError) throw meetingsError;
    
    if (!meetings?.length) {
      console.log('No meetings ready for transcription');
      return new Response(JSON.stringify({ 
        step: 4,
        message: 'No meetings ready for transcription',
        meetings_processed: 0
      }));
    }

    console.log(`📋 Found ${meetings.length} meetings ready for transcription`);

    let transcriptsRetrieved = 0;
    let transcriptsStored = 0;
    let errors = 0;

    // Process each meeting
    for (const meeting of meetings) {
      try {
        const user = meeting.users;
        const vexaApiKey = user.vexa_api_key;

        if (!vexaApiKey) {
          console.error(`No VEX API key for meeting ${meeting.id}`);
          errors++;
          continue;
        }

        console.log(`🔍 Retrieving transcript for meeting: ${meeting.meeting_title} (${meeting.native_meeting_id})`);

        // Call VEX AI API to get transcript
        const vexaResponse = await fetch(`https://api.vex.ai/v1/transcripts/${meeting.native_meeting_id}`, {
          headers: {
            'Authorization': `Bearer ${vexaApiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!vexaResponse.ok) {
          if (vexaResponse.status === 404) {
            console.log(`📭 Transcript not ready yet for meeting ${meeting.native_meeting_id}`);
            continue;
          }
          throw new Error(`VEX API error: ${vexaResponse.status} - ${await vexaResponse.text()}`);
        }

        const transcriptData: VEXTranscriptResponse = await vexaResponse.json();
        transcriptsRetrieved++;

        console.log(`✅ Retrieved transcript: ${transcriptData.word_count} words, ${Math.round(transcriptData.duration / 60)} minutes`);

        // Store transcript in Supabase
        const { error: transcriptError } = await supabase
          .from('transcripts')
          .insert({
            meeting_id: meeting.id,
            user_id: meeting.user_id,
            transcript_text: transcriptData.transcript,
            transcript_data: transcriptData,
            processed_at: new Date().toISOString(),
            word_count: transcriptData.word_count,
            duration_seconds: Math.round(transcriptData.duration)
          });

        if (transcriptError) {
          console.error(`Error storing transcript for meeting ${meeting.id}:`, transcriptError);
          errors++;
          continue;
        }

        // Update meeting status to indicate transcript is available
        const { error: updateError } = await supabase
          .from('meetings')
          .update({ 
            status: 'transcribed',
            ended_at: meeting.ended_at || new Date().toISOString()
          })
          .eq('id', meeting.id);

        if (updateError) {
          console.error(`Error updating meeting status for ${meeting.id}:`, updateError);
          errors++;
          continue;
        }

        transcriptsStored++;
        console.log(`💾 Stored transcript for meeting: ${meeting.meeting_title}`);

        // Brief delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (meetingError) {
        console.error(`Error processing meeting ${meeting.id}:`, meetingError);
        errors++;
      }
    }

    const result = {
      step: 4,
      status: 'success',
      meetings_checked: meetings.length,
      transcripts_retrieved: transcriptsRetrieved,
      transcripts_stored: transcriptsStored,
      errors: errors,
      timestamp: new Date().toISOString()
    };

    console.log('📊 STEP 4 Summary:', result);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ STEP 4 Error:', error);
    return new Response(JSON.stringify({ 
      step: 4,
      error: 'Transcript retrieval and storage failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 