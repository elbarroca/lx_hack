import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { meetingId } = await params

  try {
    // For demonstration, return mock data
    const mockData = {
      id: meetingId,
      title: "Weekly Team Standup",
      date: "2024-01-15T10:00:00Z",
      participantCount: 6,
      analysis: {
        summary: "This was a productive weekly standup meeting where the team discussed current sprint progress, upcoming deadlines, and resource allocation. Key decisions were made regarding the new feature rollout and bug prioritization. The team showed good alignment on priorities and demonstrated strong collaboration throughout the discussion.",
        keyTopics: [
          "Sprint Progress Review",
          "New Feature Rollout", 
          "Bug Prioritization",
          "Resource Allocation",
          "Timeline Adjustments",
          "Team Collaboration"
        ],
        sentiment: {
          overall: "Positive",
          score: 8.2
        },
        transcript: [
          {
            speaker: "Sarah Johnson",
            text: "Good morning everyone! Let's start with our sprint progress. How are we tracking against our goals?",
            timestamp: "00:00:15"
          },
          {
            speaker: "Mike Chen", 
            text: "We're about 80% complete on the user authentication feature. Should be ready for testing by Wednesday.",
            timestamp: "00:00:32"
          },
          {
            speaker: "Emily Rodriguez",
            text: "Great! I've been working on the UI components and they're looking good. I'll need the API endpoints to be ready for integration testing.",
            timestamp: "00:01:05"
          },
          {
            speaker: "David Kim",
            text: "The API is almost done. I just need to finish the error handling and documentation. Should be ready by tomorrow.",
            timestamp: "00:01:28"
          },
          {
            speaker: "Sarah Johnson",
            text: "Perfect. What about the bug fixes? Alex, how are we doing on the critical issues?",
            timestamp: "00:01:45"
          },
          {
            speaker: "Alex Thompson",
            text: "I've resolved the payment processing bug that was blocking our biggest client. The fix is deployed and they've confirmed it's working.",
            timestamp: "00:02:02"
          }
        ]
      },
      actionItems: [
        {
          id: "ai-1",
          task: "Update the project timeline and share with stakeholders",
          owner: "Sarah Johnson",
          quote: "We need to make sure everyone is aligned on the new deadlines, especially after the scope changes we discussed.",
          status: "pending"
        },
        {
          id: "ai-2", 
          task: "Complete API documentation for authentication endpoints",
          owner: "David Kim",
          quote: "I just need to finish the error handling and documentation. Should be ready by tomorrow.",
          status: "pending"
        },
        {
          id: "ai-3",
          task: "Schedule planning session for scope review", 
          owner: "Sarah Johnson",
          quote: "Let's schedule a separate planning session to review the scope changes.",
          status: "pending"
        },
        {
          id: "ai-4",
          task: "Plan limited beta test for new feature",
          owner: "Emily Rodriguez", 
          quote: "Maybe we can do a limited beta test first before the full rollout?",
          status: "pending"
        }
      ]
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Error fetching meeting data:", error)
    return NextResponse.json({ error: "Failed to fetch meeting data" }, { status: 500 })
  }
} 