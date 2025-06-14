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
  console.log("📊 [DASHBOARD] Starting dashboard API call")
  
  const supabase = await createClient()
  console.log("📊 [DASHBOARD] Supabase client created")

  // Check if user is authenticated
  const { data: userData, error: authError } = await supabase.auth.getUser()
  console.log("📊 [DASHBOARD] Auth check result:", { 
    hasUser: !!userData?.user, 
    userId: userData?.user?.id, 
    authError: authError?.message 
  })

  if (authError || !userData?.user) {
    console.log("📊 [DASHBOARD] ❌ Authentication failed")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = userData.user.id
  console.log("📊 [DASHBOARD] ✅ User authenticated:", userId)

  try {
    // Get Google Calendar events from our internal API
    const calendarApiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/calendar/events`
    console.log("📊 [DASHBOARD] Making internal API call to calendar events:", {
      url: calendarApiUrl,
      hasCookie: !!request.headers.get('cookie')
    })
    
    const calendarResponse = await fetch(calendarApiUrl, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    })

    console.log("📊 [DASHBOARD] Calendar API response:", {
      status: calendarResponse.status,
      statusText: calendarResponse.statusText,
      ok: calendarResponse.ok
    })

    let upcomingMeetings = []
    let pastMeetings = []

    if (calendarResponse.ok) {
      const calendarData = await calendarResponse.json()
      console.log("📊 [DASHBOARD] Calendar data received:", {
        hasItems: !!calendarData.items,
        itemCount: calendarData.items?.length || 0,
        kind: calendarData.kind,
        summary: calendarData.summary
      })
      
      const now = new Date()
      console.log("📊 [DASHBOARD] Current time for filtering:", now.toISOString())

      // Separate upcoming and past meetings
      const allEvents = calendarData.items || []
      console.log("📊 [DASHBOARD] Processing events for filtering...")
      
      // Log first few events for debugging
      if (allEvents.length > 0) {
        console.log("📊 [DASHBOARD] Sample events:", allEvents.slice(0, 3).map((event: any) => ({
          id: event.id,
          summary: event.summary,
          startDateTime: event.start?.dateTime,
          endDateTime: event.end?.dateTime,
          hasDateTime: !!event.start?.dateTime
        })))
      }

      upcomingMeetings = allEvents.filter((event: any) => {
        const hasDateTime = event.start?.dateTime
        const eventTime = hasDateTime ? new Date(event.start.dateTime) : null
        const isUpcoming = eventTime && eventTime > now
        
        if (hasDateTime) {
          console.log(`📊 [DASHBOARD] Event "${event.summary}": ${event.start.dateTime} -> ${isUpcoming ? 'UPCOMING' : 'PAST'}`)
        }
        
        return isUpcoming
      }).slice(0, 10)

      pastMeetings = allEvents.filter((event: any) => {
        const hasDateTime = event.start?.dateTime
        const eventTime = hasDateTime ? new Date(event.start.dateTime) : null
        const isPast = eventTime && eventTime <= now
        return isPast
      }).slice(0, 10)

      console.log("📊 [DASHBOARD] Meeting filtering results:", {
        totalEvents: allEvents.length,
        upcomingCount: upcomingMeetings.length,
        pastCount: pastMeetings.length
      })
    } else {
      const errorText = await calendarResponse.text()
      console.error("📊 [DASHBOARD] ❌ Calendar API call failed:", {
        status: calendarResponse.status,
        statusText: calendarResponse.statusText,
        errorText
      })
    }

    // Add mock data if no real meetings are found
    if (upcomingMeetings.length === 0 && pastMeetings.length === 0) {
      console.log("📊 [DASHBOARD] No real meetings found, adding mock data for demonstration")
      
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(14, 0, 0, 0) // 2:00 PM tomorrow
      
      const endTomorrow = new Date(tomorrow)
      endTomorrow.setHours(15, 0, 0, 0) // 3:00 PM tomorrow
      
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(10, 0, 0, 0) // 10:00 AM yesterday
      
      const endYesterday = new Date(yesterday)
      endYesterday.setHours(11, 30, 0, 0) // 11:30 AM yesterday

      upcomingMeetings = [{
        id: 'mock-upcoming-1',
        summary: 'My Test Meeting',
        description: `Executive Summary: The team discussed various project updates and set actionable items to ensure progress on the user authentication module and the new dashboard design. Key priorities include completing the API endpoints and optimizing database performance.

Key Discussion Points:
• Project updates on the user authentication module and dashboard design
• Database optimization findings and next steps
• Need for prioritization of API endpoints
• Access to the staging environment for testing

Action Items:
• Task: Collaborate with Sarah to prioritize the API endpoints - Due: Next week

Next Steps:
The team will reconvene next Tuesday to discuss further progress and any outstanding issues.`,
        start: {
          dateTime: tomorrow.toISOString(),
          timeZone: 'America/New_York'
        },
        end: {
          dateTime: endTomorrow.toISOString(),
          timeZone: 'America/New_York'
        },
        attendees: [
          {
            email: 'john.smith@company.com',
            displayName: 'John Smith',
            responseStatus: 'accepted'
          },
          {
            email: 'sarah.johnson@company.com',
            displayName: 'Sarah Johnson',
            responseStatus: 'accepted'
          },
          {
            email: 'mike.davis@company.com',
            displayName: 'Mike Davis',
            responseStatus: 'accepted'
          },
          {
            email: 'lisa.chen@company.com',
            displayName: 'Lisa Chen',
            responseStatus: 'accepted'
          }
        ],
        organizer: {
          email: userId + '@example.com',
          displayName: 'You',
          self: true
        },
        status: 'confirmed',
        location: 'Conference Room A',
        conferenceData: {
          entryPoints: [{
            entryPointType: 'video',
            uri: 'https://meet.google.com/zny-iosk-xkf',
            label: 'meet.google.com/zny-iosk-xkf'
          }]
        }
      }]

      pastMeetings = [{
        id: 'mock-past-1',
        summary: 'Product Roadmap Review',
        description: 'Quarterly review of product roadmap and priorities',
        start: {
          dateTime: yesterday.toISOString(),
          timeZone: 'America/New_York'
        },
        end: {
          dateTime: endYesterday.toISOString(),
          timeZone: 'America/New_York'
        },
        attendees: [
          {
            email: 'sarah.wilson@company.com',
            displayName: 'Sarah Wilson',
            responseStatus: 'accepted'
          },
          {
            email: 'mike.johnson@company.com',
            displayName: 'Mike Johnson',
            responseStatus: 'accepted'
          },
          {
            email: 'lisa.chen@company.com',
            displayName: 'Lisa Chen',
            responseStatus: 'accepted'
          }
        ],
        organizer: {
          email: 'sarah.wilson@company.com',
          displayName: 'Sarah Wilson',
          self: false
        },
        status: 'confirmed',
        location: 'Main Conference Room'
      }]

      console.log("📊 [DASHBOARD] Added mock data:", {
        upcomingCount: upcomingMeetings.length,
        pastCount: pastMeetings.length
      })
    }

    // Calculate stats
    const totalMeetingHours = pastMeetings.reduce((total: number, meeting: any) => {
      if (meeting.start?.dateTime && meeting.end?.dateTime) {
        const start = new Date(meeting.start.dateTime)
        const end = new Date(meeting.end.dateTime)
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return total + duration
      }
      return total
    }, 0)

    const stats = {
      meetingsThisWeek: upcomingMeetings.length,
      actionItemsAssigned: 24,
      avgSentiment: "Positive",
      totalMeetingHours,
    }

    console.log("📊 [DASHBOARD] Final stats calculated:", stats)
    console.log("📊 [DASHBOARD] ✅ Returning dashboard data:", {
      upcomingMeetingsCount: upcomingMeetings.length,
      pastMeetingsCount: pastMeetings.length,
      statsCalculated: true
    })

    return NextResponse.json({
      stats,
      upcomingMeetings,
      pastMeetings,
    })
  } catch (error) {
    console.error("📊 [DASHBOARD] ❌ Unexpected error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
