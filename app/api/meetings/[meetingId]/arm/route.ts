import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { meetingId: string } }) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { meetingId } = params
  const { armed } = await request.json()

  try {
    // In a real implementation, you would:
    // 1. Store the armed status in your database
    // 2. Set up the AI agent to join the meeting when it starts
    // 3. Configure any necessary webhooks or scheduled tasks

    console.log(`Meeting ${meetingId} armed status set to: ${armed}`)

    return NextResponse.json({ success: true, armed })
  } catch (error) {
    console.error("Error setting meeting armed status:", error)
    return NextResponse.json({ error: "Failed to update meeting status" }, { status: 500 })
  }
}
