"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Bot, Clock, Filter, Bell, Brain, X, Plus } from "lucide-react"

interface AutomationRules {
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

interface AutomationRulesTabProps {
  automationRules: AutomationRules
  onUpdate: (rules: AutomationRules) => void
}

export default function AutomationRulesTab({ automationRules, onUpdate }: AutomationRulesTabProps) {
  const [newIgnoreTitle, setNewIgnoreTitle] = useState("")
  const [newRequiredAttendee, setNewRequiredAttendee] = useState("")

  const updateRule = (path: string, value: string | number | boolean | string[]) => {
    const keys = path.split(".")
    const newRules = { ...automationRules }
    let current: Record<string, unknown> = newRules

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] as Record<string, unknown>
    }
    current[keys[keys.length - 1]] = value

    onUpdate(newRules)
  }

  const addIgnoreTitle = () => {
    if (newIgnoreTitle.trim()) {
      updateRule("ignoreMeetingsTitled", [...automationRules.ignoreMeetingsTitled, newIgnoreTitle.trim()])
      setNewIgnoreTitle("")
    }
  }

  const removeIgnoreTitle = (index: number) => {
    const newList = automationRules.ignoreMeetingsTitled.filter((_, i) => i !== index)
    updateRule("ignoreMeetingsTitled", newList)
  }

  const addRequiredAttendee = () => {
    if (newRequiredAttendee.trim()) {
      updateRule("onlyJoinMeetingsWith", [...automationRules.onlyJoinMeetingsWith, newRequiredAttendee.trim()])
      setNewRequiredAttendee("")
    }
  }

  const removeRequiredAttendee = (index: number) => {
    const newList = automationRules.onlyJoinMeetingsWith.filter((_, i) => i !== index)
    updateRule("onlyJoinMeetingsWith", newList)
  }

  return (
    <div className="space-y-6">
      {/* Meeting Participation Rules */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-green-500" />
            Meeting Participation
          </CardTitle>
          <CardDescription>Configure when your AI agent should join meetings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Join when I&apos;m the organizer</Label>
              <p className="text-sm text-gray-400">Automatically join meetings you organize</p>
            </div>
            <Switch
              checked={automationRules.joinWhenOrganizer}
              onCheckedChange={(checked) => updateRule("joinWhenOrganizer", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Join when I&apos;m an attendee</Label>
              <p className="text-sm text-gray-400">Automatically join meetings I&apos;m invited to</p>
            </div>
            <Switch
              checked={automationRules.joinWhenAttendee}
              onCheckedChange={(checked) => updateRule("joinWhenAttendee", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Meeting Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-green-500" />
            Meeting Filters
          </CardTitle>
          <CardDescription>Set rules for which meetings to ignore or prioritize</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base">Ignore meetings titled</Label>
            <p className="text-sm text-gray-400">Skip meetings with these titles (case-insensitive)</p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., &apos;Daily Standup&apos;, &apos;Coffee Chat&apos;"
                value={newIgnoreTitle}
                onChange={(e) => setNewIgnoreTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addIgnoreTitle()}
                className="bg-gray-800 border-gray-700 focus:border-green-500"
              />
              <Button onClick={addIgnoreTitle} size="sm" className="bg-green-500 hover:bg-green-600 text-black">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {automationRules.ignoreMeetingsTitled.map((title, index) => (
                <Badge key={index} variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                  {title}
                  <button onClick={() => removeIgnoreTitle(index)} className="ml-2 hover:text-red-300">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base">Only join meetings with</Label>
            <p className="text-sm text-gray-400">Only join meetings that include these attendees</p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., &apos;john@company.com&apos;, &apos;Sarah&apos;"
                value={newRequiredAttendee}
                onChange={(e) => setNewRequiredAttendee(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addRequiredAttendee()}
                className="bg-gray-800 border-gray-700 focus:border-green-500"
              />
              <Button onClick={addRequiredAttendee} size="sm" className="bg-green-500 hover:bg-green-600 text-black">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {automationRules.onlyJoinMeetingsWith.map((attendee, index) => (
                <Badge key={index} variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                  {attendee}
                  <button onClick={() => removeRequiredAttendee(index)} className="ml-2 hover:text-green-300">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum meeting duration (minutes)</Label>
              <Input
                type="number"
                min="1"
                max="480"
                value={automationRules.minimumMeetingDuration}
                onChange={(e) => updateRule("minimumMeetingDuration", Number.parseInt(e.target.value) || 0)}
                className="bg-gray-800 border-gray-700 focus:border-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum meeting duration (minutes)</Label>
              <Input
                type="number"
                min="1"
                max="480"
                value={automationRules.maximumMeetingDuration}
                onChange={(e) => updateRule("maximumMeetingDuration", Number.parseInt(e.target.value) || 0)}
                className="bg-gray-800 border-gray-700 focus:border-green-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            Working Hours
          </CardTitle>
          <CardDescription>Limit AI agent activity to your working hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable working hours restriction</Label>
              <p className="text-sm text-gray-400">Only join meetings during specified hours</p>
            </div>
            <Switch
              checked={automationRules.workingHours.enabled}
              onCheckedChange={(checked) => updateRule("workingHours.enabled", checked)}
            />
          </div>

          {automationRules.workingHours.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start time</Label>
                <Input
                  type="time"
                  value={automationRules.workingHours.start}
                  onChange={(e) => updateRule("workingHours.start", e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label>End time</Label>
                <Input
                  type="time"
                  value={automationRules.workingHours.end}
                  onChange={(e) => updateRule("workingHours.end", e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={automationRules.workingHours.timezone}
                  onValueChange={(value) => updateRule("workingHours.timezone", value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 focus:border-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-500" />
            Notifications
          </CardTitle>
          <CardDescription>Configure how you receive meeting insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Slack summaries</Label>
              <p className="text-sm text-gray-400">Send meeting summaries to Slack</p>
            </div>
            <Switch
              checked={automationRules.notifications.slackSummary}
              onCheckedChange={(checked) => updateRule("notifications.slackSummary", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email summaries</Label>
              <p className="text-sm text-gray-400">Send meeting summaries via email</p>
            </div>
            <Switch
              checked={automationRules.notifications.emailSummary}
              onCheckedChange={(checked) => updateRule("notifications.emailSummary", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Real-time alerts</Label>
              <p className="text-sm text-gray-400">Get notified when action items are created</p>
            </div>
            <Switch
              checked={automationRules.notifications.realTimeAlerts}
              onCheckedChange={(checked) => updateRule("notifications.realTimeAlerts", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-green-500" />
            AI Analysis Settings
          </CardTitle>
          <CardDescription>Customize how your AI agent analyzes meetings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Summary length</Label>
            <Select
              value={automationRules.aiSettings.summaryLength}
              onValueChange={(value) => updateRule("aiSettings.summaryLength", value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 focus:border-green-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="brief">Brief (1-2 paragraphs)</SelectItem>
                <SelectItem value="detailed">Detailed (3-4 paragraphs)</SelectItem>
                <SelectItem value="comprehensive">Comprehensive (Full analysis)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Include full transcript</Label>
              <p className="text-sm text-gray-400">Attach complete meeting transcript to summaries</p>
            </div>
            <Switch
              checked={automationRules.aiSettings.includeTranscript}
              onCheckedChange={(checked) => updateRule("aiSettings.includeTranscript", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Sentiment analysis</Label>
              <p className="text-sm text-gray-400">Analyze the emotional tone of meetings</p>
            </div>
            <Switch
              checked={automationRules.aiSettings.sentimentAnalysis}
              onCheckedChange={(checked) => updateRule("aiSettings.sentimentAnalysis", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Action item extraction</Label>
              <p className="text-sm text-gray-400">Automatically identify and track action items</p>
            </div>
            <Switch
              checked={automationRules.aiSettings.actionItemExtraction}
              onCheckedChange={(checked) => updateRule("aiSettings.actionItemExtraction", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
