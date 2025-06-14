"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react"
import type { ReactNode } from "react"

interface IntegrationCardProps {
  name: string
  description: string
  icon: ReactNode
  isConnected: boolean
  connectionInfo?: string
  onConnect: (value?: string) => void | Promise<void>
  onDisconnect: () => void
  isConnecting: boolean
  inputType: "apiKey" | "oauth"
  placeholder?: string
}

export default function IntegrationCard({
  name,
  description,
  icon,
  isConnected,
  connectionInfo,
  onConnect,
  onDisconnect,
  isConnecting,
  inputType,
  placeholder,
}: IntegrationCardProps) {
  const [inputValue, setInputValue] = useState("")
  const [showInput, setShowInput] = useState(false)

  const handleConnect = async () => {
    if (inputType === "apiKey") {
      if (!inputValue.trim()) {
        setShowInput(true)
        return
      }
      await onConnect(inputValue.trim())
      setInputValue("")
      setShowInput(false)
    } else {
      await onConnect()
    }
  }

  const handleDisconnect = () => {
    onDisconnect()
    setShowInput(false)
    setInputValue("")
  }

  return (
    <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-gray-300">{icon}</div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-white">{name}</h3>
          {isConnected ? (
            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-700 text-gray-300 border-gray-600">
              <XCircle className="w-3 h-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-400 mb-3">{description}</p>

        {isConnected && connectionInfo && <p className="text-xs text-green-400 mb-3">{connectionInfo}</p>}

        {!isConnected && showInput && inputType === "apiKey" && (
          <div className="mb-3">
            <Input
              type="password"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-gray-900 border-gray-600 focus:border-green-500 text-white"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleConnect()
                }
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={isConnecting}
              className="border-red-500/30 text-red-500 hover:bg-red-500/10"
            >
              Disconnect
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-green-500 hover:bg-green-600 text-black"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  {inputType === "oauth" && <ExternalLink className="w-4 h-4 mr-2" />}
                  Connect {name}
                </>
              )}
            </Button>
          )}

          {!isConnected && !showInput && inputType === "apiKey" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInput(true)}
              className="text-gray-400 hover:text-white"
            >
              Enter API Key
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
