import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SentimentCardProps {
  sentiment: {
    overall: string
    score: number
  }
}

export default function SentimentCard({ sentiment }: SentimentCardProps) {
  const getSentimentColor = (sentimentType: string) => {
    switch (sentimentType.toLowerCase()) {
      case "positive":
        return "bg-green-500/20 text-green-500 border-green-500/30"
      case "neutral":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30"
      case "negative":
        return "bg-red-500/20 text-red-500 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.6) return "bg-green-500"
    if (score >= 0.3) return "bg-blue-500"
    return "bg-red-500"
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Meeting Sentiment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Overall Sentiment:</span>
            <Badge className={getSentimentColor(sentiment.overall)}>{sentiment.overall}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Confidence Score:</span>
              <span className="text-white">{Math.round(sentiment.score * 100)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getScoreColor(sentiment.score)}`}
                style={{ width: `${sentiment.score * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-xs text-gray-400 mt-3">
            <p>
              Sentiment analysis is based on tone, language patterns, and conversational dynamics throughout the
              meeting.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
