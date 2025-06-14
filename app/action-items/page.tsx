"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import MainLayout from "@/components/dashboard/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, CheckCircle, Clock, Filter } from "lucide-react"
import ActionItemCard from "@/components/meetings/action-item-card"

interface ActionItem {
  id: string
  task: string
  owner: string
  quote: string
  status: "pending" | "completed"
  meetingId: string
  meetingTitle: string
  createdAt: string
  dueDate?: string
  priority: "low" | "medium" | "high"
}

export default function ActionItemsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ActionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [ownerFilter, setOwnerFilter] = useState<string>("all")
  const supabase = createClient()

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

        // Fetch action items data
        const response = await fetch("/api/action-items")

        if (!response.ok) {
          setError("Failed to load action items")
          return
        }

        const data = await response.json()
        setActionItems(data)
        setFilteredItems(data)
      } catch (err) {
        console.error("Error fetching action items:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, supabase])

  useEffect(() => {
    let filtered = actionItems

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meetingTitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter((item) => item.priority === priorityFilter)
    }

    // Filter by owner
    if (ownerFilter !== "all") {
      filtered = filtered.filter((item) => item.owner === ownerFilter)
    }

    setFilteredItems(filtered)
  }, [actionItems, searchTerm, statusFilter, priorityFilter, ownerFilter])

  const handleStatusUpdate = async (itemId: string, newStatus: "pending" | "completed") => {
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
      setActionItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      )
    } catch (error) {
      console.error("Error updating action item:", error)
      throw error
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-500"
      case "medium":
        return "bg-yellow-500/20 text-yellow-500"
      case "low":
        return "bg-green-500/20 text-green-500"
      default:
        return "bg-gray-500/20 text-gray-500"
    }
  }

  const getUniqueOwners = () => {
    return Array.from(new Set(actionItems.map(item => item.owner)))
  }

  const getStats = () => {
    const total = actionItems.length
    const completed = actionItems.filter(item => item.status === "completed").length
    const pending = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, pending, completionRate }
  }

  const stats = getStats()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading action items...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Action Items</h1>
            <p className="text-gray-400 mt-2">Track and manage all your meeting action items</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-500">
              {stats.total} total
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-500">
              {stats.completed} completed
            </Badge>
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500">
              {stats.pending} pending
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Items</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Completion Rate</CardTitle>
              <Filter className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.completionRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Search action items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                  <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Owner" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Owners</SelectItem>
                    {getUniqueOwners().map((owner) => (
                      <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items List */}
        {filteredItems.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No action items found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                    <span className="text-sm text-gray-400">
                      From: {item.meetingTitle}
                    </span>
                    <span className="text-sm text-gray-500">
                      • {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ActionItemCard
                  id={item.id}
                  task={item.task}
                  owner={item.owner}
                  quote={item.quote}
                  initialStatus={item.status}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
} 