"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/dashboard/main-layout"
import SettingsPage from "@/components/settings/settings-page"
import { Loader2 } from "lucide-react"

export default function Settings() {
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
  }, [router, supabase.auth])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <MainLayout>
      <SettingsPage />
    </MainLayout>
  )
}
