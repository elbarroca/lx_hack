"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/dashboard/main-layout"
import StatsBar from "@/components/dashboard/stats-bar"
import RecentMeetingsFeed from "@/components/dashboard/recent-meetings-feed"
import SetupModal from "@/components/dashboard/setup-modal"
import { Loader2 } from "lucide-react"
import ChatInterface from "@/components/dashboard/ChatInterface"

interface DashboardData {
  stats: {
    meetingsThisWeek: number
    actionItemsAssigned: number
    avgSentiment: string
    totalMeetingHours: number
  }
  upcomingMeetings: Array<{
    id: string
    title: string
    scheduledAt: string
    isArmed: boolean
  }>
  recentMeetings: Array<{
    id: string
    title: string
    date: string
    participantCount: number
    sentiment: string
    actionItemCount: number
  }>
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [setupCompleted, setSetupCompleted] = useState<boolean | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuthAndSetup = async () => {
      try {
        // Check authentication
        const { data: userData, error: authError } = await supabase.auth.getUser()

        if (authError || !userData?.user) {
          router.push("/auth/login")
          return
        }

        setUser({ email: userData.user.email || "" })

        // Check setup status
        const setupResponse = await fetch("/api/user/setup-status")
        if (setupResponse.status === 401) {
          router.push("/auth/login")
          return
        }
        
        if (setupResponse.ok) {
          const { setupCompleted: isSetupCompleted } = await setupResponse.json()
          setSetupCompleted(isSetupCompleted)

          // If setup is completed, fetch dashboard data
          if (isSetupCompleted) {
            await fetchDashboardData()
          }
        }
      } catch (error) {
        console.error("Error checking auth and setup:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndSetup()
  }, [router, supabase])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard")
      if (response.status === 401) {
        router.push("/auth/login")
        return
      }
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

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
    <MainLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mission Control</h1>
          <p className="text-gray-400 mt-1">Your meeting intelligence at a glance</p>
        </div>

        <StatsBar stats={dashboardData.stats} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <RecentMeetingsFeed meetings={dashboardData.recentMeetings} />
          </div>
          <div className="lg:col-span-2">
            <ChatInterface />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
