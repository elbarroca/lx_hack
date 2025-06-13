"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LoginForm } from "@/components/login-form"
import SetupModal from "@/components/dashboard/setup-modal"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // User is already logged in, check setup status
        await handlePostLogin(user.email || "")
      }
    }
    checkAuth()
  }, [])

  const handleLoginSuccess = async (email: string) => {
    setUser({ email })
    await handlePostLogin(email)
  }

  const handlePostLogin = async (email: string) => {
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
  }

  const handleSetupComplete = () => {
    setShowSetupModal(false)
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-black">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Setting up your account...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-black">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to Veritas AI</h1>
            <p className="text-gray-400">Sign in to access your meeting intelligence</p>
          </div>
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
      
      {showSetupModal && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <SetupModal isOpen={showSetupModal} onComplete={handleSetupComplete} />
        </div>
      )}
    </>
  )
}
