import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    // Check if user exists in the users table and has completed setup
    const { data: userData, error: dbError } = await supabase
      .from("users")
      .select("id, email, vexa_api_key")
      .eq("email", authData.user.email)
      .single()

    let setupCompleted = false

    if (userData && userData.vexa_api_key) {
      setupCompleted = true
    } else if (!userData) {
      // User doesn't exist in users table, create them
      const { error: insertError } = await supabase
        .from("users")
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            vexa_api_key: null,
          }
        ])

      if (insertError) {
        console.error("Error creating user:", insertError)
        // Continue anyway, setup will handle this
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: authData.user.id,
        email: authData.user.email
      },
      setupCompleted 
    })

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 