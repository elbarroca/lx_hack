import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface Database {
  public: {
    Tables: {
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
        };
      };
      transcripts: {
        Row: {
          id: string;
          meeting_id: string;
          user_id: string;
          transcript_text: string;
          transcript_data: Record<string, unknown>;
          processed_at: string;
          word_count: number | null;
          duration_seconds: number | null;
        };
      };
      meeting_participants: {
        Insert: {
          meeting_id: string;
          participant_name: string;
          participant_email?: string;
          speaking_time_seconds?: number;
          word_count?: number;
          join_time?: string;
          leave_time?: string;
          transcript_segments?: Record<string, unknown>;
        };
        Row: {
          id: string;
          meeting_id: string;
          participant_name: string;
          participant_email: string | null;
          speaking_time_seconds: number | null;
          word_count: number | null;
          join_time: string | null;
          leave_time: string | null;
          transcript_segments: Record<string, unknown> | null;
        };
      };
    };
  };
}

// Interface removed as it's not used in the implementation

// STEP 5: Match Transcripts
// Matches meeting participants with their transcript segments and stores participant data
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

    console.log('👥 STEP 5: Starting participant matching with transcripts...');

    // Get transcribed meetings that haven't been participant-matched yet
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('transcripts')
      .select(`
        *,
        meetings!inner(*),
        meeting_participants(id)
      `)
      .eq('meetings.status', 'transcribed')
      .is('meeting_participants.id', null);

    if (transcriptsError) throw transcriptsError;
    
    if (!transcripts?.length) {
      console.log('No transcripts ready for participant matching');
      return new Response(JSON.stringify({ 
        step: 5,
        message: 'No transcripts ready for participant matching',
        transcripts_processed: 0
      }));
    }

    console.log(`📋 Found ${transcripts.length} transcripts ready for participant matching`);

    let transcriptsProcessed = 0;
    let participantsMatched = 0;
    let errors = 0;

    // Process each transcript
    for (const transcript of transcripts) {
      try {
        const meeting = transcript.meetings;
        console.log(`🔍 Processing participants for meeting: ${meeting.meeting_title}`);

        // Parse transcript data to extract participant information
        const transcriptData = transcript.transcript_data as any;
        const participants = transcriptData.participants || [];
        const segments = transcriptData.segments || [];

        if (!participants.length) {
          console.log(`📭 No participants data found for meeting ${meeting.id}`);
          
          // Update meeting status to indicate participants are matched (even if empty)
          await supabase
            .from('meetings')
            .update({ status: 'participants_matched' })
            .eq('id', meeting.id);
            
          transcriptsProcessed++;
          continue;
        }

        console.log(`👥 Found ${participants.length} participants`);

        // Group segments by speaker
        const speakerSegments: Record<string, Array<any>> = {};
        const speakerWordCounts: Record<string, number> = {};

        segments.forEach((segment: any) => {
          const speaker = segment.speaker || 'Unknown';
          if (!speakerSegments[speaker]) {
            speakerSegments[speaker] = [];
            speakerWordCounts[speaker] = 0;
          }
          speakerSegments[speaker].push(segment);
          speakerWordCounts[speaker] += (segment.text || '').split(' ').length;
        });

        // Match participants with their segments and create participant records
        for (const participant of participants) {
          try {
            const participantName = participant.name || 'Unknown Participant';
            const participantEmail = participant.email || null;
            const speakingTime = participant.speaking_time || 0;

            // Find segments for this participant (match by name)
            const participantSegments = speakerSegments[participantName] || [];
            const participantWordCount = speakerWordCounts[participantName] || 0;

            // Create participant record
            const { error: participantError } = await supabase
              .from('meeting_participants')
              .insert({
                meeting_id: meeting.id,
                participant_name: participantName,
                participant_email: participantEmail,
                speaking_time_seconds: Math.round(speakingTime),
                word_count: participantWordCount,
                transcript_segments: {
                  segments: participantSegments,
                  total_segments: participantSegments.length
                }
              });

            if (participantError) {
              console.error(`Error creating participant record for ${participantName}:`, participantError);
              errors++;
              continue;
            }

            participantsMatched++;
            console.log(`✅ Matched participant: ${participantName} (${participantWordCount} words, ${Math.round(speakingTime / 60)} min)`);

          } catch (participantError) {
            console.error(`Error processing participant ${participant.name}:`, participantError);
            errors++;
          }
        }

        // Update meeting status to indicate participants are matched
        const { error: updateError } = await supabase
          .from('meetings')
          .update({ status: 'participants_matched' })
          .eq('id', meeting.id);

        if (updateError) {
          console.error(`Error updating meeting status for ${meeting.id}:`, updateError);
          errors++;
          continue;
        }

        transcriptsProcessed++;
        console.log(`💾 Completed participant matching for meeting: ${meeting.meeting_title}`);

        // Brief delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (transcriptError) {
        console.error(`Error processing transcript ${transcript.id}:`, transcriptError);
        errors++;
      }
    }

    const result = {
      step: 5,
      status: 'success',
      transcripts_processed: transcriptsProcessed,
      participants_matched: participantsMatched,
      errors: errors,
      timestamp: new Date().toISOString()
    };

    console.log('📊 STEP 5 Summary:', result);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ STEP 5 Error:', error);
    return new Response(JSON.stringify({ 
      step: 5,
      error: 'Participant matching failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 