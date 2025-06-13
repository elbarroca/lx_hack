"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import SetupModal from "@/components/dashboard/setup-modal"
import { Loader2 } from "lucide-react"

export default function SetupPage() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: userData, error: authError } = await supabase.auth.getUser()

        if (authError || !userData?.user) {
          router.push("/auth/login")
          return
        }

        setUser({ email: userData.user.email || "" })
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/auth/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  const handleSetupComplete = () => {
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading setup...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-black">
      <SetupModal isOpen={true} onComplete={handleSetupComplete} />
    </div>
  )
} 