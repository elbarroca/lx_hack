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
    const { vexaApiKey } = await request.json()

    if (!vexaApiKey) {
      return NextResponse.json({ error: "Vexa API key is required" }, { status: 400 })
    }

    // Validate API key format (basic validation)
    if (vexaApiKey.length < 10) {
      return NextResponse.json({ error: "Invalid API key format" }, { status: 400 })
    }

    const userEmail = userData.user.email

    // Update user with vexa_api_key in the users table
    const { error: dbError } = await supabase
      .from("users")
      .upsert({
        id: userData.user.id,
        email: userEmail,
        vexa_api_key: vexaApiKey, // In production, encrypt this
        updated_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save API key" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
