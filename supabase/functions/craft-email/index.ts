import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { OpenAI } from "https://deno.land/x/openai/mod.ts";
const llmSystemPrompt = `
You are an expert AI assistant that creates personalized meeting summaries.
Your task is to analyze a meeting transcript and create personalized summaries for each participant.

For each participant, you should:
1. Create a brief personal summary highlighting their contributions
2. Identify action items that are relevant to them
3. Note key highlights or decisions that affect them
4. Acknowledge their speaking contribution

Return a valid JSON object with this structure:
{
  "general_summary": "Overall meeting summary (2-3 sentences)",
  "action_items": [
    {
      "task": "A specific task",
      "assignee": "Person responsible",
      "due_date": "When it's due"
    }
  ],
  "personalized_summaries": [
    {
      "participant_name": "Name of participant",
      "personal_summary": "How this meeting was relevant to them (2-3 sentences)",
      "relevant_action_items": ["Task 1", "Task 2"],
      "personal_highlights": ["Key point 1", "Key point 2"],
      "speaking_contribution": "Brief note about their participation"
    }
  ]
}
`;
// Function to create personalized email HTML
function createPersonalizedEmailHTML(meetingTitle, generalSummary, personalSummary, actionItems) {
  const relevantActionItems = actionItems.filter((item)=>personalSummary.relevant_action_items.some((task)=>item.task.toLowerCase().includes(task.toLowerCase()) || task.toLowerCase().includes(item.task.toLowerCase())) || item.assignee.toLowerCase().includes(personalSummary.participant_name.toLowerCase()));
  const actionItemsHtml = relevantActionItems.map((item)=>`
    <div style="background-color: #f9f9f9; border-left: 4px solid #4F46E5; margin-bottom: 12px; padding: 15px; border-radius: 4px;">
      <div style="color: #333; font-size: 16px; font-weight: bold; margin-bottom: 5px;">${item.task}</div>
      <div style="font-size: 14px; color: #777;">
        <span style="margin-right: 15px;"><strong>Assigned to:</strong> ${item.assignee}</span>
        <span><strong>Due:</strong> ${item.due_date}</span>
      </div>
    </div>
  `).join('');
  const highlightsHtml = personalSummary.personal_highlights.map((highlight)=>`
    <li style="margin-bottom: 8px; color: #555;">${highlight}</li>
  `).join('');
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <title>Personal Meeting Summary</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">📋 Personal Meeting Summary</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">${meetingTitle}</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.8;">Hi ${personalSummary.participant_name}!</p>
      </div>
      
      <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #4F46E5; margin-top: 0; font-size: 22px;">📝 Your Personal Summary</h2>
          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 15px 0;">${personalSummary.personal_summary}</p>
          <div style="background-color: #f8f9ff; padding: 15px; border-radius: 6px; border-left: 4px solid #4F46E5;">
            <p style="margin: 0; font-size: 14px; color: #666;"><strong>Your Contribution:</strong> ${personalSummary.speaking_contribution}</p>
          </div>
      </div>

      ${personalSummary.personal_highlights.length > 0 ? `
      <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #4F46E5; margin-top: 0; font-size: 22px;">✨ Key Highlights for You</h2>
          <ul style="margin: 0; padding-left: 20px;">
            ${highlightsHtml}
          </ul>
      </div>` : ''}
      
      <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #4F46E5; margin-top: 0; font-size: 22px;">📝 General Meeting Summary</h2>
          <p style="font-size: 16px; line-height: 1.7; margin: 0;">${generalSummary}</p>
      </div>

      ${relevantActionItems.length > 0 ? `
      <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #4F46E5; margin-top: 0; font-size: 22px;">✅ Your Action Items</h2>
          ${actionItemsHtml}
      </div>` : `
      <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #4F46E5; margin-top: 0; font-size: 22px;">✅ Action Items</h2>
          <p style="color: #666; font-style: italic;">No specific action items assigned to you from this meeting.</p>
      </div>`}
      
      <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="margin: 0; color: #64748b; font-size: 14px;">
              This personalized summary was generated by Veritas AI Assistant.<br>
              Generated on ${new Date().toLocaleString()}
          </p>
      </div>
  </body>
  </html>`;
}
Deno.serve(async (req)=>{
  try {
    // Security check for cron job
    const userAgent = req.headers.get("user-agent");
    const isCronJob = userAgent?.includes("Supabase-Cron") || req.headers.get("x-cron-signature");
    if (!isCronJob && req.method !== 'POST') {
      return new Response("Unauthorized", {
        status: 401
      });
    }
    // Initialize clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const openai = new OpenAI({
      apiKey: openaiApiKey
    });
    console.log("🚀 Starting personalized email generation...");
    // Find meetings with transcripts that need personalized summaries
    const { data: meetings, error: meetingsError } = await supabase.from("meetings").select(`
        id, meeting_title, user_email,
        transcripts!inner(id, transcript_text),
        meeting_participants(participant_name, participant_email, speaking_time_minutes, words_spoken)
      `).eq("status", "transcript_ready").limit(3); // Process in small batches
    if (meetingsError) throw meetingsError;
    if (!meetings || meetings.length === 0) {
      console.log("No meetings ready for personalized email generation.");
      return new Response(JSON.stringify({
        message: "No meetings to process"
      }));
    }
    console.log(`Found ${meetings.length} meetings to generate personalized emails for.`);
    let processedCount = 0;
    let emailsGenerated = 0;
    for (const meeting of meetings){
      try {
        const transcript = Array.isArray(meeting.transcripts) ? meeting.transcripts[0] : meeting.transcripts;
        const participants = meeting.meeting_participants || [];
        if (!transcript?.transcript_text || participants.length === 0) {
          console.log(`Skipping meeting ${meeting.id}: Missing transcript or participants`);
          continue;
        }
        console.log(`🧠 Processing personalized summaries for meeting: ${meeting.meeting_title}`);
        console.log(`👥 Found ${participants.length} participants`);
        // Create participant list for LLM context
        const participantContext = participants.map((p)=>`${p.participant_name} (spoke for ${p.speaking_time_minutes} minutes, ${p.words_spoken} words)`).join(', ');
        // Call OpenAI to generate personalized summaries
        const chatCompletion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: llmSystemPrompt
            },
            {
              role: "user",
              content: `Meeting: ${meeting.meeting_title || 'Untitled Meeting'}\n\nParticipants: ${participantContext}\n\nTranscript:\n${transcript.transcript_text}`
            }
          ],
          model: "gpt-4o-mini",
          response_format: {
            type: "json_object"
          },
          temperature: 0.3
        });
        const llmResultText = chatCompletion.choices[0].message.content;
        if (!llmResultText) throw new Error("LLM returned empty response");
        const llmResult = JSON.parse(llmResultText);
        // Save general summary
        const { data: summaryRecord, error: summaryError } = await supabase.from("meeting_summaries").insert({
          meeting_id: meeting.id,
          summary: llmResult.general_summary,
          action_items: llmResult.action_items,
          raw_response: llmResult
        }).select("id").single();
        if (summaryError) throw summaryError;
        console.log(`✅ Saved general summary ${summaryRecord.id}`);
        // Generate personalized emails for each participant
        for (const participant of participants){
          try {
            // Find the personalized summary for this participant
            const personalSummary = llmResult.personalized_summaries?.find((ps)=>ps.participant_name.toLowerCase().includes(participant.participant_name.toLowerCase()) || participant.participant_name.toLowerCase().includes(ps.participant_name.toLowerCase()));
            if (!personalSummary) {
              console.log(`No personalized summary found for ${participant.participant_name}`);
              continue;
            }
            // Use participant email if available, otherwise skip
            const emailAddress = participant.participant_email;
            if (!emailAddress) {
              console.log(`No email address for participant ${participant.participant_name}`);
              continue;
            }
            // Generate personalized email HTML
            const emailHTML = createPersonalizedEmailHTML(meeting.meeting_title || 'Untitled Meeting', llmResult.general_summary, personalSummary, llmResult.action_items);
            const emailSubject = `📋 Your Personal Summary: ${meeting.meeting_title || 'Meeting'}`;
            // Queue personalized email
            await supabase.from("email_notifications").insert({
              user_email: emailAddress,
              meeting_id: meeting.id,
              subject: emailSubject,
              html_content: emailHTML,
              status: "pending",
              created_at: new Date().toISOString()
            });
            console.log(`📧 Queued personalized email for ${participant.participant_name} (${emailAddress})`);
            emailsGenerated++;
          } catch (error) {
            console.error(`Error generating email for participant ${participant.participant_name}:`, error);
          }
        }
        // Update meeting status
        await supabase.from("meetings").update({
          status: "completed"
        }).eq("id", meeting.id);
        processedCount++;
      } catch (error) {
        console.error(`❌ Failed to process meeting ${meeting.id}:`, error);
        // Update meeting status to failed
        await supabase.from("meetings").update({
          status: "failed_processing"
        }).eq("id", meeting.id);
      }
    }
    const result = {
      status: "success",
      meetings_processed: processedCount,
      personalized_emails_generated: emailsGenerated,
      timestamp: new Date().toISOString()
    };
    console.log("📊 Personalized email generation summary:", result);
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("🚨 Error in personalized email generation:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({
      error: "Personalized email generation failed",
      message: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});
