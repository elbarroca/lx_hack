"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Eye, FileText, Video } from "lucide-react"

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

interface PastMeetingsTableProps {
  meetings: CalendarEvent[]
}

export default function PastMeetingsTable({ meetings }: PastMeetingsTableProps) {
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

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const meetingDate = new Date(dateString)
    const diffMs = now.getTime() - meetingDate.getTime()
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      const diffMinutes = Math.round(diffMs / (1000 * 60))
      return diffMinutes <= 0 ? "Just ended" : `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      const diffDays = Math.round(diffHours / 24)
      return `${diffDays}d ago`
    }
  }

  const handleReviewMeeting = (meetingId: string) => {
    // TODO: Navigate to meeting review page
    console.log("Review meeting:", meetingId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Past Meetings
        </CardTitle>
        <CardDescription>Your completed meetings from Google Calendar</CardDescription>
      </CardHeader>
      <CardContent>
        {meetings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No past meetings</p>
            <p className="text-sm text-gray-400">Your meeting history will appear here</p>
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
                      {getTimeAgo(meeting.end.dateTime)}
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

                  {/* Mock indicators for AI processing */}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      Transcript Available
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Video className="h-3 w-3 mr-1" />
                      Recording Ready
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReviewMeeting(meeting.id)}
                    className="border-green-500/30 text-green-500 hover:bg-green-500/10"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
