import { Calendar, CheckSquare, BarChart, Clock } from "lucide-react"
import StatCard from "@/components/dashboard/stat-card"

interface StatsBarProps {
  stats: {
    meetingsThisWeek: number
    actionItemsAssigned: number
    avgSentiment: string
    totalMeetingHours: number
  }
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Meetings This Week"
        value={stats.meetingsThisWeek}
        icon={<Calendar size={20} />}
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        title="Action Items Assigned"
        value={stats.actionItemsAssigned}
        icon={<CheckSquare size={20} />}
        trend={{ value: 8, isPositive: true }}
      />
      <StatCard title="Avg. Sentiment" value={stats.avgSentiment} icon={<BarChart size={20} />} />
      <StatCard
        title="Total Meeting Hours"
        value={`${stats.totalMeetingHours}h`}
        icon={<Clock size={20} />}
        trend={{ value: 5, isPositive: false }}
      />
    </div>
  )
}
