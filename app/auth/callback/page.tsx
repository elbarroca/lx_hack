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
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          router.push("/auth/login?error=oauth_failed")
          return
        }

        if (data.session) {
          // User is authenticated, redirect to login page which will handle setup check
          router.push("/auth/login")
        } else {
          // No session, redirect to login
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
      </div>
    </div>
  )
}
