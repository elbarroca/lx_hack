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
    // Get the user's Google access token from the session
    const { data: session } = await supabase.auth.getSession()

    if (!session?.session?.provider_token) {
      return NextResponse.json({ error: "No Google access token found" }, { status: 401 })
    }

    const accessToken = session.session.provider_token

    // Calculate time range (past 30 days to next 30 days)
    const now = new Date()
    const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const timeMin = pastDate.toISOString()
    const timeMax = futureDate.toISOString()

    // Fetch events from Google Calendar API
    const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`

    const response = await fetch(calendarUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Google Calendar API error:", errorData)
      return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: response.status })
    }

    const calendarData = await response.json()

    return NextResponse.json(calendarData)
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
