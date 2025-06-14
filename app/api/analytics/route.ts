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
    // Mock analytics data - in a real app, this would query your database
    const analyticsData = {
      overview: {
        totalMeetings: 127,
        totalHours: 94.5,
        avgMeetingDuration: 45,
        totalParticipants: 342,
        avgSentiment: 7.2,
        completionRate: 78,
      },
      trends: {
        weeklyMeetings: [12, 15, 18, 14, 22, 19, 16, 20],
        weeklyHours: [8.5, 11.2, 13.6, 9.8, 16.4, 14.1, 12.0, 15.2],
        sentimentTrend: [6.8, 7.1, 7.0, 6.9, 7.3, 7.2, 7.4, 7.2],
        actionItemsTrend: [23, 28, 31, 25, 35, 32, 28, 30],
      },
      insights: {
        mostProductiveDay: "Tuesday",
        avgMeetingSize: 4.2,
        topMeetingTopics: [
          "Project Planning",
          "Status Updates",
          "Sprint Review",
          "Team Sync",
          "Client Feedback",
        ],
        sentimentBreakdown: {
          positive: 68,
          neutral: 25,
          negative: 7,
        },
      },
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
} 