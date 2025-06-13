import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
//   const supabase = await createClient()

//   // Check if user is authenticated
//   const { data: userData, error: authError } = await supabase.auth.getUser()

//   if (authError || !userData?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }

//   try {
//     const userId = userData.user.id

//     // Check if user has completed setup
//     const { data: userSettings, error: dbError } = await supabase
//       .from("user_settings")
//       .select("setup_completed")
//       .eq("user_id", userId)
//       .single()

//     if (dbError && dbError.code !== "PGRST116") {
//       // PGRST116 is "not found" error, which is expected for new users
//       console.error("Database error:", dbError)
//       return NextResponse.json({ error: "Failed to check setup status" }, { status: 500 })
//     }

//     const setupCompleted = userSettings?.setup_completed || false

//     return NextResponse.json({ setupCompleted })
    return NextResponse.json({ setupCompleted: true })
//   } catch (error) {
//     console.error("Setup status error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
}
