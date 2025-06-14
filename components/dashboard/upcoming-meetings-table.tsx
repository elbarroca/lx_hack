"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format, formatDistanceToNow } from "date-fns"
import { Calendar, Users, MapPin, Video, Shield, ShieldOff, ExternalLink } from "lucide-react"

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
  const [armedMeetings, setArmedMeetings] = useState<Set<string>>(new Set())

  const toggleArmed = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/arm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          armed: !armedMeetings.has(meetingId),
        }),
      })

      if (response.ok) {
        setArmedMeetings((prev) => {
          const newSet = new Set(prev)
          if (newSet.has(meetingId)) {
            newSet.delete(meetingId)
          } else {
            newSet.add(meetingId)
          }
          return newSet
        })
      }
    } catch (error) {
      console.error("Error toggling meeting armed status:", error)
    }
  }

  const getVideoLink = (meeting: CalendarEvent) => {
    return meeting.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri
  }

  const getAttendeeCount = (meeting: CalendarEvent) => {
    return meeting.attendees?.length || 0
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-500" />
          Upcoming Meetings
        </CardTitle>
        <p className="text-sm text-gray-400">{meetings.length} meetings scheduled</p>
      </CardHeader>
      <CardContent>
        {meetings.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No upcoming meetings</p>
            <p className="text-sm">Your calendar is clear for now</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => {
              const isArmed = armedMeetings.has(meeting.id)
              const videoLink = getVideoLink(meeting)
              const attendeeCount = getAttendeeCount(meeting)

              return (
                <div
                  key={meeting.id}
                  className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">{meeting.summary}</h3>
                      <p className="text-sm text-gray-400">
                        {format(new Date(meeting.start.dateTime), "MMM d, yyyy • h:mm a")} -{" "}
                        {format(new Date(meeting.end.dateTime), "h:mm a")}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Starts {formatDistanceToNow(new Date(meeting.start.dateTime), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleArmed(meeting.id)}
                        className={`${
                          isArmed
                            ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {isArmed ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                        {isArmed ? "Armed" : "Arm"}
                      </Button>
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

                    {videoLink && (
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
                        {meeting.organizer.self ? "Organizer" : "Attendee"}
                      </Badge>

                      {isArmed && (
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">AI Agent Ready</Badge>
                      )}
                    </div>

                    {videoLink && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={videoLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Join
                        </a>
                      </Button>
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
