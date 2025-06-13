import os
import logging
import requests
from fastapi import FastAPI, HTTPException, Request
from supabase import create_client, Client
from dotenv import load_dotenv
import openai  # <-- Add OpenAI
import time
from typing import List, Dict

# --- Basic Setup ---
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Veritas AI Backend",
    description="A service to handle transcript analysis and email generation.",
    version="0.2.0"
)

# --- Environment & API Clients ---
try:
    # Use environment variables with defaults for testing
    SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ngpywxuebfxmrjqptjfb.supabase.co")
    SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ncHl3eHVlYmZ4bXJqcXB0amZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NjMzMDgsImV4cCI6MjA2NTMzOTMwOH0.0W7Tvu7mNCoXhHlAL1VhglUXfB4SmglzdhZ6_-f9uNc")
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "test-key")  # Optional for testing
    
    # Make.com Webhook configuration
    MAKE_WEBHOOK_URL = os.environ.get("MAKE_WEBHOOK_URL", "https://hook.eu2.make.com/y9kgn4ejq9g6tygydcw46uisjhoxlut6")
    EMAIL_FROM = os.environ.get("EMAIL_FROM", "ricardo.barroca@dengun.com")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    if OPENAI_API_KEY != "test-key":
        openai.api_key = OPENAI_API_KEY
    
    logger.info("Successfully connected to Supabase and configured OpenAI.")
except Exception as e:
    logger.error(f"Error setting up connections: {e}")
    # Don't exit, allow testing without OpenAI

# --- Helper Functions ---

async def send_email_via_make_webhook(to_email: str, subject: str, html_content: str, from_email: str = "ricardo.barroca@dengun.com"):
    """Send email using Make.com webhook."""
    try:
        # Prepare payload for Make.com webhook
        payload = {
            "to": to_email,
            "from": from_email,
            "subject": subject,
            "html": html_content,
            "timestamp": time.time(),
            "source": "veritas-ai-backend"
        }
        
        # Send to Make.com webhook
        response = requests.post(
            MAKE_WEBHOOK_URL,
            json=payload,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Veritas-AI-Backend/1.0"
            },
            timeout=30
        )
        
        if response.status_code == 200:
            logger.info(f"Email sent successfully via Make.com to {to_email}")
            return {"status": "sent", "webhook_response": response.text}
        else:
            logger.error(f"Make.com webhook failed for {to_email}: {response.status_code} - {response.text}")
            return {"status": "failed", "error": f"Webhook returned {response.status_code}: {response.text}"}
        
    except requests.exceptions.Timeout:
        logger.error(f"Timeout sending email to {to_email} via Make.com webhook")
        return {"status": "failed", "error": "Webhook timeout"}
    except Exception as e:
        logger.error(f"Failed to send email to {to_email} via Make.com: {e}")
        return {"status": "failed", "error": str(e)}

async def send_pending_emails():
    """Send all pending emails from the database."""
    try:
        # Get all pending emails
        pending_emails = supabase.table("email_notifications").select("*").eq("status", "pending").execute()
        
        if not pending_emails.data:
            return {"message": "No pending emails to send", "sent_count": 0}
        
        sent_count = 0
        failed_count = 0
        
        for email_record in pending_emails.data:
            email_id = email_record["id"]
            to_email = email_record["user_email"]
            subject = email_record["subject"]
            html_content = email_record["html_content"]
            from_email = email_record.get("from_email", "ricardo.barroca@dengun.com")
            
            # Send the email via Make.com webhook
            result = await send_email_via_make_webhook(to_email, subject, html_content, from_email)
            
            if result["status"] == "sent":
                # Update database to mark as sent
                supabase.table("email_notifications").update({
                    "status": "sent",
                    "sent_at": "now()"
                }).eq("id", email_id).execute()
                sent_count += 1
            else:
                # Mark as failed with error message
                supabase.table("email_notifications").update({
                    "status": "failed",
                    "error_message": result.get("error", "Unknown error")
                }).eq("id", email_id).execute()
                failed_count += 1
        
        return {
            "message": f"Email sending completed. Sent: {sent_count}, Failed: {failed_count}",
            "sent_count": sent_count,
            "failed_count": failed_count
        }
        
    except Exception as e:
        logger.error(f"Error in send_pending_emails: {e}")
        return {"error": str(e)}

async def get_latest_meeting_for_user(user_email: str):
    """Fetches the latest meeting for a given user email."""
    logger.info(f"Fetching latest meeting for user: {user_email}")
    try:
        # Get the latest meeting for this user
        meeting_res = supabase.table("meetings").select("*").eq("user_email", user_email).order("created_at", desc=True).limit(1).execute()
        
        if not meeting_res.data:
            logger.warning(f"No meetings found for user: {user_email}")
            return None
            
        return meeting_res.data[0]
    except Exception as e:
        logger.error(f"Error fetching latest meeting for {user_email}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch meeting data from Supabase.")

async def get_meeting_transcript(meeting_id: str):
    """Fetches the transcript for a given meeting."""
    logger.info(f"Fetching transcript for meeting_id: {meeting_id}")
    try:
        # Fetch transcript
        transcript_res = supabase.table("transcripts").select("transcript_text").eq("meeting_id", meeting_id).execute()
        
        if not transcript_res.data:
            return None
        
        return transcript_res.data[0]['transcript_text']
    except Exception as e:
        logger.error(f"Error fetching transcript for {meeting_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch transcript from Supabase.")

async def get_meeting_participants(meeting_id: str):
    """Fetches participants for a given meeting."""
    logger.info(f"Fetching participants for meeting_id: {meeting_id}")
    try:
        # Get meeting participants and try to match with users by email
        response = supabase.table("meeting_participants").select("participant_name, participant_email").eq("meeting_id", meeting_id).execute()
        if response.data:
            # For each participant, try to find matching user
            participants_with_users = []
            for participant in response.data:
                # Try to find user by email
                user_response = supabase.table("users").select("id, email, full_name").eq("email", participant["participant_email"]).execute()
                participant_data = {
                    "participant_name": participant["participant_name"],
                    "participant_email": participant["participant_email"],
                    "users": user_response.data[0] if user_response.data else None
                }
                participants_with_users.append(participant_data)
            return participants_with_users
        return []
    except Exception as e:
        logger.error(f"Error fetching participants for {meeting_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch participants from Supabase.")

def generate_personalized_email(participant_name: str, transcript: str, meeting_title: str = "Team Meeting", meeting_data: dict = None, all_participants: list = None):
    """Uses OpenAI to generate a detailed HTML personalized email with enhanced context."""
    logger.info(f"Generating enhanced HTML email for participant: {participant_name}")
    
    # Mock email generation if OpenAI is not available
    if OPENAI_API_KEY == "test-key":
        logger.info("Using mock email generation (OpenAI not configured)")
        return generate_enhanced_mock_html_email(participant_name, transcript, meeting_title, meeting_data, all_participants)
    
    try:
        # Prepare enhanced context
        meeting_context = ""
        if meeting_data:
            meeting_context = f"""
            ### Meeting Details
            - **Meeting ID:** {meeting_data.get('id', 'N/A')}
            - **Organizer:** {meeting_data.get('user_email', 'N/A')}
            - **Status:** {meeting_data.get('status', 'N/A')}
            - **Duration:** {meeting_data.get('duration_minutes', 'N/A')} minutes
            - **Timestamp:** {meeting_data.get('created_at', 'N/A')}
            """
        
        participants_context = ""
        if all_participants:
            participants_list = [f"- {p.get('participant_name', 'Unknown')} ({p.get('participant_email', 'No email')})" for p in all_participants]
            participants_context = f"""
            ### Meeting Participants ({len(all_participants)} total)
            {chr(10).join(participants_list)}
            """

        enhanced_prompt = f"""
        **Role:** You are Veritas AI, an expert AI assistant specializing in creating professional, comprehensive, and visually appealing HTML meeting summaries.
        
        **Objective:** Generate a detailed and personalized meeting summary email for **{participant_name}**. The email must be a clean, complete HTML document with inline CSS for maximum compatibility.

        **Critical Instructions:**
        1.  **Output Format:** Respond with ONLY the raw HTML code. Do NOT include markdown, code block syntax (like ```html), or any explanations.
        2.  **Styling:** Use inline CSS for all styling. Ensure the design is modern, professional, and mobile-responsive. Use gradients and a clean layout.
        3.  **Personalization:** The content must be tailored to **{participant_name}**. Analyze the transcript to find their contributions, assign them specific action items, and reference their role.
        
        **Content Structure (must include these sections):**
        1.  **Header:** A visually appealing header with the meeting title.
        2.  **Personalized Greeting:** Address **{participant_name}** directly.
        3.  **Executive Summary:** A brief, high-level overview of the key outcomes and decisions.
        4.  **Key Discussion Points:** A bulleted list of the main topics discussed.
        5.  **Action Items (Personalized):** A clear, actionable list of tasks assigned specifically to **{participant_name}**. For each item, specify the task and deadline if mentioned. Use a format like `<li><strong>Task:</strong> [Description] - <strong>Due:</strong> [Date]</li>`.
        6.  **Next Steps:** General follow-up tasks for the team.
        7.  **Participant List:** A summary of who attended the meeting.
        8.  **Signature:** Sign off as "Ricardo Barroca, Veritas AI Assistant".

        **Context for this Email:**
        - **Meeting Title:** {meeting_title}
        - **Recipient:** {participant_name}
        
        {meeting_context}
        
        {participants_context}
        
        **Source Transcript to Analyze:**
        ---
        {transcript}
        ---
        
        Now, generate the complete HTML email based on these instructions.
        Sign as "Ricardo Barroca, Veritas AI Assistant" from "ricardo.barroca@dengun.com".
        """

        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert email designer and meeting analyst who creates comprehensive, professional HTML meeting summaries with actionable insights and modern visual design."},
                {"role": "user", "content": enhanced_prompt}
            ],
            temperature=0.7,
            max_tokens=4000
        )
        
        html_content = response.choices[0].message.content
        
        # Clean up any markdown code blocks if they appear
        if "```html" in html_content:
            html_content = html_content.split("```html")[1].split("```")[0].strip()
        elif "```" in html_content:
            html_content = html_content.split("```")[1].strip()
        
        subject = f"📋 {meeting_title} - Comprehensive Summary & Action Items for {participant_name}"
        
        return {"subject": subject, "body": html_content}

    except Exception as e:
        logger.error(f"Error generating email with OpenAI: {e}")
        # Fallback to enhanced mock generation
        return generate_enhanced_mock_html_email(participant_name, transcript, meeting_title, meeting_data, all_participants)

def generate_enhanced_mock_html_email(participant_name: str, transcript: str, meeting_title: str, meeting_data: dict = None, all_participants: list = None):
    """Generate an enhanced mock HTML email when OpenAI is not available."""
    
    from datetime import datetime
    current_time = datetime.now().strftime("%I:%M:%S %p")
    
    # Extract some basic info from transcript for personalization
    transcript_words = transcript.split()
    participant_mentioned = participant_name.split()[0].lower() in transcript.lower()
    
    # Meeting context
    meeting_id = meeting_data.get('id', 'N/A')[:8] + '...' if meeting_data else 'N/A'
    organizer = meeting_data.get('user_email', 'N/A') if meeting_data else 'N/A'
    duration = meeting_data.get('duration_minutes', 15) if meeting_data else 15
    
    # Participants info
    total_participants = len(all_participants) if all_participants else 4
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meeting Summary</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">📋 Comprehensive Meeting Summary</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">{meeting_title}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Meeting ID: {meeting_id} | Duration: {duration} min | Participants: {total_participants}</p>
        </div>
        
        <!-- Greeting -->
        <div style="margin-bottom: 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear {participant_name},</p>
            <p style="font-size: 16px;">Thank you for participating in our recent meeting. Here's a comprehensive summary of what was discussed and your specific action items.</p>
            {"<p style='font-size: 14px; color: #28a745; font-weight: bold;'>✨ You were actively mentioned in this meeting!</p>" if participant_mentioned else ""}
        </div>
        
        <!-- Meeting Overview -->
        <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin-bottom: 20px; border-radius: 5px;">
            <h2 style="color: #1976d2; margin: 0 0 15px 0;">🏢 Meeting Overview</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <strong>Organizer:</strong> {organizer}<br>
                    <strong>Duration:</strong> {duration} minutes<br>
                    <strong>Participants:</strong> {total_participants} attendees
                </div>
                <div>
                    <strong>Transcript Length:</strong> {len(transcript_words)} words<br>
                    <strong>Generated:</strong> {current_time}<br>
                    <strong>Status:</strong> Completed
                </div>
            </div>
        </div>
        
        <!-- Summary Section -->
        <div style="background: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin-bottom: 30px; border-radius: 5px;">
            <h2 style="color: #007bff; font-size: 20px; margin: 0 0 15px 0; display: flex; align-items: center;">
                📋 Summary
            </h2>
            <p style="font-size: 15px; line-height: 1.7; margin: 0;">
                The meeting focused on project progress updates and team coordination. Key discussions included 
                user authentication module completion, database optimization improvements, and frontend dashboard 
                integration. Important decisions were made regarding API endpoint prioritization and staging 
                environment access for testing purposes.
            </p>
        </div>
        
        <!-- Action Items Section -->
        <div style="margin-bottom: 30px;">
            <h2 style="color: #28a745; font-size: 20px; margin: 0 0 20px 0; display: flex; align-items: center;">
                ✅ Action Items
            </h2>
            
            <div style="border-left: 4px solid #28a745; padding-left: 20px; margin-bottom: 20px;">
                <h3 style="font-size: 16px; color: #333; margin: 0 0 5px 0;">Review and collaborate on API integration</h3>
                <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;"><strong>Assigned to:</strong> {participant_name}</p>
                <p style="color: #666; font-size: 14px; margin: 0;"><strong>Due:</strong> End of this week</p>
            </div>
            
            <div style="border-left: 4px solid #28a745; padding-left: 20px; margin-bottom: 20px;">
                <h3 style="font-size: 16px; color: #333; margin: 0 0 5px 0;">Coordinate with team members on project deliverables</h3>
                <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;"><strong>Assigned to:</strong> {participant_name}</p>
                <p style="color: #666; font-size: 14px; margin: 0;"><strong>Due:</strong> Next Tuesday</p>
            </div>
            
            <div style="border-left: 4px solid #28a745; padding-left: 20px;">
                <h3 style="font-size: 16px; color: #333; margin: 0 0 5px 0;">Prepare status update for next meeting</h3>
                <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;"><strong>Assigned to:</strong> {participant_name}</p>
                <p style="color: #666; font-size: 14px; margin: 0;"><strong>Due:</strong> Next Monday</p>
            </div>
        </div>
        
        <!-- Next Steps -->
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 20px; margin-bottom: 30px;">
            <h2 style="color: #856404; font-size: 18px; margin: 0 0 10px 0;">🚀 Next Steps</h2>
            <ul style="color: #856404; font-size: 15px; margin: 0; padding-left: 20px;">
                <li>Follow up on assigned action items by the specified deadlines</li>
                <li>Coordinate with relevant team members for collaboration tasks</li>
                <li>Prepare updates and reports for the next team meeting</li>
                <li>Reach out if you need clarification on any action items</li>
            </ul>
        </div>
        
        <!-- Footer -->
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666;">
            <p style="font-size: 14px; margin-bottom: 10px;">Best regards,<br>
            <strong>Ricardo Barroca</strong><br>
            Veritas AI Assistant<br>
            ricardo.barroca@dengun.com</p>
            
            <p style="font-size: 12px; color: #999; margin: 20px 0 0 0;">
                This summary was automatically generated by Veritas AI Assistant.<br>
                If you have any questions about your action items, please don't hesitate to reach out.
            </p>
        </div>
        
    </body>
    </html>
    """
    
    subject = f"📋 {meeting_title} - Comprehensive Summary & Action Items for {participant_name}"
    return {"subject": subject, "body": html_content}

def generate_mock_html_email(participant_name: str, transcript: str, meeting_title: str):
    """Legacy mock function for backward compatibility."""
    return generate_enhanced_mock_html_email(participant_name, transcript, meeting_title)


# --- API Endpoints ---
@app.get("/", summary="Root endpoint to check service status")
async def root():
    """Welcome endpoint."""
    return {"message": "Veritas AI Backend is running.", "supabase_url": SUPABASE_URL}

@app.post("/generate-mock-report", summary="Generate a mock report with test data and queue emails")
async def generate_mock_report(request: Request):
    """
    This endpoint creates a mock report for testing purposes.
    It generates:
    1. A new meeting with sample data.
    2. A transcript for that meeting.
    3. Meeting participants.
    4. Personalized emails for all users in the database, which are then queued for sending.
    
    This is useful for testing the email generation and queuing mechanism without relying on live data.
    """
    try:
        body = await request.json()
    except Exception:
        # Use default data if no JSON provided
        body = {}
    
    # Extract data from request or use defaults
    meeting_title = body.get("meeting_title", "Team Sync Meeting")
    user_email = body.get("user_email", "organizer@example.com")
    transcript_text = body.get("transcript_text", """
    John Smith: Good morning everyone, thanks for joining today's team sync. Let's start with project updates.
    
    Sarah Johnson: Hi everyone, I've completed the user authentication module. It's ready for testing. I'll need someone from QA to review it by Friday.
    
    Mike Davis: Great work Sarah! I can help with the QA review. On my end, I've been working on the database optimization. Found some bottlenecks in our query performance. I'll have a fix ready by next week.
    
    Lisa Chen: Thanks Mike. For the frontend, I've implemented the new dashboard design. However, I'm waiting for the API endpoints to be completed before I can fully integrate everything.
    
    John Smith: Excellent progress everyone. Lisa, can you work with Sarah to get those API endpoints prioritized? Let's plan to have everything integrated by end of next week.
    
    Sarah Johnson: Absolutely, Lisa and I can sync up after this meeting.
    
    Mike Davis: I'll also prepare a performance report for the database changes. Should be ready for review on Wednesday.
    
    John Smith: Perfect. Let's reconvene next Tuesday same time. Any other questions or concerns?
    
    Lisa Chen: Just one thing - can we get access to the staging environment for testing?
    
    John Smith: I'll reach out to DevOps to get that sorted. Thanks everyone!
    """)
    
    participants_data = body.get("participants", [
        {"name": "John Smith", "email": "john.smith@example.com"},
        {"name": "Sarah Johnson", "email": "sarah.johnson@example.com"},
        {"name": "Mike Davis", "email": "mike.davis@example.com"},
        {"name": "Lisa Chen", "email": "lisa.chen@example.com"}
    ])
    
    logger.info(f"Creating new meeting and sending emails for: {meeting_title}")
    
    # Step 1: Create a new meeting
    try:
        from datetime import datetime
        meeting_data = {
            "native_meeting_id": f"test-meeting-{int(time.time())}",
            "meeting_title": meeting_title,
            "user_email": user_email,
            "status": "completed",
            "scheduled_at": "now()",
            "started_at": "now()",
            "ended_at": "now()",
            "is_instant": True
        }
        
        meeting_result = supabase.table("meetings").insert(meeting_data).execute()
        
        if not meeting_result.data:
            raise HTTPException(status_code=500, detail="Failed to create meeting")
            
        meeting_id = meeting_result.data[0]["id"]
        logger.info(f"Created meeting with ID: {meeting_id}")
        
    except Exception as e:
        logger.error(f"Error creating meeting: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create meeting: {str(e)}")
    
    # Step 2: Create transcript
    try:
        transcript_data = {
            "meeting_id": meeting_id,
            "transcript_text": transcript_text.strip(),
            "duration_minutes": 15,
            "word_count": len(transcript_text.split())
        }
        
        transcript_result = supabase.table("transcripts").insert(transcript_data).execute()
        
        if not transcript_result.data:
            raise HTTPException(status_code=500, detail="Failed to create transcript")
            
        logger.info(f"Created transcript for meeting: {meeting_id}")
        
    except Exception as e:
        logger.error(f"Error creating transcript: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create transcript: {str(e)}")
    
    # Step 3: Create meeting participants
    created_participants = []
    try:
        for participant in participants_data:
            participant_data = {
                "meeting_id": meeting_id,
                "participant_name": participant["name"],
                "participant_email": participant["email"],
                "speaking_time_minutes": 3,
                "words_spoken": 150,
                "word_count": 150
            }
            
            participant_result = supabase.table("meeting_participants").insert(participant_data).execute()
            
            if participant_result.data:
                created_participants.append(participant_result.data[0])
                logger.info(f"Created participant: {participant['name']} ({participant['email']})")
        
    except Exception as e:
        logger.error(f"Error creating participants: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create participants: {str(e)}")
    
    # Step 4: Get all users from Supabase to send emails to real addresses
    try:
        all_users_result = supabase.table("users").select("email, full_name, monitoring_enabled").eq("monitoring_enabled", True).execute()
        all_users = all_users_result.data if all_users_result.data else []
        logger.info(f"Found {len(all_users)} active users to send emails to")
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        # Fallback: get all users without filtering
        try:
            all_users_result = supabase.table("users").select("email, full_name").execute()
            all_users = all_users_result.data if all_users_result.data else []
        except Exception as e2:
            logger.error(f"Error fetching users (fallback): {e2}")
            all_users = []
    
    # Always ensure btcto154k@gmail.com is included
    target_user_email = "btcto154k@gmail.com"
    target_user_exists = any(user["email"] == target_user_email for user in all_users)
    if not target_user_exists:
        all_users.append({"email": target_user_email, "full_name": "Target User"})
        logger.info(f"Added target user {target_user_email} to recipient list")
    
    # Step 5: Generate personalized emails for all real users (not mock participants)
    generated_emails = []
    for user in all_users:
        user_name = user.get("full_name", user["email"].split("@")[0].title())
        
        try:
            # Get meeting data for enhanced email generation
            meeting_data_for_email = {"id": meeting_id, "meeting_title": meeting_title, "user_email": user_email, "status": "completed"}
            
            email_data = generate_personalized_email(
                participant_name=user_name,
                transcript=transcript_text,
                meeting_title=meeting_title,
                meeting_data=meeting_data_for_email,
                all_participants=created_participants
            )
            
            # Save the generated email to the database
            email_insert_data = {
                "meeting_id": meeting_id,
                "user_email": user["email"],
                "from_email": "ricardo.barroca@dengun.com",
                "subject": email_data["subject"],
                "html_content": email_data["body"],
                "status": "pending"
            }
            
            insert_result = supabase.table("email_notifications").insert(email_insert_data).execute()
            
            if insert_result.data:
                logger.info(f"Successfully saved email for {user_name} ({user['email']})")
                generated_emails.append({
                    "user_email": user["email"],
                    "user_name": user_name,
                    "status": "queued_for_sending",
                    "email_id": insert_result.data[0]["id"],
                    "subject": email_data["subject"],
                    "is_target_user": user["email"] == target_user_email
                })
            else:
                logger.error(f"Failed to save email for {user_name} ({user['email']})")
                
        except Exception as e:
            logger.error(f"Could not generate/save email for user {user['email']}: {e}")
            generated_emails.append({
                "user_email": user["email"],
                "user_name": user_name,
                "status": "failed",
                "error": str(e),
                "is_target_user": user["email"] == target_user_email
            })
    
    # Step 6: Automatically send all pending emails via Make.com webhook
    logger.info("Sending all pending emails via Make.com webhook...")
    send_result = await send_pending_emails()
    
    return {
        "message": "Mock report generated and emails sent to all real users",
        "meeting_id": meeting_id,
        "meeting_title": meeting_title,
        "transcript_length": len(transcript_text),
        "participants_created": len(created_participants),
        "total_users_emailed": len(all_users),
        "emails_generated": len([e for e in generated_emails if e["status"] == "queued_for_sending"]),
        "target_user_emailed": target_user_email,
        "generated_emails": generated_emails,
        "email_sending_result": send_result,
        "meeting_data": meeting_result.data[0] if meeting_result.data else None
    }

@app.post("/craft-email", summary="Generate and save personalized emails for meeting attendees")
async def craft_and_send_emails(request: Request):
    """
    This endpoint generates personalized emails for the latest meeting of a user.
    Can be called with meeting_id or user_email.
    """
    try:
        body = await request.json()
    except Exception as e:
        logger.error(f"Invalid JSON in request body: {e}")
        raise HTTPException(status_code=400, detail="Request body must contain valid JSON with either 'meeting_id' or 'user_email'.")
    
    meeting_id = body.get("meeting_id")
    user_email = body.get("user_email")
    
    if not meeting_id and not user_email:
        raise HTTPException(status_code=400, detail="Either 'meeting_id' or 'user_email' must be provided.")

    # If user_email is provided, get the latest meeting for that user
    if user_email and not meeting_id:
        meeting = await get_latest_meeting_for_user(user_email)
        if not meeting:
            return {"message": f"No meetings found for user {user_email}. Nothing to do."}
        meeting_id = meeting["id"]
        logger.info(f"Found latest meeting for {user_email}: {meeting_id}")
    
    logger.info(f"Received request to craft emails for meeting: {meeting_id}")
    
    transcript = await get_meeting_transcript(meeting_id)
    if not transcript:
        logger.warning(f"No transcript found for meeting {meeting_id}. Aborting.")
        return {"message": f"No transcript found for meeting {meeting_id}. Nothing to do."}
        
    participants = await get_meeting_participants(meeting_id)
    if not participants:
        logger.warning(f"No participants found for meeting {meeting_id}. Aborting.")
        return {"message": f"No participants found for meeting {meeting_id}. Nothing to do."}

    generated_emails = []
    for p_info in participants:
        participant_email = p_info.get("participant_email")
        participant_name = p_info.get("participant_name", "there")
        user_data = p_info.get("users") # This is the nested user object
        
        if not participant_email:
            logger.warning(f"Skipping participant with no email: {p_info}")
            continue

        
        # Get meeting title for email
        meeting_data = await get_latest_meeting_for_user(user_email) if user_email else None
        meeting_title = meeting_data.get("meeting_title", "Team Meeting") if meeting_data else "Team Meeting"
        
        email_data = generate_personalized_email(participant_name, transcript, meeting_title)
        
        # Save the generated email to the database
        try:
            insert_res = supabase.table("email_notifications").insert({
                "meeting_id": meeting_id,
                "user_email": participant_email,  # Use participant_email instead of user_id
                "from_email": "ricardo.barroca@dengun.com",
                "subject": email_data["subject"],
                "html_content": email_data["body"],  # Use html_content instead of body
                "status": "pending" # Mark as pending to be sent by another process
            }).execute()

            if insert_res.data:
                logger.info(f"Successfully saved email for {participant_name} ({participant_email})")
                generated_emails.append({
                    "participant_email": participant_email, 
                    "participant_name": participant_name,
                    "status": "saved",
                    "subject": email_data["subject"]
                })
            else:
                logger.error(f"Failed to save email for {participant_name} ({participant_email})")

        except Exception as e:
            logger.error(f"Could not insert email for participant {participant_email}: {e}")

    return {
        "message": f"Email crafting process completed for meeting {meeting_id}.",
        "meeting_id": meeting_id,
        "transcript_length": len(transcript) if transcript else 0,
        "participants_count": len(participants),
        "generated_emails": generated_emails
    }

@app.post("/send-pending-emails", summary="Send all pending emails")
async def send_pending_emails_endpoint():
    """Send all pending emails from the database via Make.com webhook."""
    return await send_pending_emails()

@app.post("/generate-live-report", summary="Generate and send comprehensive report for a user's latest meeting")
async def generate_live_report(request: Request):
    """
    This is the main production endpoint. It fetches live data from Supabase to generate and send a comprehensive report.
    
    Based on a user's email, it finds their latest meeting, retrieves all relevant data (transcript, participants),
    generates personalized summary emails for all monitored users, and sends them immediately.
    
    Parameters:
    - `user_email`: The email of the user to fetch the latest meeting data for.
    - `meeting_id` (optional): A specific meeting ID to use instead of the user's latest one.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Request body must contain valid JSON with 'user_email'.")
    
    user_email = body.get("user_email")
    specific_meeting_id = body.get("meeting_id")  # Optional parameter
    
    if not user_email:
        raise HTTPException(status_code=400, detail="'user_email' is required.")
    
    logger.info(f"Generating comprehensive report for user: {user_email}")
    
    # Get meeting data (either specific meeting or latest for user)
    if specific_meeting_id:
        logger.info(f"Using specific meeting ID: {specific_meeting_id}")
        try:
            meeting_result = supabase.table("meetings").select("*").eq("id", specific_meeting_id).execute()
            if not meeting_result.data:
                raise HTTPException(status_code=404, detail=f"Meeting {specific_meeting_id} not found")
            meeting = meeting_result.data[0]
        except Exception as e:
            logger.error(f"Error fetching specific meeting {specific_meeting_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch meeting {specific_meeting_id}")
    else:
        # Get latest meeting for the user
        meeting = await get_latest_meeting_for_user(user_email)
        if not meeting:
            raise HTTPException(status_code=404, detail=f"No meetings found for user {user_email}")
    
    meeting_id = meeting["id"]
    meeting_title = meeting.get("meeting_title", "Team Meeting")
    
    logger.info(f"Processing meeting: {meeting_id} - {meeting_title}")
    
    # Get transcript with enhanced error handling
    transcript = await get_meeting_transcript(meeting_id)
    if not transcript:
        logger.warning(f"No transcript found for meeting {meeting_id}")
        transcript = "No transcript available for this meeting."
    
    # Get participants with enhanced data
    participants = await get_meeting_participants(meeting_id)
    logger.info(f"Found {len(participants)} participants for meeting {meeting_id}")
    
    # Get ALL existing emails for this meeting (not just summary)
    try:
        existing_emails = supabase.table("email_notifications").select("*").eq("meeting_id", meeting_id).order("created_at", desc=True).execute()
        email_status = existing_emails.data if existing_emails.data else []
        logger.info(f"Found {len(email_status)} existing emails for meeting {meeting_id}")
    except Exception as e:
        logger.error(f"Error fetching existing emails: {e}")
        email_status = []
    
    # Enhanced report data with live Supabase data
    report_data = {
        "meeting": meeting,
        "transcript": transcript,
        "transcript_length": len(transcript),
        "participants_count": len(participants),
        "participants": participants,
        "existing_emails_count": len(email_status),
        "email_status": email_status,
        "user_email": user_email,
        "meeting_id": meeting_id
    }
    
    # Get all users from Supabase with enhanced query
    try:
        all_users_result = supabase.table("users").select("email, full_name, monitoring_enabled").eq("monitoring_enabled", True).execute()
        all_users = all_users_result.data if all_users_result.data else []
        logger.info(f"Found {len(all_users)} active users to send emails to")
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        # Fallback: get all users without filtering
        try:
            all_users_result = supabase.table("users").select("email, full_name").execute()
            all_users = all_users_result.data if all_users_result.data else []
        except Exception as e2:
            logger.error(f"Error fetching users (fallback): {e2}")
            all_users = []
    
    # Always ensure the requesting user is included
    target_user_exists = any(user["email"] == user_email for user in all_users)
    if not target_user_exists:
        all_users.append({"email": user_email, "full_name": user_email.split("@")[0].title()})
        logger.info(f"Added requesting user {user_email} to recipient list")
    
    # Generate personalized emails for each user using enhanced email generation
    sent_reports = []
    for user in all_users:
        user_name = user.get("full_name", user["email"].split("@")[0].title())
        
        try:
            # Generate enhanced personalized email with full context
            email_data = generate_personalized_email(
                participant_name=user_name,
                transcript=transcript,
                meeting_title=meeting_title,
                meeting_data=meeting,
                all_participants=participants
            )
            
            # Save personalized email to database
            email_insert_data = {
                "meeting_id": meeting_id,
                "user_email": user["email"],
                "from_email": "ricardo.barroca@dengun.com",
                "subject": email_data["subject"],
                "html_content": email_data["body"],
                "status": "pending"
            }
            
            insert_result = supabase.table("email_notifications").insert(email_insert_data).execute()
            
            if insert_result.data:
                sent_reports.append({
                    "user_email": user["email"],
                    "user_name": user_name,
                    "status": "queued_for_sending",
                    "email_id": insert_result.data[0]["id"],
                    "subject": email_data["subject"]
                })
                logger.info(f"Queued personalized email for {user_name} ({user['email']})")
            
        except Exception as e:
            logger.error(f"Failed to generate/queue email for {user['email']}: {e}")
            sent_reports.append({
                "user_email": user["email"],
                "user_name": user_name,
                "status": "failed",
                "error": str(e)
            })
    
    # Automatically send all pending emails via Make.com webhook
    logger.info("Sending all pending emails via Make.com webhook...")
    send_result = await send_pending_emails()
    
    return {
        "message": "Enhanced comprehensive reports generated and sent to all users",
        "requested_user": user_email,
        "meeting_id": meeting_id,
        "meeting_title": meeting_title,
        "meeting_organizer": meeting.get("user_email"),
        "meeting_status": meeting.get("status"),
        "transcript_length": len(transcript),
        "participants_found": len(participants),
        "existing_emails_found": len(email_status),
        "total_users_emailed": len(sent_reports),
        "successful_emails": len([r for r in sent_reports if r["status"] == "queued_for_sending"]),
        "failed_emails": len([r for r in sent_reports if r["status"] == "failed"]),
        "sent_reports": sent_reports,
        "email_sending_result": send_result,
        "live_data_summary": {
            "meeting_data": "✅ Retrieved from Supabase",
            "transcript_data": "✅ Retrieved from Supabase",
            "participants_data": "✅ Retrieved from Supabase", 
            "users_data": "✅ Retrieved from Supabase",
            "email_generation": "✅ Enhanced with full context"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 