import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import express from "express";
import { createClient } from "./lib/supabase/server.js";
import OpenAI from "openai";
import crypto from "crypto";

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

// Tool for chatting with meetings data
server.tool(
  "chatWithMeetings",
  {
    message: z.string().describe("The message to send to the chat bot"),
    userId: z.string().describe("The user ID"),
  },
  async ({ message, userId }) => {
    try {
      const supabase = await createClient();

      // Fetch recent meetings and their transcripts for context
      const { data: meetings, error: meetingsError } = await supabase
        .from("meetings")
        .select(`
          id,
          meeting_title,
          started_at,
          ended_at,
          transcripts ( transcript_text ),
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
        .limit(10);

      if (meetingsError) {
        console.error("Error fetching meetings:", meetingsError);
        return {
          content: [{ type: "text", text: "Error fetching meeting data." }],
        };
      }

      // Format the data for the LLM prompt
      const context = meetings
        ?.map((meeting) => {
          const transcript = meeting.transcripts?.[0]?.transcript_text || "No transcript available";
          const summary = meeting.meeting_summaries?.[0];
          const actionItems = meeting.action_items?.map(item => 
            `- ${item.description} (Assigned to: ${item.assigned_to}, Due: ${item.due_date}, Status: ${item.status})`
          ).join('\n') || "No action items";

          return `
Meeting: ${meeting.meeting_title}
Date: ${meeting.started_at}
Summary: ${summary?.summary_text || "No summary available"}
Key Decisions: ${summary?.key_decisions || "No key decisions recorded"}
Sentiment: ${summary?.sentiment_analysis || "Not analyzed"}
Action Items:
${actionItems}
Transcript: ${transcript.substring(0, 2000)}${transcript.length > 2000 ? '...' : ''}

---
`;
        }).join("");

      const prompt = `
You are Vexa, an intelligent meeting assistant. Your goal is to answer questions about a user's past meetings based on the transcripts, summaries, and action items provided.

Be concise and helpful. If you don't have enough information to answer the question, say so.
Do not make up information. Base your answers strictly on the provided context.
When referencing specific meetings, include the meeting title and date.
For action items, always include who they're assigned to and their status.

Here is the context from the user's recent meetings:
---
${context}
---

Question: "${message}"

Answer:
`;

      // Check if OpenAI API key is available
      if (!hasValidOpenAIKey) {
        return {
          content: [
            { type: "text", text: "OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable." },
          ],
        };
      }

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.2,
      });

      const reply = completion.choices[0].message?.content?.trim();

      if (!reply) {
        return {
          content: [
            { type: "text", text: "Failed to get a response from the assistant." },
          ],
        };
      }

      return { content: [{ type: "text", text: reply }] };
    } catch (error) {
      console.error("Error in chatWithMeetings:", error);
      return {
        content: [{ type: "text", text: "An error occurred while processing your request." }],
      };
    }
  }
);

// Tool for getting meeting statistics
server.tool(
  "getMeetingStats",
  {
    userId: z.string().describe("The user ID"),
    timeframe: z.enum(["week", "month", "quarter"]).optional().describe("Time frame for stats"),
  },
  async ({ userId, timeframe = "week" }) => {
    try {
      const supabase = await createClient();
      
      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(now.getMonth() - 3);
          break;
      }

      const { data: meetings, error } = await supabase
        .from("meetings")
        .select(`
          id,
          meeting_title,
          started_at,
          ended_at,
          action_items ( id, status ),
          meeting_summaries ( sentiment_analysis )
        `)
        .eq("user_id", userId)
        .gte("started_at", startDate.toISOString());

      if (error) {
        return {
          content: [{ type: "text", text: "Error fetching meeting statistics." }],
        };
      }

      const totalMeetings = meetings?.length || 0;
      const totalActionItems = meetings?.reduce((sum, meeting) => 
        sum + (meeting.action_items?.length || 0), 0) || 0;
      const completedActionItems = meetings?.reduce((sum, meeting) => 
        sum + (meeting.action_items?.filter(item => item.status === 'completed').length || 0), 0) || 0;
      
      const totalHours = meetings?.reduce((sum, meeting) => {
        if (meeting.started_at && meeting.ended_at) {
          const start = new Date(meeting.started_at);
          const end = new Date(meeting.ended_at);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }
        return sum;
      }, 0) || 0;

      const stats = {
        totalMeetings,
        totalActionItems,
        completedActionItems,
        totalHours: Math.round(totalHours * 10) / 10,
        timeframe,
      };

      return {
        content: [{ 
          type: "text", 
          text: `Meeting Statistics (${timeframe}):
- Total Meetings: ${stats.totalMeetings}
- Total Meeting Hours: ${stats.totalHours}
- Action Items Created: ${stats.totalActionItems}
- Action Items Completed: ${stats.completedActionItems}
- Completion Rate: ${stats.totalActionItems > 0 ? Math.round((stats.completedActionItems / stats.totalActionItems) * 100) : 0}%`
        }],
      };
    } catch (error) {
      console.error("Error in getMeetingStats:", error);
      return {
        content: [{ type: "text", text: "An error occurred while fetching statistics." }],
      };
    }
  }
);

// Tool for searching specific meetings
server.tool(
  "searchMeetings",
  {
    userId: z.string().describe("The user ID"),
    query: z.string().describe("Search query for meetings"),
    limit: z.number().optional().describe("Maximum number of results to return"),
  },
  async ({ userId, query, limit = 5 }) => {
    try {
      const supabase = await createClient();

      const { data: meetings, error } = await supabase
        .from("meetings")
        .select(`
          id,
          meeting_title,
          started_at,
          transcripts ( transcript_text ),
          meeting_summaries ( summary_text )
        `)
        .eq("user_id", userId)
        .or(`meeting_title.ilike.%${query}%,transcripts.transcript_text.ilike.%${query}%,meeting_summaries.summary_text.ilike.%${query}%`)
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) {
        return {
          content: [{ type: "text", text: "Error searching meetings." }],
        };
      }

      if (!meetings || meetings.length === 0) {
        return {
          content: [{ type: "text", text: `No meetings found matching "${query}".` }],
        };
      }

      const results = meetings.map(meeting => 
        `Meeting: ${meeting.meeting_title}
Date: ${new Date(meeting.started_at).toLocaleDateString()}
Summary: ${meeting.meeting_summaries?.[0]?.summary_text?.substring(0, 200) || "No summary available"}...`
      ).join('\n\n');

      return {
        content: [{ type: "text", text: `Found ${meetings.length} meeting(s) matching "${query}":\n\n${results}` }],
      };
    } catch (error) {
      console.error("Error in searchMeetings:", error);
      return {
        content: [{ type: "text", text: "An error occurred while searching meetings." }],
      };
    }
  }
);

async function main() {
  const app = express();
  app.use(express.json());

  // Enable CORS for external access (like Claude)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Mcp-Session-Id');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Store transports for session management
  const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  // Handle MCP requests
  app.all('/mcp', async (req, res) => {
    try {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        // Reuse existing transport
        transport = transports[sessionId];
      } else if (!sessionId && req.method === 'POST') {
        // Create new transport for initialization
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
        });

        // Connect the server to the transport
        await server.connect(transport);

        // Store transport by session ID after connection
        if (transport.sessionId) {
          transports[transport.sessionId] = transport;
        }

        // Clean up transport when closed
        transport.onclose = () => {
          if (transport.sessionId) {
            delete transports[transport.sessionId];
          }
        };
      } else {
        // Invalid request
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided',
          },
          id: null,
        });
        return;
      }

      // Handle the request
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "healthy", server: "vexa-meeting-assistant" });
  });

  const port = process.env.MCP_PORT || 3001;
  app.listen(port, () => {
    console.log(`Vexa MCP server listening on http://localhost:${port}`);
    console.log(`MCP endpoint available at http://localhost:${port}/mcp`);
    console.log(`Health check at http://localhost:${port}/health`);
  });
}

main().catch((error) => console.error(error)); 