import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  console.log("📅 [CALENDAR-EVENTS] Starting calendar events API call")
  
  try {
    const supabase = await createClient()
    console.log("📅 [CALENDAR-EVENTS] Supabase client created")

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log("📅 [CALENDAR-EVENTS] Auth check result:", { 
      hasUser: !!user, 
      userId: user?.id, 
      authError: authError?.message 
    })
    
    if (authError || !user) {
      console.log("📅 [CALENDAR-EVENTS] ❌ Authentication failed")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's session to access provider tokens
    const { data: { session } } = await supabase.auth.getSession()
    console.log("📅 [CALENDAR-EVENTS] Session check:", { 
      hasSession: !!session,
      hasProviderToken: !!session?.provider_token,
      hasProviderRefreshToken: !!session?.provider_refresh_token,
      sessionKeys: session ? Object.keys(session) : [],
      tokenPreview: session?.provider_token ? `${session.provider_token.substring(0, 20)}...` : null
    })
    
    // Try to get access token from different sources
    let accessToken = session?.provider_token
    
    if (!accessToken) {
      console.log("📅 [CALENDAR-EVENTS] No provider_token, checking user identities and database...")
      
      // Check if token is stored in user metadata or identities
      const userIdentities = user?.identities
      console.log("📅 [CALENDAR-EVENTS] User identities:", {
        hasIdentities: !!userIdentities,
        identityCount: userIdentities?.length || 0,
        identityProviders: userIdentities?.map(id => id.provider) || []
      })
      
      // Look for Google identity
      const googleIdentity = userIdentities?.find(identity => identity.provider === 'google')
      if (googleIdentity) {
        console.log("📅 [CALENDAR-EVENTS] Found Google identity:", {
          hasIdentityData: !!googleIdentity?.identity_data,
          identityKeys: googleIdentity?.identity_data ? Object.keys(googleIdentity.identity_data) : []
        })
      }

      // Try to get token from our users table (if stored there)
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('google_calendar_token')
        .eq('id', user.id)
        .single()

      if (userData?.google_calendar_token) {
        console.log("📅 [CALENDAR-EVENTS] Found Google token in database")
        try {
          const tokenData = JSON.parse(userData.google_calendar_token)
          accessToken = tokenData.access_token
          console.log("📅 [CALENDAR-EVENTS] Extracted access token from database:", {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!tokenData.refresh_token,
            tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : null
          })
        } catch (parseError) {
          console.error("📅 [CALENDAR-EVENTS] Error parsing stored token:", parseError)
        }
      } else {
        console.log("📅 [CALENDAR-EVENTS] No token found in database:", { dbError: dbError?.message })
      }
    }
    
    if (!accessToken) {
      console.log("📅 [CALENDAR-EVENTS] ❌ No Google access token found in any location")
      return NextResponse.json({ 
        error: "No Google access token found. Please sign in with Google again.",
        details: "User needs to re-authenticate with Google OAuth to get calendar access. Make sure to grant calendar permissions when prompted.",
        needsReauth: true
      }, { status: 401 })
    }

    // Fetch calendar events from Google Calendar API
    const now = new Date()
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${now.toISOString()}&` +
      `timeMax=${oneMonthFromNow.toISOString()}&` +
      `singleEvents=true&` +
      `orderBy=startTime&` +
      `maxResults=50`
    
    console.log("📅 [CALENDAR-EVENTS] Making Google Calendar API call for future events:", {
      url: calendarUrl,
      timeRange: `${now.toISOString()} to ${oneMonthFromNow.toISOString()}`
    })
    
    const calendarResponse = await fetch(calendarUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log("📅 [CALENDAR-EVENTS] Google Calendar API response:", {
      status: calendarResponse.status,
      statusText: calendarResponse.statusText,
      ok: calendarResponse.ok
    })

    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text()
      console.error('📅 [CALENDAR-EVENTS] ❌ Google Calendar API error:', {
        status: calendarResponse.status,
        statusText: calendarResponse.statusText,
        errorText
      })
      
      // If it's an auth error, provide more specific guidance
      if (calendarResponse.status === 401) {
        return NextResponse.json({ 
          error: "Google access token expired or invalid",
          details: "Please sign out and sign in again with Google to refresh your calendar access. Make sure to grant all permissions including calendar access.",
          needsReauth: true
        }, { status: 401 })
      }
      
      return NextResponse.json({ 
        error: "Failed to fetch calendar events",
        details: errorText 
      }, { status: calendarResponse.status })
    }

    const calendarData = await calendarResponse.json()
    console.log("📅 [CALENDAR-EVENTS] Future events received:", {
      eventCount: calendarData.items?.length || 0,
      kind: calendarData.kind,
      summary: calendarData.summary
    })
    
    // Also fetch past events for the last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const pastEventsUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${thirtyDaysAgo.toISOString()}&` +
      `timeMax=${now.toISOString()}&` +
      `singleEvents=true&` +
      `orderBy=startTime&` +
      `maxResults=50`
    
    console.log("📅 [CALENDAR-EVENTS] Making Google Calendar API call for past events:", {
      url: pastEventsUrl,
      timeRange: `${thirtyDaysAgo.toISOString()} to ${now.toISOString()}`
    })
    
    const pastEventsResponse = await fetch(pastEventsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log("📅 [CALENDAR-EVENTS] Past events API response:", {
      status: pastEventsResponse.status,
      statusText: pastEventsResponse.statusText,
      ok: pastEventsResponse.ok
    })

    let pastEvents = []
    if (pastEventsResponse.ok) {
      const pastEventsData = await pastEventsResponse.json()
      pastEvents = pastEventsData.items || []
      console.log("📅 [CALENDAR-EVENTS] Past events received:", {
        eventCount: pastEvents.length
      })
    } else {
      const pastErrorText = await pastEventsResponse.text()
      console.error('📅 [CALENDAR-EVENTS] ⚠️ Past events API error:', {
        status: pastEventsResponse.status,
        statusText: pastEventsResponse.statusText,
        errorText: pastErrorText
      })
    }

    // Combine and return all events
    const allEvents = [
      ...(pastEvents || []),
      ...(calendarData.items || [])
    ]

    console.log("📅 [CALENDAR-EVENTS] ✅ Returning combined events:", {
      totalEvents: allEvents.length,
      pastEvents: pastEvents.length,
      futureEvents: calendarData.items?.length || 0
    })

    return NextResponse.json({
      kind: calendarData.kind,
      etag: calendarData.etag,
      summary: calendarData.summary,
      timeZone: calendarData.timeZone,
      items: allEvents
    })

  } catch (error) {
    console.error("📅 [CALENDAR-EVENTS] ❌ Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
