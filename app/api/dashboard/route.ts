import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { redirect } from "next/navigation"

export async function GET() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = data.user.id

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
