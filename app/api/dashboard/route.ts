import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface CalendarEvent {
  start?: { dateTime: string }
  end?: { dateTime: string }
  summary?: string
}

interface CalendarData {
  items?: CalendarEvent[]
}

export async function GET(request: Request) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get Google Calendar events from our internal API
    const calendarResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/calendar/events`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    })

    let upcomingMeetings: CalendarEvent[] = []
    let pastMeetings: CalendarEvent[] = []

    if (calendarResponse.ok) {
      const calendarData: CalendarData = await calendarResponse.json()
      const now = new Date()

      // Separate upcoming and past meetings
      upcomingMeetings =
        calendarData.items?.filter((event: CalendarEvent) => event.start?.dateTime && new Date(event.start.dateTime) > now).slice(0, 10) || []

      pastMeetings =
        calendarData.items?.filter((event: CalendarEvent) => event.start?.dateTime && new Date(event.start.dateTime) <= now).slice(0, 10) || []
    }

    // Calculate stats
    const stats = {
      meetingsThisWeek: upcomingMeetings.length,
      actionItemsAssigned: 24,
      avgSentiment: "Positive",
      totalMeetingHours: pastMeetings.reduce((total: number, meeting: CalendarEvent) => {
        const start = new Date(meeting.start!.dateTime!)
        const end = new Date(meeting.end!.dateTime!)
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
