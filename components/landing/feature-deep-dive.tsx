"use client"

import React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Shield, Code } from "lucide-react"

export default function FeatureDeepDive() {
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [
    {
      id: "accountability",
      label: "The Accountability Ledger",
      icon: CheckCircle,
      content:
        "Never let a commitment slip. Veritas creates an immutable log of every task, owner, and deadline, directly tied to the verbatim quote. End debate and drive execution.",
    },
    {
      id: "executive",
      label: "The Executive Co-Pilot",
      icon: Shield,
      content:
        "Gain complete visibility without spending your entire day in meetings. Get concise, AI-powered summaries of every important call, allowing you to track progress across the entire organization.",
    },
    {
      id: "platform",
      label: "Open & Extensible Platform",
      icon: Code,
      content:
        "Veritas is built on a powerful agentic workflow. Bring your own Vexa API key and connect to the tools you already use. It's your data, your control.",
    },
  ]

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Feature Deep Dive</h2>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-2 mb-8">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeTab === index
                    ? "bg-green-500 text-black font-medium"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-gray-900 rounded-lg p-6 min-h-[300px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    {React.createElement(tabs[activeTab].icon, { className: "w-6 h-6 text-green-500" })}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold">{tabs[activeTab].label}</h3>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed">{tabs[activeTab].content}</p>

                <div className="pt-6">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    {activeTab === 0 && (
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold">
                            JD
                          </div>
                          <div>
                            <p className="text-gray-300">"I'll have the report ready by Friday."</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">TASK</span>
                              <span className="text-xs text-gray-400">Due: Friday</span>
                              <span className="text-xs text-gray-400">Owner: John Doe</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold">
                            AS
                          </div>
                          <div>
                            <p className="text-gray-300">"I'll schedule the follow-up meeting for next week."</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">TASK</span>
                              <span className="text-xs text-gray-400">Due: Next Week</span>
                              <span className="text-xs text-gray-400">Owner: Alice Smith</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 1 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-green-500">Executive Summary</h4>
                        <p className="text-gray-300">
                          The team discussed Q3 goals and identified three key priorities: launching the new product
                          feature, improving customer retention, and optimizing the sales funnel.
                        </p>
                        <div className="pt-2">
                          <h4 className="font-medium text-green-500 mb-2">Key Metrics</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-800 p-3 rounded border border-gray-700">
                              <div className="text-2xl font-bold">87%</div>
                              <div className="text-xs text-gray-400">Completion Rate</div>
                            </div>
                            <div className="bg-gray-800 p-3 rounded border border-gray-700">
                              <div className="text-2xl font-bold">12</div>
                              <div className="text-xs text-gray-400">Action Items</div>
                            </div>
                            <div className="bg-gray-800 p-3 rounded border border-gray-700">
                              <div className="text-2xl font-bold">4</div>
                              <div className="text-xs text-gray-400">Participants</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 2 && (
                      <div className="space-y-4">
                        <div className="bg-gray-900 p-3 rounded font-mono text-sm text-gray-300 overflow-x-auto">
                          <pre>{`// Connect your own Vexa API key
const veritas = new VeritasClient({
  vexaApiKey: process.env.VEXA_API_KEY,
  integrations: {
    slack: true,
    googleCalendar: true
  }
});

// Subscribe to meeting events
veritas.on('meetingCompleted', async (meeting) => {
  const summary = await meeting.getSummary();
  const actionItems = await meeting.getActionItems();
  
  // Send to your custom endpoint
  await fetch('https://your-api.com/meetings', {
    method: 'POST',
    body: JSON.stringify({ summary, actionItems })
  });
});`}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
