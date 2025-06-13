import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Shield } from "lucide-react"

interface Meeting {
  id: string
  title: string
  scheduledAt: string
  isArmed: boolean
}

interface UpcomingMeetingsProps {
  meetings: Meeting[]
}

export default function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Upcoming Meetings</CardTitle>
      </CardHeader>
      <CardContent>
        {meetings.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p>No upcoming meetings scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{meeting.title}</h4>
                  <p className="text-sm text-gray-400">
                    Starts {formatDistanceToNow(new Date(meeting.scheduledAt), { addSuffix: true })}
                  </p>
                </div>
                <div>
                  {meeting.isArmed ? (
                    <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-none">
                      <Shield size={14} className="mr-1" /> Armed
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-700 text-gray-300 hover:bg-gray-600 border-none">Not Armed</Badge>
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
