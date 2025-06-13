import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { vexaApiKey, openaiApiKey } = await request.json()

    if (!vexaApiKey || !openaiApiKey) {
      return NextResponse.json({ error: "Both API keys are required" }, { status: 400 })
    }

    // Validate API key formats (basic validation)
    if (vexaApiKey.length < 10 || openaiApiKey.length < 10) {
      return NextResponse.json({ error: "Invalid API key format" }, { status: 400 })
    }

    const userId = userData.user.id

    // Insert or update user setup in the database
    const { error: dbError } = await supabase.from("user_settings").upsert({
      user_id: userId,
      vexa_api_key: vexaApiKey, // In production, encrypt this
      openai_api_key: openaiApiKey, // In production, encrypt this
      setup_completed: true,
      setup_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
