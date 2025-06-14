"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import MainLayout from "@/components/dashboard/main-layout"
import SummaryCard from "@/components/meetings/summary-card"
import TopicsCard from "@/components/meetings/topics-card"
import SentimentCard from "@/components/meetings/sentiment-card"
import ActionItemsList from "@/components/meetings/action-items-list"
import InteractiveTranscript from "@/components/meetings/interactive-transcript"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface MeetingData {
  id: string
  title: string
  date: string
  participantCount: number
  analysis: {
    summary: string
    keyTopics: string[]
    sentiment: {
      overall: string
      score: number
    }
    transcript: Array<{
      speaker: string
      text: string
      timestamp: string
    }>
  }
  actionItems: Array<{
    id: string
    task: string
    owner: string
    quote: string
    status: "pending" | "completed"
  }>
}

export default function MeetingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const meetingId = params.meetingId as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check authentication
        const { data: userData, error: authError } = await supabase.auth.getUser()

        if (authError || !userData?.user) {
          router.push("/auth/login")
          return
        }

        setUser({ email: userData.user.email || "" })

        // Fetch meeting data
        const response = await fetch(`/api/meetings/${meetingId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("Meeting not found")
          } else if (response.status === 403) {
            setError("You don't have permission to view this meeting")
          } else {
            setError("Failed to load meeting data")
          }
          return
        }

        const data = await response.json()
        setMeetingData(data)
      } catch (err) {
        console.error("Error fetching meeting data:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    if (meetingId) {
      fetchData()
    }
  }, [meetingId, router, supabase])

  const handleActionItemUpdate = async (itemId: string, newStatus: "pending" | "completed") => {
    try {
      const response = await fetch(`/api/action-items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update action item")
      }

      // Update local state
      setMeetingData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          actionItems: prev.actionItems.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item)),
        }
      })
    } catch (error) {
      console.error("Error updating action item:", error)
      // You could add a toast notification here
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading meeting details...</p>
        </div>
      </div>
    )
  }

  if (error || !meetingData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-400 mb-6">{error || "Meeting not found"}</p>
          <Link href="/dashboard">
            <Button className="bg-green-500 hover:bg-green-600 text-black">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-gray-400 hover:text-white mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{meetingData.title}</h1>
            <p className="text-gray-400 mt-1">
              {new Date(meetingData.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - AI Analysis */}
          <div className="space-y-6">
            <SummaryCard summary={meetingData.analysis.summary} />
            <TopicsCard topics={meetingData.analysis.keyTopics} />
            <SentimentCard sentiment={meetingData.analysis.sentiment} />
          </div>

          {/* Right Column - Verifiable Truth */}
          <div className="space-y-6">
            <ActionItemsList actionItems={meetingData.actionItems} onStatusUpdate={handleActionItemUpdate} />
            <InteractiveTranscript transcript={meetingData.analysis.transcript} analysis={meetingData.analysis} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
