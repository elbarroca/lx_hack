"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import IntegrationCard from "./integration-card"
import { Key, Calendar, MessageSquare, Zap } from "lucide-react"

interface IntegrationsTabProps {
  integrations: {
    vexa: {
      apiKey: string
      isConnected: boolean
    }
    openai: {
      apiKey: string
      isConnected: boolean
    }
    google: {
      isConnected: boolean
      email?: string
    }
    slack: {
      isConnected: boolean
      workspaceName?: string
    }
  }
  onUpdate: (integrations: any) => void
}

export default function IntegrationsTab({ integrations, onUpdate }: IntegrationsTabProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const handleVexaConnect = async (apiKey: string) => {
    setIsConnecting("vexa")
    try {
      // Validate Vexa API key
      const response = await fetch("/api/integrations/vexa/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      })

      if (response.ok) {
        onUpdate({
          ...integrations,
          vexa: { apiKey, isConnected: true },
        })
      } else {
        throw new Error("Invalid API key")
      }
    } catch (error) {
      console.error("Error connecting Vexa:", error)
    } finally {
      setIsConnecting(null)
    }
  }

  const handleOpenAIConnect = async (apiKey: string) => {
    setIsConnecting("openai")
    try {
      // Validate OpenAI API key
      const response = await fetch("/api/integrations/openai/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      })

      if (response.ok) {
        onUpdate({
          ...integrations,
          openai: { apiKey, isConnected: true },
        })
      } else {
        throw new Error("Invalid API key")
      }
    } catch (error) {
      console.error("Error connecting OpenAI:", error)
    } finally {
      setIsConnecting(null)
    }
  }

  const handleGoogleConnect = async () => {
    setIsConnecting("google")
    try {
      // Redirect to Google OAuth
      window.location.href = "/api/integrations/google/connect"
    } catch (error) {
      console.error("Error connecting Google:", error)
      setIsConnecting(null)
    }
  }

  const handleSlackConnect = async () => {
    setIsConnecting("slack")
    try {
      // Redirect to Slack OAuth
      window.location.href = "/api/integrations/slack/connect"
    } catch (error) {
      console.error("Error connecting Slack:", error)
      setIsConnecting(null)
    }
  }

  const handleDisconnect = (integration: string) => {
    switch (integration) {
      case "vexa":
        onUpdate({
          ...integrations,
          vexa: { apiKey: "", isConnected: false },
        })
        break
      case "openai":
        onUpdate({
          ...integrations,
          openai: { apiKey: "", isConnected: false },
        })
        break
      case "google":
        onUpdate({
          ...integrations,
          google: { isConnected: false },
        })
        break
      case "slack":
        onUpdate({
          ...integrations,
          slack: { isConnected: false },
        })
        break
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-green-500" />
            API Integrations
          </CardTitle>
          <CardDescription>Connect your AI services to enable autonomous meeting intelligence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <IntegrationCard
            name="Vexa API"
            description="Real-time transcription and speaker identification"
            icon={<Zap className="w-6 h-6" />}
            isConnected={integrations.vexa.isConnected}
            connectionInfo={integrations.vexa.isConnected ? "Connected and validated" : undefined}
            onConnect={handleVexaConnect}
            onDisconnect={() => handleDisconnect("vexa")}
            isConnecting={isConnecting === "vexa"}
            inputType="apiKey"
            placeholder="Enter your Vexa API key"
            currentValue={integrations.vexa.apiKey}
          />

          <IntegrationCard
            name="OpenAI"
            description="AI-powered analysis, summaries, and action item extraction"
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
              </svg>
            }
            isConnected={integrations.openai.isConnected}
            connectionInfo={integrations.openai.isConnected ? "Connected and validated" : undefined}
            onConnect={handleOpenAIConnect}
            onDisconnect={() => handleDisconnect("openai")}
            isConnecting={isConnecting === "openai"}
            inputType="apiKey"
            placeholder="Enter your OpenAI API key"
            currentValue={integrations.openai.apiKey}
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            Platform Integrations
          </CardTitle>
          <CardDescription>Connect your productivity tools for seamless automation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <IntegrationCard
            name="Google Calendar"
            description="Access your calendar to identify and join meetings automatically"
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 3h-1V1.5a.5.5 0 0 0-1 0V3h-11V1.5a.5.5 0 0 0-1 0V3h-1A2.5 2.5 0 0 0 2 5.5v13A2.5 2.5 0 0 0 4.5 21h15a2.5 2.5 0 0 0 2.5-2.5v-13A2.5 2.5 0 0 0 19.5 3zM21 18.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5V8h18v10.5zM21 7H3V5.5A1.5 1.5 0 0 1 4.5 4h1v1.5a.5.5 0 0 0 1 0V4h11v1.5a.5.5 0 0 0 1 0V4h1A1.5 1.5 0 0 1 21 5.5V7z" />
              </svg>
            }
            isConnected={integrations.google.isConnected}
            connectionInfo={
              integrations.google.isConnected && integrations.google.email
                ? `Connected as ${integrations.google.email}`
                : undefined
            }
            onConnect={handleGoogleConnect}
            onDisconnect={() => handleDisconnect("google")}
            isConnecting={isConnecting === "google"}
            inputType="oauth"
          />

          <IntegrationCard
            name="Slack"
            description="Receive meeting summaries and action items in your Slack workspace"
            icon={<MessageSquare className="w-6 h-6" />}
            isConnected={integrations.slack.isConnected}
            connectionInfo={
              integrations.slack.isConnected && integrations.slack.workspaceName
                ? `Connected to ${integrations.slack.workspaceName}`
                : undefined
            }
            onConnect={handleSlackConnect}
            onDisconnect={() => handleDisconnect("slack")}
            isConnecting={isConnecting === "slack"}
            inputType="oauth"
          />
        </CardContent>
      </Card>
    </div>
  )
}
