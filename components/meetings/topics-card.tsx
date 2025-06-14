"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TopicsCardProps {
  topics: string[]
}

export default function TopicsCard({ topics }: TopicsCardProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(selectedTopic === topic ? null : topic)
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Key Topics</CardTitle>
        <p className="text-sm text-gray-400">Click on topics to highlight related content</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic, index) => (
            <Badge
              key={index}
              variant="outline"
              className={`cursor-pointer transition-colors ${
                selectedTopic === topic
                  ? "bg-green-500/20 text-green-500 border-green-500"
                  : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
              }`}
              onClick={() => handleTopicClick(topic)}
            >
              {topic}
            </Badge>
          ))}
        </div>
        {selectedTopic && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-400">
              <strong>Selected:</strong> {selectedTopic}
            </p>
            <p className="text-xs text-gray-400 mt-1">Related content will be highlighted in the transcript below</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
