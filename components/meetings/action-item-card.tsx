"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Quote } from "lucide-react"

interface ActionItemCardProps {
  id: string
  task: string
  owner: string
  quote: string
  initialStatus: "pending" | "completed"
  onStatusUpdate: (itemId: string, newStatus: "pending" | "completed") => void
}

export default function ActionItemCard({ id, task, owner, quote, initialStatus, onStatusUpdate }: ActionItemCardProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (checked: boolean) => {
    const newStatus = checked ? "completed" : "pending"
    setIsUpdating(true)

    try {
      await onStatusUpdate(id, newStatus)
      setStatus(newStatus)
    } catch (error) {
      console.error("Failed to update status:", error)
      // Revert the checkbox state on error
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className={`bg-gray-800 border-gray-700 ${status === "completed" ? "opacity-75" : ""}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Main content */}
          <div className="flex items-start gap-3">
            <Checkbox
              checked={status === "completed"}
              onCheckedChange={handleStatusChange}
              disabled={isUpdating}
              className="mt-1 border-gray-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
            <div className="flex-1 space-y-2">
              <p className={`font-medium ${status === "completed" ? "line-through text-gray-400" : "text-white"}`}>
                {task}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-gray-700 text-gray-300 border-gray-600">
                  {owner}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-white h-6 px-2"
                >
                  <Quote className="w-3 h-3 mr-1" />
                  {isExpanded ? "Hide" : "Show"} Quote
                  {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Expandable quote section */}
          {isExpanded && (
            <div className="ml-8 p-3 bg-gray-900 border border-gray-700 rounded-lg">
              <div className="flex items-start gap-2">
                <Quote className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-300 italic leading-relaxed">&quot;{quote}&quot;</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
