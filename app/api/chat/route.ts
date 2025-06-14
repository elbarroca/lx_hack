import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { mockUser, mockUpcomingMeetings, mockPastMeetings, mockStats } from '@/lib/mock-data'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ChatMessage {
  sender: 'user' | 'ai'
  content: string
}

interface ChatRequest {
  message: string
  conversationHistory?: ChatMessage[]
}

// Create embedded context about Ricardo's meetings and portfolio
const createEmbeddedContext = () => {
  const upcomingMeetingsContext = mockUpcomingMeetings.map(meeting => 
    `- ${meeting.summary} (${new Date(meeting.start.dateTime).toLocaleDateString()}) with ${meeting.attendees?.map(a => a.displayName).join(', ')}`
  ).join('\n')

  const pastMeetingsContext = mockPastMeetings.map(meeting => 
    `- ${meeting.summary} (${new Date(meeting.start.dateTime).toLocaleDateString()}) with ${meeting.attendees?.map(a => a.displayName).join(', ')}`
  ).join('\n')

  return `
CONTEXT: You are Ricardo's AI assistant for crypto investment management at CryptoVentures LLC.

USER PROFILE:
- Name: ${mockUser.name}
- Role: ${mockUser.role}
- Company: ${mockUser.company}
- Email: ${mockUser.email}

CURRENT PORTFOLIO STATS:
- Meetings this week: ${mockStats.meetingsThisWeek}
- Action items pending: ${mockStats.actionItemsAssigned}
- Portfolio sentiment: ${mockStats.avgSentiment}
- Total meeting hours: ${mockStats.totalMeetingHours}

UPCOMING MEETINGS:
${upcomingMeetingsContext}

RECENT PAST MEETINGS:
${pastMeetingsContext}

INSTRUCTIONS:
- You are an expert crypto investment AI assistant
- Provide detailed, actionable insights about crypto investments
- Reference specific meetings and attendees when relevant
- Use crypto terminology appropriately (DeFi, staking, halving, etc.)
- Format responses with emojis and structured information
- Focus on investment analysis, risk assessment, and meeting preparation
- Always be professional but conversational
- If asked about meetings, reference the actual meeting data above
- Provide specific recommendations based on Ricardo's portfolio context
`
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, conversationHistory = [] } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Create the system prompt with embedded context
    const systemPrompt = createEmbeddedContext()

    // Prepare messages for OpenAI
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: ChatMessage): OpenAI.Chat.Completions.ChatCompletionMessageParam => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({ 
      response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Fallback response if OpenAI fails
    const fallbackResponse = `🚀 **Crypto Portfolio Assistant**

I'm having trouble connecting to my advanced AI systems right now, but I can still help you with:

• **Investment Analysis**: Bitcoin, Ethereum, DeFi protocols
• **Meeting Preparation**: Your upcoming Bitcoin Strategy Review
• **Portfolio Insights**: Current allocation and performance
• **Risk Assessment**: Market trends and compliance

**Quick Update:**
• Next meeting: Bitcoin Strategy Review (2 hours)
• Portfolio sentiment: Positive
• Action items: 8 pending

What specific aspect would you like to explore?`

    return NextResponse.json({ 
      response: fallbackResponse,
      timestamp: new Date().toISOString(),
      fallback: true
    })
  }
} 