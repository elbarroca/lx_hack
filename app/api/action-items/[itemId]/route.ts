import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { status } = await request.json()
    const { itemId } = await params

    // Validate status
    if (!["pending", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update the action item in the database
    const { error: updateError } = await supabase
      .from("action_items")
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq("id", itemId)

    if (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.json({ error: "Failed to update action item" }, { status: 500 })
    }

    return NextResponse.json({ 
      id: itemId, 
      status,
      message: "Action item updated successfully" 
    })
  } catch (error) {
    console.error("Error updating action item:", error)
    return NextResponse.json({ error: "Failed to update action item" }, { status: 500 })
  }
} 