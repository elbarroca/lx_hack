"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Bot, User } from "lucide-react"
import { mockChatMessages } from "@/lib/mock-data"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(mockChatMessages)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsLoading(true)

    try {
      // Make API call to the chat endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "ai",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      
      // Fallback message if API fails
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "🚀 **Connection Issue**\n\nI'm having trouble connecting right now, but I'm still here to help with your crypto portfolio and meetings. Please try again in a moment!",
        sender: "ai",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting for better display
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <Card className="bg-gray-900 border-gray-800 h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-green-500" />
          AI Assistant
        </CardTitle>
        <p className="text-sm text-gray-400">Ask questions about your meetings and data</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === "user" ? "bg-green-500/20 text-green-500" : "bg-blue-500/20 text-blue-500"
                }`}
              >
                {message.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-green-500/10 border border-green-500/20 text-green-100"
                    : "bg-gray-800 border border-gray-700 text-gray-300"
                }`}
              >
                <div 
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your meetings..."
              className="bg-gray-800 border-gray-700 focus:border-green-500 text-white placeholder:text-gray-400"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-green-500 hover:bg-green-600 text-black"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
