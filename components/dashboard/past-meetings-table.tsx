"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Users, MapPin, Video, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"

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
  const getAttendeeCount = (meeting: CalendarEvent) => {
    return meeting.attendees?.length || 0
  }

  const getDuration = (meeting: CalendarEvent) => {
    const start = new Date(meeting.start.dateTime)
    const end = new Date(meeting.end.dateTime)
    const durationMs = end.getTime() - start.getTime()
    const durationMinutes = Math.round(durationMs / (1000 * 60))

    if (durationMinutes < 60) {
      return `${durationMinutes}m`
    } else {
      const hours = Math.floor(durationMinutes / 60)
      const minutes = durationMinutes % 60
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
  }

  // Mock function to check if meeting has analysis
  const hasAnalysis = (meetingId: string) => {
    // In real implementation, this would check if the meeting has been processed
    return Math.random() > 0.3 // 70% chance of having analysis
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-500" />
          Past Meetings
        </CardTitle>
        <p className="text-sm text-gray-400">{meetings.length} recent meetings</p>
      </CardHeader>
      <CardContent>
        {meetings.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No past meetings</p>
            <p className="text-sm">Meeting history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => {
              const attendeeCount = getAttendeeCount(meeting)
              const duration = getDuration(meeting)
              const hasAIAnalysis = hasAnalysis(meeting.id)

              return (
                <div
                  key={meeting.id}
                  className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">{meeting.summary}</h3>
                      <p className="text-sm text-gray-400">
                        {format(new Date(meeting.start.dateTime), "MMM d, yyyy • h:mm a")} • {duration}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasAIAnalysis ? (
                        <Link href={`/meetings/${meeting.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-green-500/20 text-green-500 hover:bg-green-500/30"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            View Analysis
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                          Processing...
                        </Badge>
                      )}
                    </div>
                  </div>

                  {meeting.description && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{meeting.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    {attendeeCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{attendeeCount} attendees</span>
                      </div>
                    )}

                    {meeting.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-32">{meeting.location}</span>
                      </div>
                    )}

                    {meeting.conferenceData && (
                      <div className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        <span>Video call</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${
                          meeting.organizer.self
                            ? "bg-blue-500/20 text-blue-500 border-blue-500/30"
                            : "bg-gray-700 text-gray-300 border-gray-600"
                        }`}
                      >
                        {meeting.organizer.self ? "Organized" : "Attended"}
                      </Badge>

                      {hasAIAnalysis && (
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">AI Analyzed</Badge>
                      )}
                    </div>

                    {hasAIAnalysis && (
                      <div className="text-xs text-gray-500">
                        <span>3 action items • Positive sentiment</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
