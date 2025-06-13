#!/bin/bash

# Start Vexa Development Environment
echo "🚀 Starting Vexa Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local file not found. Please create it with your environment variables."
    echo "   See README.md for required environment variables."
fi

echo "🔧 Starting MCP server..."
# Start MCP server in background
npm run mcp:dev &
MCP_PID=$!

# Wait a moment for MCP server to start
sleep 3

echo "🌐 Starting Next.js development server..."
# Start Next.js dev server
npm run dev &
NEXT_PID=$!

echo ""
echo "✅ Vexa is now running!"
echo "   📊 Dashboard: http://localhost:3000"
echo "   🤖 MCP Server: http://localhost:3001"
echo "   🩺 Health Check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $MCP_PID 2>/dev/null
    kill $NEXT_PID 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait 