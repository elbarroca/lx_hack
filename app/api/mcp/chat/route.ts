import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    // Call the MCP server
    const mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:3001';
    
    // For now, we'll call the MCP server's HTTP endpoint
    // In a production setup, you might want to use the MCP protocol directly
    const mcpResponse = await fetch(`${mcpServerUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'chatWithMeetings',
          arguments: {
            message,
            userId
          }
        }
      }),
    });

    if (!mcpResponse.ok) {
      throw new Error(`MCP server error: ${mcpResponse.statusText}`);
    }

    const mcpData = await mcpResponse.json();
    
    // Extract the response from MCP format
    let reply = 'Sorry, I could not process your request.';
    
    if (mcpData.result && mcpData.result.content && mcpData.result.content.length > 0) {
      reply = mcpData.result.content[0].text || reply;
    }

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('Error in MCP chat endpoint:', error);
    
    // Fallback: if MCP server is not available, provide a basic response
    return NextResponse.json({ 
      reply: 'I apologize, but I\'m currently unable to access your meeting data. Please ensure the MCP server is running and try again.' 
    });
  }
} 