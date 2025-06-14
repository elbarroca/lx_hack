import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = userData.user.id

  try {
    // Get user settings from database
    const { data: userSettings, error: dbError } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (dbError && dbError.code !== "PGRST116") {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }

    // Default settings structure
    const defaultSettings = {
      integrations: {
        vexa: {
          apiKey: userSettings?.vexa_api_key || "",
          isConnected: !!userSettings?.vexa_api_key,
        },
        openai: {
          apiKey: userSettings?.openai_api_key || "",
          isConnected: !!userSettings?.openai_api_key,
        },
        google: {
          isConnected: !!userData.user.app_metadata?.provider === "google",
          email: userData.user.email,
        },
        slack: {
          isConnected: false, // Would check slack integration status
          workspaceName: undefined,
        },
      },
      automationRules: {
        joinWhenOrganizer: userSettings?.automation_rules?.joinWhenOrganizer ?? true,
        joinWhenAttendee: userSettings?.automation_rules?.joinWhenAttendee ?? false,
        ignoreMeetingsTitled: userSettings?.automation_rules?.ignoreMeetingsTitled ?? [],
        onlyJoinMeetingsWith: userSettings?.automation_rules?.onlyJoinMeetingsWith ?? [],
        minimumMeetingDuration: userSettings?.automation_rules?.minimumMeetingDuration ?? 15,
        maximumMeetingDuration: userSettings?.automation_rules?.maximumMeetingDuration ?? 120,
        workingHours: {
          enabled: userSettings?.automation_rules?.workingHours?.enabled ?? false,
          start: userSettings?.automation_rules?.workingHours?.start ?? "09:00",
          end: userSettings?.automation_rules?.workingHours?.end ?? "17:00",
          timezone: userSettings?.automation_rules?.workingHours?.timezone ?? "America/New_York",
        },
        notifications: {
          slackSummary: userSettings?.automation_rules?.notifications?.slackSummary ?? false,
          emailSummary: userSettings?.automation_rules?.notifications?.emailSummary ?? true,
          realTimeAlerts: userSettings?.automation_rules?.notifications?.realTimeAlerts ?? true,
        },
        aiSettings: {
          summaryLength: userSettings?.automation_rules?.aiSettings?.summaryLength ?? "detailed",
          includeTranscript: userSettings?.automation_rules?.aiSettings?.includeTranscript ?? false,
          sentimentAnalysis: userSettings?.automation_rules?.aiSettings?.sentimentAnalysis ?? true,
          actionItemExtraction: userSettings?.automation_rules?.aiSettings?.actionItemExtraction ?? true,
        },
      },
    }

    return NextResponse.json(defaultSettings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = userData.user.id

  try {
    const settings = await request.json()

    // Validate the settings structure
    if (!settings.integrations || !settings.automationRules) {
      return NextResponse.json({ error: "Invalid settings format" }, { status: 400 })
    }

    // Validate API keys if provided
    if (settings.integrations.vexa.apiKey && settings.integrations.vexa.apiKey.length < 10) {
      return NextResponse.json({ error: "Invalid Vexa API key format" }, { status: 400 })
    }

    if (settings.integrations.openai.apiKey && settings.integrations.openai.apiKey.length < 10) {
      return NextResponse.json({ error: "Invalid OpenAI API key format" }, { status: 400 })
    }

    // Update user settings in database
    const { error: dbError } = await supabase.from("user_settings").upsert({
      user_id: userId,
      vexa_api_key: settings.integrations.vexa.apiKey || null,
      openai_api_key: settings.integrations.openai.apiKey || null,
      automation_rules: settings.automationRules,
      updated_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
    }

    // Return the updated settings
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
