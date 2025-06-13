"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, Shield, AlertCircle } from "lucide-react"

interface SetupModalProps {
  isOpen: boolean
  onComplete: () => void
}

export default function SetupModal({ isOpen, onComplete }: SetupModalProps) {
  const [vexaApiKey, setVexaApiKey] = useState("")
  const [hasConsented, setHasConsented] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!vexaApiKey.trim()) {
      setError("Vexa API key is required")
      return
    }

    if (!hasConsented) {
      setError("You must agree to the terms to continue")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/user/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vexaApiKey: vexaApiKey.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save API key")
      }

      // Mark setup as complete and close modal
      onComplete()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Key className="w-5 h-5 text-green-500" />
            Setup Your AI Agent
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure your Vexa API key to enable Veritas AI's autonomous meeting intelligence.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vexa-key" className="text-sm font-medium">
                Vexa API Key
              </Label>
              <Input
                id="vexa-key"
                type="password"
                placeholder="Enter your Vexa API key"
                value={vexaApiKey}
                onChange={(e) => setVexaApiKey(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-green-500"
                required
              />
              <p className="text-xs text-gray-400">Used for real-time transcription and speaker identification</p>
            </div>
          </div>

          <Alert className="bg-blue-500/10 border-blue-500/20">
            <Shield className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-200">
              <strong>Security Notice:</strong> Your API key is encrypted and stored securely. We never share your
              key or use it for any purpose other than your meeting analysis.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent"
                checked={hasConsented}
                onCheckedChange={(checked) => setHasConsented(checked as boolean)}
                className="mt-1 border-gray-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="consent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the terms and conditions
                </Label>
                <p className="text-xs text-gray-400 leading-relaxed">
                  By clicking "Save API Key", you authorize Veritas AI to:
                  <br />• Join your scheduled meetings as an autonomous agent
                  <br />• Access your calendar to identify meeting times
                  <br />• Process meeting audio for transcription and analysis
                  <br />• Store meeting data securely for your intelligence dashboard
                </p>
              </div>
            </div>
          </div>

          {error && (
            <Alert className="bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading || !hasConsented}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black font-medium"
            >
              {isLoading ? "Setting up..." : "Save API Key & Continue"}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-400">
            Need help finding your API key?{" "}
            <a href="#" className="text-green-500 hover:underline">
              View setup guide
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
