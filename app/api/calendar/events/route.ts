import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's Google access token from the session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.provider_token) {
      return NextResponse.json({ error: "No Google access token found" }, { status: 401 })
    }

    // Fetch calendar events from Google Calendar API
    const now = new Date()
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${now.toISOString()}&` +
      `timeMax=${oneMonthFromNow.toISOString()}&` +
      `singleEvents=true&` +
      `orderBy=startTime&` +
      `maxResults=50`,
      {
        headers: {
          'Authorization': `Bearer ${session.provider_token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text()
      console.error('Google Calendar API error:', errorText)
      return NextResponse.json({ 
        error: "Failed to fetch calendar events",
        details: errorText 
      }, { status: calendarResponse.status })
    }

    const calendarData = await calendarResponse.json()
    
    // Also fetch past events for the last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const pastEventsResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${thirtyDaysAgo.toISOString()}&` +
      `timeMax=${now.toISOString()}&` +
      `singleEvents=true&` +
      `orderBy=startTime&` +
      `maxResults=50`,
      {
        headers: {
          'Authorization': `Bearer ${session.provider_token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    let pastEvents = []
    if (pastEventsResponse.ok) {
      const pastEventsData = await pastEventsResponse.json()
      pastEvents = pastEventsData.items || []
    }

    // Combine and return all events
    const allEvents = [
      ...(pastEvents || []),
      ...(calendarData.items || [])
    ]

    return NextResponse.json({
      kind: calendarData.kind,
      etag: calendarData.etag,
      summary: calendarData.summary,
      timeZone: calendarData.timeZone,
      items: allEvents
    })

  } catch (error) {
    console.error("Calendar API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
