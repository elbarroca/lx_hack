"use client"

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || !userId) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Call the MCP server endpoint
      const response = await fetch('/api/mcp/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          userId: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Sorry, I had trouble getting a response. Please try again. Make sure the MCP server is running.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-700 h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-bold text-lg text-white">Chat with Vexa</h2>
        <p className="text-sm text-gray-400">Ask about your meetings, action items, summaries, or decisions.</p>
        {!userId && (
          <p className="text-sm text-yellow-400 mt-1">⚠️ User not authenticated</p>
        )}
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-8">
              <p className="mb-2">👋 Hi! I&apos;m Vexa, your meeting assistant.</p>
              <p className="text-sm">Try asking me:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• &quot;What were the action items from my last meeting?&quot;</li>
                <li>• &quot;Show me meeting statistics for this week&quot;</li>
                <li>• &quot;Search for meetings about project planning&quot;</li>
              </ul>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                  msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="e.g., 'What were the action items for the Q2 strategy review?'"
            className="bg-gray-800 border-gray-600 text-white"
            disabled={isLoading || !userId}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !userId} 
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
} 