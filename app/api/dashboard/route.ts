import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = userData.user.id

  try {
    // Get Google Calendar events
    const calendarResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/calendar/events`, {
      headers: {
        Authorization: `Bearer ${userData.user.access_token}`,
      },
    })

    let upcomingMeetings = []
    let pastMeetings = []

    if (calendarResponse.ok) {
      const calendarData = await calendarResponse.json()
      const now = new Date()

      // Separate upcoming and past meetings
      upcomingMeetings =
        calendarData.items?.filter((event: any) => new Date(event.start.dateTime) > now).slice(0, 10) || []

      pastMeetings =
        calendarData.items?.filter((event: any) => new Date(event.start.dateTime) <= now).slice(0, 10) || []
    }

    // Calculate stats
    const stats = {
      meetingsThisWeek: upcomingMeetings.length,
      actionItemsAssigned: 24,
      avgSentiment: "Positive",
      totalMeetingHours: pastMeetings.reduce((total: number, meeting: any) => {
        const start = new Date(meeting.start.dateTime)
        const end = new Date(meeting.end.dateTime)
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return total + duration
      }, 0),
    }

    return NextResponse.json({
      stats,
      upcomingMeetings,
      pastMeetings,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
