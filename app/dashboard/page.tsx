import MainLayout from "@/components/dashboard/main-layout"
import StatsBar from "@/components/dashboard/stats-bar"
import UpcomingMeetings from "@/components/dashboard/upcoming-meetings"
import RecentMeetingsFeed from "@/components/dashboard/recent-meetings-feed"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: userData, error } = await supabase.auth.getUser()

  if (error || !userData?.user) {
    redirect("/auth/login")
  }

  // Fetch dashboard data
  const dashboardData = await fetchDashboardData(userData.user.id)

  return (
    <MainLayout user={{ email: userData.user.email || "" }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mission Control</h1>
          <p className="text-gray-400 mt-1">Your meeting intelligence at a glance</p>
        </div>

        <Suspense fallback={<LoadingStats />}>
          <StatsBar stats={dashboardData.stats} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Suspense fallback={<LoadingCard />}>
              <UpcomingMeetings meetings={dashboardData.upcomingMeetings} />
            </Suspense>
          </div>
          <div className="lg:col-span-2">
            <Suspense fallback={<LoadingCard />}>
              <RecentMeetingsFeed meetings={dashboardData.recentMeetings} />
            </Suspense>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

function LoadingStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-1/2 mb-4"></div>
          <div className="h-6 bg-gray-800 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse h-64 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
    </div>
  )
}

// This would normally be an API call, but for now we'll mock the data
async function fetchDashboardData(userId: string) {
  // In a real app, this would be an API call to /api/dashboard

  // Mock data for demonstration
  return {
    stats: {
      meetingsThisWeek: 8,
      actionItemsAssigned: 24,
      avgSentiment: "Positive",
      totalMeetingHours: 12,
    },
    upcomingMeetings: [
      {
        id: "1",
        title: "Weekly Team Sync",
        scheduledAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        isArmed: true,
      },
      {
        id: "2",
        title: "Product Planning",
        scheduledAt: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        isArmed: true,
      },
      {
        id: "3",
        title: "Client Presentation",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
        isArmed: false,
      },
    ],
    recentMeetings: [
      {
        id: "101",
        title: "Q2 Strategy Review",
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        participantCount: 8,
        sentiment: "Positive",
        actionItemCount: 6,
      },
      {
        id: "102",
        title: "Engineering Standup",
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        participantCount: 5,
        sentiment: "Neutral",
        actionItemCount: 3,
      },
      {
        id: "103",
        title: "Marketing Campaign Kickoff",
        date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        participantCount: 4,
        sentiment: "Positive",
        actionItemCount: 8,
      },
      {
        id: "104",
        title: "Customer Feedback Session",
        date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        participantCount: 6,
        sentiment: "Neutral",
        actionItemCount: 5,
      },
    ],
  }
}
