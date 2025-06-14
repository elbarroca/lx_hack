"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, ExternalLink } from "lucide-react"

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    email: string
    responseStatus: string
    displayName?: string
  }>
  conferenceData?: {
    entryPoints: Array<{
      entryPointType: string
      uri: string
      label: string
    }>
  }
  location?: string
  organizer: {
    email: string
    displayName?: string
    self?: boolean
  }
  status: string
}

interface UpcomingMeetingsTableProps {
  meetings: CalendarEvent[]
}

export default function UpcomingMeetingsTable({ meetings }: UpcomingMeetingsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const durationMs = endDate.getTime() - startDate.getTime()
    const durationMinutes = Math.round(durationMs / (1000 * 60))
    
    if (durationMinutes < 60) {
      return `${durationMinutes}m`
    } else {
      const hours = Math.floor(durationMinutes / 60)
      const minutes = durationMinutes % 60
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
  }

  const getTimeUntilMeeting = (dateString: string) => {
    const now = new Date()
    const meetingDate = new Date(dateString)
    const diffMs = meetingDate.getTime() - now.getTime()
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      const diffMinutes = Math.round(diffMs / (1000 * 60))
      return diffMinutes <= 0 ? "Starting now" : `${diffMinutes}m`
    } else if (diffHours < 24) {
      return `${diffHours}h`
    } else {
      const diffDays = Math.round(diffHours / 24)
      return `${diffDays}d`
    }
  }

  const handleJoinMeeting = (event: CalendarEvent) => {
    const meetingUrl = event.conferenceData?.entryPoints?.[0]?.uri
    if (meetingUrl) {
      window.open(meetingUrl, "_blank")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Meetings
        </CardTitle>
        <CardDescription>Your scheduled meetings from Google Calendar</CardDescription>
      </CardHeader>
      <CardContent>
        {meetings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming meetings</p>
            <p className="text-sm text-gray-400">Your calendar events will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-gray-900/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-white">{meeting.summary}</h4>
                    <Badge variant="outline" className="text-xs">
                      {getTimeUntilMeeting(meeting.start.dateTime)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(meeting.start.dateTime)}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Duration: {formatDuration(meeting.start.dateTime, meeting.end.dateTime)}</span>
                    </div>
                    {meeting.attendees && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {meeting.attendees.length} attendees
                      </div>
                    )}
                  </div>

                  {meeting.location && (
                    <p className="text-xs text-gray-500 mt-1">📍 {meeting.location}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {meeting.conferenceData?.entryPoints?.[0]?.uri && (
                    <Button
                      size="sm"
                      onClick={() => handleJoinMeeting(meeting)}
                      className="bg-green-500 hover:bg-green-600 text-black"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Join
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
