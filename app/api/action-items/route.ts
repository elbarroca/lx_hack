import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get action items from database
    const { data: actionItemsData, error: dbError } = await supabase
      .from("action_items")
      .select(`
        id,
        task_description,
        owner,
        status,
        priority,
        due_date,
        created_at,
        updated_at,
        meetings(
          id,
          meeting_title
        )
      `)
      .order("created_at", { ascending: false })

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to fetch action items" }, { status: 500 })
    }

    // Transform the data to match the expected format
    const actionItems = actionItemsData?.map((item) => {
      const meeting = Array.isArray(item.meetings) ? item.meetings[0] : item.meetings
      return {
        id: item.id,
        task: item.task_description,
        owner: item.owner || "Unassigned",
        quote: `Action item from ${meeting?.meeting_title || "Unknown Meeting"}`,
        status: item.status === "completed" ? "completed" : "pending",
        meetingId: meeting?.id || "",
        meetingTitle: meeting?.meeting_title || "Unknown Meeting",
        createdAt: item.created_at,
        dueDate: item.due_date,
        priority: item.priority || "medium"
      }
    }) || []

    // If no real data, return mock data for demonstration
    if (actionItems.length === 0) {
      const mockActionItems = [
      {
        id: "ai-1",
        task: "Update the project timeline and share with stakeholders",
        owner: "Sarah Johnson",
        quote: "We need to make sure everyone is aligned on the new deadlines, especially after the scope changes we discussed.",
        status: "pending",
        meetingId: "1",
        meetingTitle: "Weekly Team Standup",
        createdAt: "2024-01-15T10:30:00Z",
        dueDate: "2024-01-20T17:00:00Z",
        priority: "high"
      },
      {
        id: "ai-2",
        task: "Research competitor pricing strategies",
        owner: "Mike Chen",
        quote: "Let's do a deep dive into how our competitors are positioning their pricing, particularly in the enterprise segment.",
        status: "completed",
        meetingId: "2",
        meetingTitle: "Product Roadmap Review",
        createdAt: "2024-01-14T15:00:00Z",
        dueDate: "2024-01-18T12:00:00Z",
        priority: "medium"
      },
      {
        id: "ai-3",
        task: "Schedule follow-up meeting with client",
        owner: "Emily Rodriguez",
        quote: "The client seemed interested but wants to discuss implementation details. We should strike while the iron is hot.",
        status: "pending",
        meetingId: "3",
        meetingTitle: "Client Feedback Session",
        createdAt: "2024-01-16T16:30:00Z",
        dueDate: "2024-01-19T10:00:00Z",
        priority: "high"
      },
      {
        id: "ai-4",
        task: "Create user stories for the new feature",
        owner: "David Kim",
        quote: "We need detailed user stories before we can start the development sprint. Make sure to include acceptance criteria.",
        status: "pending",
        meetingId: "4",
        meetingTitle: "Sprint Planning",
        createdAt: "2024-01-12T09:30:00Z",
        dueDate: "2024-01-17T17:00:00Z",
        priority: "medium"
      },
      {
        id: "ai-5",
        task: "Fix critical bug in payment processing",
        owner: "Alex Thompson",
        quote: "This is blocking our biggest client from processing orders. We need to prioritize this immediately.",
        status: "completed",
        meetingId: "5",
        meetingTitle: "Bug Triage Meeting",
        createdAt: "2024-01-11T11:15:00Z",
        dueDate: "2024-01-12T18:00:00Z",
        priority: "high"
      },
      {
        id: "ai-6",
        task: "Prepare Q1 budget presentation",
        owner: "Lisa Wang",
        quote: "The board wants to see detailed projections for the first quarter, including headcount and infrastructure costs.",
        status: "pending",
        meetingId: "6",
        meetingTitle: "All Hands Meeting",
        createdAt: "2024-01-17T15:30:00Z",
        dueDate: "2024-01-25T14:00:00Z",
        priority: "medium"
      },
      {
        id: "ai-7",
        task: "Update API documentation",
        owner: "James Wilson",
        quote: "Our API docs are outdated and developers are getting confused. Let's make sure everything is current.",
        status: "pending",
        meetingId: "4",
        meetingTitle: "Sprint Planning",
        createdAt: "2024-01-12T10:00:00Z",
        dueDate: "2024-01-22T17:00:00Z",
        priority: "low"
      },
      {
        id: "ai-8",
        task: "Conduct user interviews for new feature",
        owner: "Maria Garcia",
        quote: "We should validate our assumptions with real users before we invest too much in development.",
        status: "completed",
        meetingId: "2",
        meetingTitle: "Product Roadmap Review",
        createdAt: "2024-01-14T14:45:00Z",
        dueDate: "2024-01-21T12:00:00Z",
        priority: "medium"
      },
      {
        id: "ai-9",
        task: "Set up monitoring for new deployment",
        owner: "Robert Brown",
        quote: "We need proper alerting in place before we go live. Can't afford any downtime on this release.",
        status: "pending",
        meetingId: "5",
        meetingTitle: "Bug Triage Meeting",
        createdAt: "2024-01-11T11:45:00Z",
        dueDate: "2024-01-16T16:00:00Z",
        priority: "high"
      },
      {
        id: "ai-10",
        task: "Review and approve marketing copy",
        owner: "Jennifer Lee",
        quote: "The marketing team needs our technical review on the new product descriptions to ensure accuracy.",
        status: "pending",
        meetingId: "1",
        meetingTitle: "Weekly Team Standup",
        createdAt: "2024-01-15T10:45:00Z",
        dueDate: "2024-01-18T15:00:00Z",
        priority: "low"
      }
      ]
      return NextResponse.json(mockActionItems)
    }

    return NextResponse.json(actionItems)
  } catch (error) {
    console.error("Error fetching action items:", error)
    return NextResponse.json({ error: "Failed to fetch action items" }, { status: 500 })
  }
} 