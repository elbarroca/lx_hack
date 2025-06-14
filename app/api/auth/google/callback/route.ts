import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getGoogleTokens, getGoogleUserInfo, getCalendarEvents } from "@/lib/google-auth"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=no_code`)
  }

  try {
    // Exchange code for tokens
    const tokens = await getGoogleTokens(code)
    
    if (!tokens.access_token) {
      throw new Error("No access token received")
    }

    // Get user info from Google
    const userInfo = await getGoogleUserInfo(tokens.access_token)
    
    if (!userInfo.email) {
      throw new Error("No email received from Google")
    }

    const supabase = await createClient()

    // Create or update user in our database
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", userInfo.email)
      .single()

    let userId: string

    if (existingUser) {
      // Update existing user with Google tokens
      const { error: updateError } = await supabase
        .from("users")
        .update({
          google_calendar_token: JSON.stringify(tokens),
          calendar_email: userInfo.email,
          full_name: userInfo.name,
          updated_at: new Date().toISOString(),
        })
        .eq("email", userInfo.email)

      if (updateError) {
        console.error("Error updating user:", updateError)
        throw new Error("Failed to update user")
      }

      userId = existingUser.id
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            email: userInfo.email,
            google_calendar_token: JSON.stringify(tokens),
            calendar_email: userInfo.email,
            full_name: userInfo.name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single()

      if (insertError || !newUser) {
        console.error("Error creating user:", insertError)
        throw new Error("Failed to create user")
      }

      userId = newUser.id
    }

    // Fetch calendar events and save them as meetings
    try {
      const calendarData = await getCalendarEvents(tokens.access_token)
      
      if (calendarData.items && calendarData.items.length > 0) {
        const meetings = calendarData.items
          .filter(event => event.start?.dateTime && event.summary) // Only events with datetime and title
          .map(event => ({
            user_id: userId,
            native_meeting_id: event.id,
            meeting_title: event.summary,
            meeting_url: event.conferenceData?.entryPoints?.[0]?.uri || event.htmlLink,
            scheduled_at: event.start!.dateTime, // Safe because we filtered for this above
            status: 'detected',
            user_email: userInfo.email,
            is_instant: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))

        // Insert meetings (ignore duplicates)
        const { error: meetingsError } = await supabase
          .from("meetings")
          .upsert(meetings, { 
            onConflict: 'native_meeting_id,user_id',
            ignoreDuplicates: true 
          })

        if (meetingsError) {
          console.error("Error saving meetings:", meetingsError)
          // Don't throw here, just log the error
        }
      }
    } catch (calendarError) {
      console.error("Error fetching calendar events:", calendarError)
      // Don't throw here, just log the error
    }

    // Create Supabase auth session
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userInfo.email,
      password: `google_oauth_${userId}` // Temporary password for OAuth users
    })

    if (signInError) {
      // If sign in fails, try to create the auth user
      const { error: signUpError } = await supabase.auth.signUp({
        email: userInfo.email,
        password: `google_oauth_${userId}`,
        options: {
          data: {
            full_name: userInfo.name,
            avatar_url: userInfo.picture,
          }
        }
      })

      if (signUpError) {
        console.error("Error creating auth user:", signUpError)
        // Continue anyway, we have the user in our users table
      }
    }

    // Redirect to setup if no vexa_api_key, otherwise to dashboard
    const hasVexaKey = existingUser?.vexa_api_key || false
    const redirectUrl = hasVexaKey ? "/dashboard" : "/auth/setup"
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${redirectUrl}`)

  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=oauth_failed`)
  }
} 