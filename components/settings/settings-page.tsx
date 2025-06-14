"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Settings, Save, Loader2 } from "lucide-react"
import IntegrationsTab from "./integrations-tab"
import AutomationRulesTab from "./automation-rules-tab"

interface UserSettings {
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
  automationRules: {
    joinWhenOrganizer: boolean
    joinWhenAttendee: boolean
    ignoreMeetingsTitled: string[]
    onlyJoinMeetingsWith: string[]
    minimumMeetingDuration: number
    maximumMeetingDuration: number
    workingHours: {
      enabled: boolean
      start: string
      end: string
      timezone: string
    }
    notifications: {
      slackSummary: boolean
      emailSummary: boolean
      realTimeAlerts: boolean
    }
    aiSettings: {
      summaryLength: "brief" | "detailed" | "comprehensive"
      includeTranscript: boolean
      sentimentAnalysis: boolean
      actionItemExtraction: boolean
    }
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [originalSettings, setOriginalSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
          setOriginalSettings(JSON.parse(JSON.stringify(data))) // Deep clone
        } else {
          toast({
            title: "Error",
            description: "Failed to load settings",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [toast])

  // Check for changes whenever settings update
  useEffect(() => {
    if (settings && originalSettings) {
      const hasChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings)
      setHasChanges(hasChanged)
    }
  }, [settings, originalSettings])

  const handleSaveSettings = async () => {
    if (!settings || !hasChanges) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        setOriginalSettings(JSON.parse(JSON.stringify(updatedSettings)))
        setHasChanges(false)
        toast({
          title: "Settings Saved!",
          description: "Your automation preferences have been updated.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to save settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetChanges = () => {
    if (originalSettings) {
      setSettings(JSON.parse(JSON.stringify(originalSettings)))
      setHasChanges(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your settings...</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load settings. Please refresh the page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-green-500" />
            Settings
          </h1>
          <p className="text-gray-400 mt-1">Configure your AI automation preferences and integrations</p>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleResetChanges} disabled={isSaving}>
              Reset Changes
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={!hasChanges || isSaving}
              className="bg-green-500 hover:bg-green-600 text-black font-medium"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-800">
          <TabsTrigger value="integrations" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
            Integrations
          </TabsTrigger>
          <TabsTrigger value="automation" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
            Automation Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <IntegrationsTab
            integrations={settings.integrations}
            onUpdate={(newIntegrations) =>
              setSettings((prev) => (prev ? { ...prev, integrations: newIntegrations } : null))
            }
          />
        </TabsContent>

        <TabsContent value="automation">
          <AutomationRulesTab
            automationRules={settings.automationRules}
            onUpdate={(newRules) => setSettings((prev) => (prev ? { ...prev, automationRules: newRules } : null))}
          />
        </TabsContent>
      </Tabs>

      {/* Floating save button for mobile */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 md:hidden">
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges || isSaving}
            className="bg-green-500 hover:bg-green-600 text-black font-medium shadow-lg"
            size="lg"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </div>
  )
}
