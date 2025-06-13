import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Users, CheckSquare, ArrowRight } from "lucide-react"

interface MeetingCardProps {
  meetingId: string
  title: string
  date: string
  participantCount: number
  sentiment: string
  actionItemCount: number
}

export default function MeetingCard({
  meetingId,
  title,
  date,
  participantCount,
  sentiment,
  actionItemCount,
}: MeetingCardProps) {
  const sentimentColor = getSentimentColor(sentiment)

  return (
    <Link href={`/meetings/${meetingId}`}>
      <Card className="bg-gray-900 border-gray-800 hover:border-green-500/30 transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{title}</h3>
              <p className="text-sm text-gray-400 mt-1">{format(new Date(date), "MMM d, yyyy • h:mm a")}</p>
            </div>
            <Badge className={`${sentimentColor} border-none`}>{sentiment}</Badge>
          </div>

          <div className="flex items-center mt-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Users size={16} className="mr-1" />
              <span>{participantCount} participants</span>
            </div>
            <div className="flex items-center ml-4">
              <CheckSquare size={16} className="mr-1" />
              <span>{actionItemCount} action items</span>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <div className="text-green-500 flex items-center text-sm font-medium">
              View details <ArrowRight size={16} className="ml-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function getSentimentColor(sentiment: string): string {
  switch (sentiment.toLowerCase()) {
    case "positive":
      return "bg-green-500/20 text-green-500 hover:bg-green-500/30"
    case "neutral":
      return "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
    case "negative":
      return "bg-red-500/20 text-red-500 hover:bg-red-500/30"
    default:
      return "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
  }
}
