"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/dashboard/main-layout"
import StatsBar from "@/components/dashboard/stats-bar"
import UpcomingMeetingsTable from "@/components/dashboard/upcoming-meetings-table"
import PastMeetingsTable from "@/components/dashboard/past-meetings-table"
import SetupModal from "@/components/dashboard/setup-modal"
import { Loader2 } from "lucide-react"
import ChatInterface from "@/components/dashboard/chat-interface"
import { mockUser, mockStats, mockUpcomingMeetings, mockPastMeetings } from "@/lib/mock-data"

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

interface DashboardData {
  stats: {
    meetingsThisWeek: number
    actionItemsAssigned: number
    avgSentiment: string
    totalMeetingHours: number
  }
  upcomingMeetings: CalendarEvent[]
  pastMeetings: CalendarEvent[]
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)
  const [setupCompleted, setSetupCompleted] = useState<boolean | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const fetchDashboardData = useCallback(async () => {
    try {
      // Use mock data instead of API call
      const data = {
        stats: mockStats,
        upcomingMeetings: mockUpcomingMeetings,
        pastMeetings: mockPastMeetings
      }
      setDashboardData(data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }, [router])

  const refreshCalendarData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      await fetchDashboardData()
    } catch (error) {
      console.error("Error refreshing calendar data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchDashboardData])

  useEffect(() => {
    const checkAuthAndSetup = async () => {
      try {
        // Use mock user data
        setUser({ email: mockUser.email, name: mockUser.name })
        setSetupCompleted(true)
        
        // Load mock dashboard data
        await fetchDashboardData()
      } catch (error) {
        console.error("Error checking auth and setup:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndSetup()
  }, [router, supabase.auth, fetchDashboardData])

  const handleSetupComplete = async () => {
    setSetupCompleted(true)
    await fetchDashboardData()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (setupCompleted === false) {
    return (
      <div className="min-h-screen bg-black">
        <SetupModal isOpen={true} onComplete={handleSetupComplete} />
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mission Control</h1>
            <p className="text-gray-400 mt-1">Your meeting intelligence at a glance</p>
          </div>
          <button
            onClick={refreshCalendarData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg font-medium disabled:opacity-50"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            Sync Calendar
          </button>
        </div>

        <StatsBar stats={dashboardData.stats} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <UpcomingMeetingsTable meetings={dashboardData.upcomingMeetings} />
            <PastMeetingsTable meetings={dashboardData.pastMeetings} />
          </div>
          <div className="lg:col-span-2">
            <ChatInterface />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
