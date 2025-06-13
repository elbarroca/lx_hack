<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js and Supabase Starter Kit - the fastest way to build apps with Next.js and Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js and Supabase Starter Kit</h1>
</a>

<p align="center">
 The fastest way to build apps with Next.js and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#deploy-to-vercel"><strong>Deploy to Vercel</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a> ·
  <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a>
  <a href="#more-supabase-examples"><strong>More Examples</strong></a>
</p>
<br/>

# Vexa - AI Meeting Assistant

Vexa is an intelligent meeting assistant that helps you extract insights from your meeting data using AI. It features a Model Context Protocol (MCP) server that can be accessed both through the web interface and externally by AI assistants like Claude.

## Features

- 🎯 **Meeting Intelligence**: Chat with your meeting data to get insights, summaries, and action items
- 🔍 **Smart Search**: Find specific meetings by content, title, or participants
- 📊 **Statistics**: Get detailed analytics about your meeting patterns and productivity
- 🤖 **MCP Integration**: External AI assistants can access your meeting data through the MCP protocol
- 🔒 **Secure**: User-specific data access with Supabase authentication

## Architecture

### MCP Server (Vexa Meeting Assistant)
The MCP server provides three main tools:

1. **chatWithMeetings**: Natural language interface to query meeting data
2. **getMeetingStats**: Get statistics about meetings (weekly, monthly, quarterly)
3. **searchMeetings**: Search for specific meetings by content or metadata

### Web Interface
- Next.js dashboard with real-time chat interface
- Supabase authentication and data storage
- Integration with the MCP server for AI-powered responses

## Setup

### Prerequisites
- Node.js 18+ 
- Supabase account and project
- OpenAI API key

### Environment Variables
Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# MCP Server
MCP_PORT=3001
MCP_SERVER_URL=http://localhost:3001
```

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Start the MCP server**:
```bash
npm run mcp:dev
```

3. **Start the web application** (in a new terminal):
```bash
npm run dev
```

The MCP server will be available at `http://localhost:3001` and the web app at `http://localhost:3000`.

## Using with External AI Assistants

### Claude Desktop Integration

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "vexa-meeting-assistant": {
      "command": "node",
      "args": ["path/to/your/project/dist/mcp-server.js"]
    }
  }
}
```

First build the MCP server:
```bash
npm run mcp:build
```

### Available MCP Tools

When connected via MCP, AI assistants can use these tools:

#### `chatWithMeetings`
- **Description**: Get information about past meetings and transcripts
- **Parameters**: 
  - `message` (string): The question to ask about meetings
  - `userId` (string): The user ID to query data for

#### `getMeetingStats` 
- **Description**: Get statistics about meetings for a user
- **Parameters**:
  - `userId` (string): The user ID
  - `timeframe` (optional): "week", "month", or "quarter"

#### `searchMeetings`
- **Description**: Search for specific meetings by title, date, or content  
- **Parameters**:
  - `userId` (string): The user ID
  - `query` (string): Search query
  - `limit` (optional): Maximum number of results

### Example Usage with Claude

Once configured, you can ask Claude:

- "What were the action items from my recent meetings?" 
- "Show me meeting statistics for this month"
- "Search for meetings about project planning"
- "What decisions were made in the Q4 strategy meeting?"

## Database Schema

The application expects these Supabase tables:

- `meetings`: Meeting metadata and timing
- `transcripts`: Meeting transcription data  
- `action_items`: Action items extracted from meetings
- `meeting_summaries`: AI-generated meeting summaries

## Development

### Scripts

- `npm run dev`: Start Next.js development server
- `npm run mcp:dev`: Start MCP server in development mode
- `npm run mcp:build`: Build MCP server for production
- `npm run mcp:start`: Start built MCP server
- `npm run build`: Build Next.js application
- `npm run start`: Start production Next.js server

### MCP Server Development

The MCP server is built with:
- `@modelcontextprotocol/sdk`: Official MCP TypeScript SDK
- Express.js for HTTP transport
- Supabase for data access
- OpenAI for AI processing

### Testing the MCP Server

You can test the MCP server directly:

```bash
# Health check
curl http://localhost:3001/health

# Test via web interface
curl -X POST http://localhost:3001/api/mcp/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What meetings did I have this week?", "userId": "user-id"}'
```

## Deployment

### MCP Server
The MCP server can be deployed as:
- A standalone Node.js service
- Docker container
- Serverless function (with modifications)

### Web Application  
Deploy the Next.js app to:
- Vercel (recommended)
- Netlify
- Any Node.js hosting platform

## Security Considerations

- User data is isolated by user ID
- MCP server validates all inputs
- CORS is configured for external access
- Environment variables protect sensitive keys
- Supabase RLS (Row Level Security) should be enabled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both web interface and MCP functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Demo

You can view a fully working demo at [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/).

## Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so the deployment is fully functioning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

The above will also clone the Starter kit to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

4. Rename `.env.example` to `.env.local` and update the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```

   Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be found in [your Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true)

5. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

6. This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete `components.json` and [re-install shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.

## Feedback and issues

Please file feedback and issues over on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose).

## More Supabase examples

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments)
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
