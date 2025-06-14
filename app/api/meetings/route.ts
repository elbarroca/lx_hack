import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Mock meetings data - in a real app, this would query your database
    const meetings = [
      {
        id: "1",
        title: "Weekly Team Standup",
        date: "2024-01-15T10:00:00Z",
        duration: 30,
        participantCount: 6,
        status: "completed",
        sentiment: {
          overall: "Positive",
          score: 8.2,
        },
        actionItemsCount: 4,
        hasTranscript: true,
      },
      {
        id: "2",
        title: "Product Roadmap Review",
        date: "2024-01-14T14:30:00Z",
        duration: 60,
        participantCount: 8,
        status: "completed",
        sentiment: {
          overall: "Neutral",
          score: 6.5,
        },
        actionItemsCount: 7,
        hasTranscript: true,
      },
      {
        id: "3",
        title: "Client Feedback Session",
        date: "2024-01-16T16:00:00Z",
        duration: 45,
        participantCount: 4,
        status: "scheduled",
        sentiment: {
          overall: "Positive",
          score: 0,
        },
        actionItemsCount: 0,
        hasTranscript: false,
      },
      {
        id: "4",
        title: "Sprint Planning",
        date: "2024-01-12T09:00:00Z",
        duration: 90,
        participantCount: 12,
        status: "completed",
        sentiment: {
          overall: "Positive",
          score: 7.8,
        },
        actionItemsCount: 12,
        hasTranscript: true,
      },
      {
        id: "5",
        title: "Bug Triage Meeting",
        date: "2024-01-11T11:00:00Z",
        duration: 40,
        participantCount: 5,
        status: "completed",
        sentiment: {
          overall: "Negative",
          score: 4.2,
        },
        actionItemsCount: 8,
        hasTranscript: true,
      },
      {
        id: "6",
        title: "All Hands Meeting",
        date: "2024-01-17T15:00:00Z",
        duration: 30,
        participantCount: 35,
        status: "scheduled",
        sentiment: {
          overall: "Neutral",
          score: 0,
        },
        actionItemsCount: 0,
        hasTranscript: false,
      },
    ]

    return NextResponse.json(meetings)
  } catch (error) {
    console.error("Error fetching meetings data:", error)
    return NextResponse.json({ error: "Failed to fetch meetings data" }, { status: 500 })
  }
} 