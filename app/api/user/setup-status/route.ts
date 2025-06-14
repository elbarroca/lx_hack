import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {

  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = userData.user.email

    // Check if user has completed setup by checking if they have a vexa_api_key
    const { data: userRecord, error: dbError } = await supabase
      .from("users")
      .select("vexa_api_key")
      .eq("email", userEmail)
      .single()

    if (dbError && dbError.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected for new users
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to check setup status" }, { status: 500 })
    }

    const setupCompleted = !!(userRecord?.vexa_api_key)

    return NextResponse.json({ setupCompleted })
  } catch (error) {
    console.error("Setup status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
