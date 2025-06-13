import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MeetingCard from "./meeting-card"

interface Meeting {
  id: string
  title: string
  date: string
  participantCount: number
  sentiment: string
  actionItemCount: number
}

interface RecentMeetingsFeedProps {
  meetings: Meeting[]
}

export default function RecentMeetingsFeed({ meetings }: RecentMeetingsFeedProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Recent Meetings</CardTitle>
      </CardHeader>
      <CardContent>
        {meetings.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No meetings recorded yet</p>
            <p className="mt-2">Connect your calendar to start capturing meeting insights</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meetingId={meeting.id}
                title={meeting.title}
                date={meeting.date}
                participantCount={meeting.participantCount}
                sentiment={meeting.sentiment}
                actionItemCount={meeting.actionItemCount}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
