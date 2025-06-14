"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback and exchange code for session
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          router.push("/auth/login?error=oauth_failed")
          return
        }

        if (data.session) {
          console.log("✅ OAuth successful, checking setup status...")
          
          // Check if user has completed setup
          try {
            const response = await fetch("/api/user/setup-status")
            
            if (response.ok) {
              const { setupCompleted } = await response.json()
              
              if (setupCompleted) {
                // Setup is complete, go to dashboard
                console.log("✅ Setup completed, redirecting to dashboard")
                router.push("/dashboard")
              } else {
                // Setup not complete, go to setup page
                console.log("⚙️ Setup needed, redirecting to setup")
                router.push("/auth/setup")
              }
            } else {
              // If we can't check setup status, assume setup is needed
              console.log("⚙️ Cannot check setup status, redirecting to setup")
              router.push("/auth/setup")
            }
          } catch (setupError) {
            console.error("Error checking setup status:", setupError)
            // If setup check fails, go to setup to be safe
            router.push("/auth/setup")
          }
        } else {
          // No session, redirect to login
          console.log("❌ No session found")
          router.push("/auth/login?error=no_session")
        }
      } catch (error) {
        console.error("Unexpected error in auth callback:", error)
        router.push("/auth/login?error=oauth_failed")
      }
    }

    handleAuthCallback()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Completing authentication...</p>
        <p className="text-sm text-gray-500 mt-2">Setting up your account...</p>
      </div>
    </div>
  )
}
