import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // In a real app, these would be actual database queries
    // For now, we'll return mock data

    // Get stats
    const stats = {
      meetingsThisWeek: 8,
      actionItemsAssigned: 24,
      avgSentiment: "Positive",
      totalMeetingHours: 12,
    }

    // Get upcoming meetings
    const upcomingMeetings = [
      {
        id: "1",
        title: "Weekly Team Sync",
        scheduledAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        isArmed: true,
      },
      {
        id: "2",
        title: "Product Planning",
        scheduledAt: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        isArmed: true,
      },
      {
        id: "3",
        title: "Client Presentation",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
        isArmed: false,
      },
    ]

    // Get recent meetings
    const recentMeetings = [
      {
        id: "101",
        title: "Q2 Strategy Review",
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        participantCount: 8,
        sentiment: "Positive",
        actionItemCount: 6,
      },
      {
        id: "102",
        title: "Engineering Standup",
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        participantCount: 5,
        sentiment: "Neutral",
        actionItemCount: 3,
      },
      {
        id: "103",
        title: "Marketing Campaign Kickoff",
        date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        participantCount: 4,
        sentiment: "Positive",
        actionItemCount: 8,
      },
      {
        id: "104",
        title: "Customer Feedback Session",
        date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        participantCount: 6,
        sentiment: "Neutral",
        actionItemCount: 5,
      },
    ]

    return NextResponse.json({
      stats,
      upcomingMeetings,
      recentMeetings,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message } = await req.json()
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // 1. Fetch recent meetings and their transcripts for context
    const { data: meetings, error: meetingsError } = await supabase
      .from("meetings")
      .select(`
        id,
        meeting_title,
        transcripts ( transcript_text )
      `)
      .eq("user_id", userData.user.id)
      .order("started_at", { ascending: false })
      .limit(5)

    if (meetingsError) {
      console.error("Error fetching meetings:", meetingsError)
      return NextResponse.json({ error: "Failed to fetch meeting data" }, { status: 500 })
    }

    // 2. Format the data for the LLM prompt
    const context = meetings
      ?.map(
        (meeting) =>
          `Meeting Title: ${meeting.meeting_title}\nTranscript:\n${meeting.transcripts[0]?.transcript_text}\n\n---\n\n`
      )
      .join("")

    const prompt = `
You are an intelligent meeting assistant called Vexa. Your goal is to answer questions about a user's past meetings based on the transcripts provided.
Be concise and helpful. If you don't have enough information to answer the question, say so.
Do not make up information. Base your answers strictly on the provided context.

Here is the context from the user's recent meetings:
---
${context}
---

Question: "${message}"

Answer:
`

    // 3. Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.2,
    })

    const reply = completion.choices[0].message?.content?.trim()

    if (!reply) {
      return NextResponse.json({ error: "Failed to get a response from the assistant." }, { status: 500 })
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Error in chat handler:", error)
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 })
  }
}
