import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ActionItemCard from "./action-item-card"

interface ActionItem {
  id: string
  task: string
  owner: string
  quote: string
  status: "pending" | "completed"
}

interface ActionItemsListProps {
  actionItems: ActionItem[]
  onStatusUpdate: (itemId: string, newStatus: "pending" | "completed") => void
}

export default function ActionItemsList({ actionItems, onStatusUpdate }: ActionItemsListProps) {
  const pendingItems = actionItems.filter((item) => item.status === "pending")
  const completedItems = actionItems.filter((item) => item.status === "completed")

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Action Items</CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{pendingItems.length} pending</span>
          <span>{completedItems.length} completed</span>
        </div>
      </CardHeader>
      <CardContent>
        {actionItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No action items identified in this meeting</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Items */}
            {pendingItems.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Pending</h4>
                <div className="space-y-3">
                  {pendingItems.map((item) => (
                    <ActionItemCard
                      key={item.id}
                      id={item.id}
                      task={item.task}
                      owner={item.owner}
                      quote={item.quote}
                      initialStatus={item.status}
                      onStatusUpdate={onStatusUpdate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Items */}
            {completedItems.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Completed</h4>
                <div className="space-y-3">
                  {completedItems.map((item) => (
                    <ActionItemCard
                      key={item.id}
                      id={item.id}
                      task={item.task}
                      owner={item.owner}
                      quote={item.quote}
                      initialStatus={item.status}
                      onStatusUpdate={onStatusUpdate}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
