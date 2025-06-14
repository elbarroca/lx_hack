export const mockUser = {
  name: "Ricardo",
  email: "ricardo@crypto.com",
  role: "Crypto Investment Manager",
  company: "CryptoVentures LLC",
  avatar: "R"
}

export const mockStats = {
  meetingsThisWeek: 12,
  actionItemsAssigned: 8,
  avgSentiment: "Positive",
  totalMeetingHours: 24.5
}

export const mockUpcomingMeetings = [
  {
    id: "1",
    summary: "Bitcoin Strategy Review Q1 2024",
    description: "Quarterly review of Bitcoin investment strategy and portfolio performance",
    start: {
      dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      timeZone: "America/New_York"
    },
    end: {
      dateTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
      timeZone: "America/New_York"
    },
    attendees: [
      { email: "ricardo@crypto.com", responseStatus: "accepted", displayName: "Ricardo" },
      { email: "sarah@cryptoventures.com", responseStatus: "accepted", displayName: "Sarah Chen" },
      { email: "mike@cryptoventures.com", responseStatus: "tentative", displayName: "Mike Johnson" }
    ],
    conferenceData: {
      entryPoints: [{
        entryPointType: "video",
        uri: "https://meet.google.com/abc-defg-hij",
        label: "Google Meet"
      }]
    },
    location: "Conference Room A / Google Meet",
    organizer: {
      email: "ricardo@crypto.com",
      displayName: "Ricardo",
      self: true
    },
    status: "confirmed"
  },
  {
    id: "2",
    summary: "Ethereum 2.0 Staking Discussion",
    description: "Technical discussion on ETH 2.0 staking opportunities and risks",
    start: {
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      timeZone: "America/New_York"
    },
    end: {
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(), // Tomorrow + 45 min
      timeZone: "America/New_York"
    },
    attendees: [
      { email: "ricardo@crypto.com", responseStatus: "accepted", displayName: "Ricardo" },
      { email: "alex@ethereum.org", responseStatus: "accepted", displayName: "Alex Thompson" },
      { email: "lisa@stakingpool.com", responseStatus: "accepted", displayName: "Lisa Wang" }
    ],
    conferenceData: {
      entryPoints: [{
        entryPointType: "video",
        uri: "https://zoom.us/j/123456789",
        label: "Zoom Meeting"
      }]
    },
    organizer: {
      email: "alex@ethereum.org",
      displayName: "Alex Thompson",
      self: false
    },
    status: "confirmed"
  },
  {
    id: "3",
    summary: "DeFi Protocol Security Audit",
    description: "Review security audit results for new DeFi protocol investment",
    start: {
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      timeZone: "America/New_York"
    },
    end: {
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(), // Day after tomorrow + 1.5 hours
      timeZone: "America/New_York"
    },
    attendees: [
      { email: "ricardo@crypto.com", responseStatus: "accepted", displayName: "Ricardo" },
      { email: "security@chainaudit.com", responseStatus: "accepted", displayName: "Security Team" },
      { email: "dev@defiprotocol.com", responseStatus: "accepted", displayName: "Dev Team" }
    ],
    conferenceData: {
      entryPoints: [{
        entryPointType: "video",
        uri: "https://meet.google.com/xyz-uvwx-rst",
        label: "Google Meet"
      }]
    },
    location: "Virtual",
    organizer: {
      email: "ricardo@crypto.com",
      displayName: "Ricardo",
      self: true
    },
    status: "confirmed"
  }
]

export const mockPastMeetings = [
  {
    id: "4",
    summary: "NFT Market Analysis & Investment Opportunities",
    description: "Deep dive into NFT market trends and potential investment opportunities",
    start: {
      dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      timeZone: "America/New_York"
    },
    end: {
      dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 2 days ago + 1 hour
      timeZone: "America/New_York"
    },
    attendees: [
      { email: "ricardo@crypto.com", responseStatus: "accepted", displayName: "Ricardo" },
      { email: "jenny@nftmarkets.com", responseStatus: "accepted", displayName: "Jenny Liu" },
      { email: "carlos@artcollective.com", responseStatus: "accepted", displayName: "Carlos Rodriguez" }
    ],
    location: "Virtual Meeting",
    organizer: {
      email: "ricardo@crypto.com",
      displayName: "Ricardo",
      self: true
    },
    status: "confirmed"
  },
  {
    id: "5",
    summary: "Solana Ecosystem Investment Review",
    description: "Quarterly review of Solana-based projects and investment performance",
    start: {
      dateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      timeZone: "America/New_York"
    },
    end: {
      dateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000).toISOString(), // 5 days ago + 1.25 hours
      timeZone: "America/New_York"
    },
    attendees: [
      { email: "ricardo@crypto.com", responseStatus: "accepted", displayName: "Ricardo" },
      { email: "team@solana.com", responseStatus: "accepted", displayName: "Solana Team" },
      { email: "portfolio@cryptoventures.com", responseStatus: "accepted", displayName: "Portfolio Team" }
    ],
    location: "San Francisco Office",
    organizer: {
      email: "team@solana.com",
      displayName: "Solana Team",
      self: false
    },
    status: "confirmed"
  },
  {
    id: "6",
    summary: "Crypto Regulatory Compliance Update",
    description: "Latest regulatory updates and compliance requirements for crypto investments",
    start: {
      dateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      timeZone: "America/New_York"
    },
    end: {
      dateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(), // 1 week ago + 45 min
      timeZone: "America/New_York"
    },
    attendees: [
      { email: "ricardo@crypto.com", responseStatus: "accepted", displayName: "Ricardo" },
      { email: "legal@cryptoventures.com", responseStatus: "accepted", displayName: "Legal Team" },
      { email: "compliance@sec.gov", responseStatus: "accepted", displayName: "SEC Representative" }
    ],
    location: "Virtual Meeting",
    organizer: {
      email: "legal@cryptoventures.com",
      displayName: "Legal Team",
      self: false
    },
    status: "confirmed"
  },
  {
    id: "7",
    summary: "Layer 2 Scaling Solutions Workshop",
    description: "Technical workshop on Layer 2 solutions: Polygon, Arbitrum, and Optimism",
    start: {
      dateTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      timeZone: "America/New_York"
    },
    end: {
      dateTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 10 days ago + 2 hours
      timeZone: "America/New_York"
    },
    attendees: [
      { email: "ricardo@crypto.com", responseStatus: "accepted", displayName: "Ricardo" },
      { email: "tech@polygon.com", responseStatus: "accepted", displayName: "Polygon Team" },
      { email: "dev@arbitrum.io", responseStatus: "accepted", displayName: "Arbitrum Developers" },
      { email: "team@optimism.io", responseStatus: "accepted", displayName: "Optimism Team" }
    ],
    location: "Crypto Conference Center",
    organizer: {
      email: "ricardo@crypto.com",
      displayName: "Ricardo",
      self: true
    },
    status: "confirmed"
  }
]

export const mockChatMessages = [
  {
    id: "1",
    content: "Hello Ricardo! I'm your Veritas AI assistant. I can help you analyze your crypto meetings, track investment discussions, find action items, or answer questions about your meeting data. What would you like to know?",
    sender: "ai" as const,
    timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
  },
  {
    id: "2",
    content: "Can you summarize the key points from my recent NFT market analysis meeting?",
    sender: "user" as const,
    timestamp: new Date(Date.now() - 25 * 60 * 1000) // 25 minutes ago
  },
  {
    id: "3",
    content: "Based on your NFT Market Analysis meeting from 2 days ago, here are the key points:\n\n🎯 **Key Insights:**\n• NFT market showing 15% growth in Q4 2023\n• Gaming NFTs outperforming art collections\n• Utility-based NFTs gaining traction\n\n💰 **Investment Opportunities:**\n• Gaming platform tokens with NFT integration\n• Metaverse real estate projects\n• Music & entertainment NFT platforms\n\n⚠️ **Risk Factors:**\n• Regulatory uncertainty in EU markets\n• Market volatility concerns\n• Liquidity challenges in smaller collections\n\n**Action Items Identified:**\n1. Research 3 gaming NFT platforms by end of week\n2. Schedule follow-up with Carlos on art collective partnerships\n3. Prepare risk assessment report for next board meeting",
    sender: "ai" as const,
    timestamp: new Date(Date.now() - 24 * 60 * 1000) // 24 minutes ago
  },
  {
    id: "4",
    content: "Great! What about my upcoming Bitcoin strategy review? Any prep recommendations?",
    sender: "user" as const,
    timestamp: new Date(Date.now() - 20 * 60 * 1000) // 20 minutes ago
  },
  {
    id: "5",
    content: "For your Bitcoin Strategy Review in 2 hours, here's what I recommend:\n\n📊 **Key Metrics to Review:**\n• Q4 2023 BTC performance: +42% portfolio gain\n• Current allocation: 35% of total crypto portfolio\n• DCA strategy effectiveness: 12% cost reduction\n\n🎯 **Discussion Points:**\n• Halving event impact (April 2024)\n• Institutional adoption trends\n• Macro economic factors (Fed policy, inflation)\n\n📋 **Prep Materials:**\n• Portfolio performance charts ready\n• Competitor analysis (MicroStrategy, Tesla holdings)\n• Risk management framework updates\n\n**Attendees Confirmed:**\n✅ Sarah Chen (Portfolio Manager)\n⏳ Mike Johnson (Risk Analyst) - tentative\n\nWould you like me to generate talking points for any specific aspect?",
    sender: "ai" as const,
    timestamp: new Date(Date.now() - 18 * 60 * 1000) // 18 minutes ago
  }
] 