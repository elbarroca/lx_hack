"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import TranscriptSegment from "./transcript-segment"

interface TranscriptEntry {
  speaker: string
  text: string
  timestamp: string
}

interface InteractiveTranscriptProps {
  transcript: TranscriptEntry[]
}

export default function InteractiveTranscript({ transcript }: InteractiveTranscriptProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [highlightedSpeaker, setHighlightedSpeaker] = useState<string | null>(null)

  const filteredTranscript = transcript.filter(
    (entry) =>
      entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.speaker.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const speakers = Array.from(new Set(transcript.map((entry) => entry.speaker)))

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Interactive Transcript</CardTitle>
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              type="search"
              placeholder="Search transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 focus:border-green-500"
            />
          </div>

          {/* Speaker filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setHighlightedSpeaker(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                highlightedSpeaker === null ? "bg-green-500 text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              All Speakers
            </button>
            {speakers.map((speaker) => (
              <button
                key={speaker}
                onClick={() => setHighlightedSpeaker(speaker)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  highlightedSpeaker === speaker
                    ? "bg-green-500 text-black"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {speaker}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
          {filteredTranscript.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No transcript entries match your search</p>
            </div>
          ) : (
            filteredTranscript.map((entry, index) => (
              <TranscriptSegment
                key={index}
                speaker={entry.speaker}
                text={entry.text}
                timestamp={entry.timestamp}
                isHighlighted={highlightedSpeaker === null || highlightedSpeaker === entry.speaker}
                searchTerm={searchTerm}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
