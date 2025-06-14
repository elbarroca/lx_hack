"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SetupModal from "@/components/dashboard/setup-modal"
import { Calendar, Chrome, Loader2, Key } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const error = searchParams.get("error")

  const handlePostLogin = useCallback(async () => {
    setIsLoading(true)
    try {
      // Check setup status
      const response = await fetch("/api/user/setup-status")
      if (response.ok) {
        const { setupCompleted } = await response.json()

        if (setupCompleted) {
          // Setup is complete, redirect to dashboard
          router.push("/dashboard")
        } else {
          // Setup is not complete, show setup modal
          setShowSetupModal(true)
        }
      } else {
        // If we can't check setup status, assume setup is needed
        setShowSetupModal(true)
      }
    } catch (error) {
      console.error("Error checking setup status:", error)
      setShowSetupModal(true)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          // User is already logged in, check setup status
          await handlePostLogin()
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [handlePostLogin, supabase.auth])

  // Listen for auth state changes (when user returns from Google OAuth)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await handlePostLogin()
      }
    })

    return () => subscription.unsubscribe()
  }, [handlePostLogin, supabase.auth])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/calendar.readonly",
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
    }
  }

  const handleSetupComplete = () => {
    setShowSetupModal(false)
    router.push("/dashboard")
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Connecting to Google...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <Calendar className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Welcome to Veritas AI</CardTitle>
            <CardDescription className="text-gray-400">
              Connect your Google Calendar to start capturing meeting intelligence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
                {error === "oauth_failed" && "Authentication failed. Please try again."}
                {error === "no_code" && "Authorization was cancelled."}
                {error === "access_denied" && "Access was denied. Please grant calendar permissions."}
                {error &&
                  !["oauth_failed", "no_code", "access_denied"].includes(error) &&
                  "An error occurred during login."}
              </div>
            )}

            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 text-base font-medium bg-green-500 hover:bg-green-600 text-black"
              size="lg"
            >
              <Chrome className="mr-2 h-5 w-5" />
              {isLoading ? "Connecting..." : "Continue with Google Calendar"}
            </Button>

            <div className="text-center text-sm text-gray-400">
              <p className="mb-3">We&apos;ll access your calendar to:</p>
              <ul className="space-y-2 text-xs text-gray-500">
                <li className="flex items-center justify-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  View your upcoming meetings
                </li>
                <li className="flex items-center justify-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  Sync meeting details automatically
                </li>
                <li className="flex items-center justify-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  Deploy AI agents to capture insights
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Key className="w-3 h-3" />
                <span>After signing in, you&apos;ll configure your AI agent settings</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showSetupModal && <SetupModal isOpen={showSetupModal} onComplete={handleSetupComplete} />}
    </>
  )
}
