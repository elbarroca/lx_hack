import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { createClient } from '../lib/supabase/server.js';
import OpenAI from 'openai';
import crypto from 'crypto';

// Initialize OpenAI client with error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

// Check if OpenAI API key is properly configured
const hasValidOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');

// Create the MCP server with proper configuration
const server = new McpServer({
  name: "vexa-meeting-assistant",
  version: "1.0.0",
});

// Tool for chatting with meetings data - optimized for serverless
server.tool(
  "chatWithMeetings",
  {
    message: z.string().describe("The message to send to the chat bot"),
    userId: z.string().describe("The user ID"),
  },
  async ({ message, userId }) => {
    try {
      const supabase = await createClient();

      // Optimized query with better error handling
      const { data: meetings, error: meetingsError } = await supabase
        .from("meetings")
        .select(`
          id,
          meeting_title,
          started_at,
          ended_at,
          transcripts!inner ( transcript_text ),
          action_items ( 
            id,
            description,
            assigned_to,
            due_date,
            status
          ),
          meeting_summaries (
            summary_text,
            key_decisions,
            sentiment_analysis
          )
        `)
        .eq("user_id", userId)
        .order("started_at", { ascending: false })
        .limit(5); // Reduced for better performance

      if (meetingsError) {
        console.error("Error fetching meetings:", meetingsError);
        return {
          content: [{ type: "text", text: `Error fetching meeting data: ${meetingsError.message}` }],
        };
      }

      if (!meetings || meetings.length === 0) {
        return {
          content: [{ type: "text", text: "No meetings found for this user. Please ensure you have meetings recorded in your system." }],
        };
      }

      // Optimized context formatting
      const context = meetings.map((meeting) => {
        const transcript = meeting.transcripts?.[0]?.transcript_text || "No transcript available";
        const summary = meeting.meeting_summaries?.[0];
        const actionItems = meeting.action_items?.map(item => 
          `- ${item.description} (Assigned: ${item.assigned_to}, Due: ${item.due_date}, Status: ${item.status})`
        ).join('\n') || "No action items";

        return `Meeting: ${meeting.meeting_title}
Date: ${new Date(meeting.started_at).toLocaleDateString()}
Summary: ${summary?.summary_text || "No summary"}
Key Decisions: ${summary?.key_decisions || "None recorded"}
Sentiment: ${summary?.sentiment_analysis || "Not analyzed"}
Action Items:
${actionItems}
Transcript: ${transcript.substring(0, 1500)}${transcript.length > 1500 ? '...' : ''}
---`;
      }).join('\n\n');

      // Optimized prompt
      const prompt = `You are Vexa, an intelligent meeting assistant. Answer questions about the user's meetings based on the provided context.

Rules:
- Be concise and helpful
- Only use information from the provided context
- Include meeting titles and dates when referencing meetings
- For action items, mention assignees and status

Context:
${context}

Question: "${message}"

Answer:`;

      // Check if OpenAI API key is available
      if (!hasValidOpenAIKey) {
        return {
          content: [
            { type: "text", text: "OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable." },
          ],
        };
      }

      // Optimized OpenAI call for serverless
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500, // Reduced for faster response
        temperature: 0.2,
        timeout: 25000, // 25 second timeout for Vercel
      });

      const reply = completion.choices[0].message?.content?.trim();

      if (!reply) {
        return {
          content: [
            { type: "text", text: "Failed to get a response from the assistant. Please try again." },
          ],
        };
      }

      return { content: [{ type: "text", text: reply }] };
    } catch (error) {
      console.error("Error in chatWithMeetings:", error);
      return {
        content: [{ type: "text", text: `An error occurred: ${error.message}. Please try again later.` }],
      };
    }
  }
);

// Optimized Vercel serverless function handler
export default async function handler(req, res) {
  try {
    // Enable CORS with optimization
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Mcp-Session-Id');
    res.setHeader('Cache-Control', 's-maxage=0'); // Disable caching for dynamic content
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method === 'GET') {
      // Health check optimized for serverless
      res.status(200).json({
        status: "healthy",
        server: "vexa-meeting-assistant",
        message: "MCP Server is running on Vercel",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        endpoints: {
          health: "/api/mcp",
          chat: "/api/mcp (POST with MCP protocol)"
        }
      });
      return;
    }

    if (req.method === 'POST') {
      // Create fresh transport for each request (serverless pattern)
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
      });

      // Connect the server to the transport
      await server.connect(transport);

      // Handle the request immediately
      await transport.handleRequest(req, res, req.body);
      
      // Cleanup (automatically handled by serverless environment)
      return;
    }

    // Method not allowed
    res.status(405).json({
      error: 'Method not allowed',
      allowed_methods: ['GET', 'POST', 'OPTIONS']
    });

  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString(),
        service: 'mcp-server'
      });
    }
  }
} 