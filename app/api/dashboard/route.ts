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

    // Get user from our users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const now = new Date().toISOString()

    // Get upcoming meetings (scheduled_at >= now)
    const { data: upcomingMeetings, error: upcomingError } = await supabase
      .from("meetings")
      .select("*")
      .eq("user_id", userData.id)
      .gte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })

    if (upcomingError) {
      console.error("Error fetching upcoming meetings:", upcomingError)
      return NextResponse.json({ error: "Failed to fetch upcoming meetings" }, { status: 500 })
    }

    // Get past meetings (scheduled_at < now)
    const { data: pastMeetings, error: pastError } = await supabase
      .from("meetings")
      .select("*")
      .eq("user_id", userData.id)
      .lt("scheduled_at", now)
      .order("scheduled_at", { ascending: false })

    if (pastError) {
      console.error("Error fetching past meetings:", pastError)
      return NextResponse.json({ error: "Failed to fetch past meetings" }, { status: 500 })
    }

    // Calculate statistics
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const oneWeekAgoISO = oneWeekAgo.toISOString()

    const meetingsThisWeek = pastMeetings.filter(meeting => 
      meeting.scheduled_at >= oneWeekAgoISO
    ).length

    // Calculate total hours from past meetings that have ended_at
    const totalHours = pastMeetings.reduce((total, meeting) => {
      if (meeting.started_at && meeting.ended_at) {
        const start = new Date(meeting.started_at)
        const end = new Date(meeting.ended_at)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return total + hours
      }
      return total
    }, 0)

    // Format meetings for frontend
    const formatMeeting = (meeting: any) => ({
      id: meeting.id,
      title: meeting.meeting_title,
      time: meeting.scheduled_at,
      status: meeting.status,
      url: meeting.meeting_url,
      hasRecording: !!meeting.recording_url,
      hasTranscript: !!meeting.transcript,
      hasSummary: !!meeting.summary,
      canReview: meeting.status === 'completed' || (meeting.ended_at && new Date(meeting.ended_at) < new Date()),
      nativeMeetingId: meeting.native_meeting_id,
      startedAt: meeting.started_at,
      endedAt: meeting.ended_at,
    })

    const response = {
      user: {
        name: userData.full_name || user.email,
        email: user.email,
      },
      stats: {
        meetingsThisWeek,
        totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal place
        upcomingMeetings: upcomingMeetings.length,
        pastMeetings: pastMeetings.length,
      },
      upcomingMeetings: upcomingMeetings.map(formatMeeting),
      pastMeetings: pastMeetings.map(formatMeeting),
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


