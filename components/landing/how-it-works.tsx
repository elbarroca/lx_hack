import { Calendar, MessageSquare, FileText } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      title: "Connect Your Workspace (Secure & Read-Only)",
      description:
        "Veritas securely connects to your calendar to know when to join. It connects to your communication tools to know where to deliver insights. You are in full control.",
      icon: Calendar,
      image: "/placeholder.svg?height=120&width=240",
    },
    {
      title: "The Agent Gathers Intelligence",
      description:
        "Our AI agent joins your call as a silent observer. Using the Vexa API for transcription, it captures a perfect, speaker-separated record of the conversation—the ground truth.",
      icon: MessageSquare,
      image: "/placeholder.svg?height=120&width=240",
    },
    {
      title: "Receive Actionable, Verifiable Results",
      description:
        "Minutes after the call ends, you receive a full breakdown: an executive summary, a list of action items with verifiable quotes, and sentiment analysis, all delivered to your dashboard and Slack.",
      icon: FileText,
      image: "/placeholder.svg?height=120&width=240",
    },
  ]

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-green-500/20 hidden md:block"></div>

          <div className="space-y-24 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Timeline dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -top-5 w-10 h-10 rounded-full bg-black border-4 border-green-500 hidden md:flex items-center justify-center">
                  <span className="text-green-500 font-bold">{index + 1}</span>
                </div>

                <div
                  className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center`}
                >
                  <div className="flex-1 md:text-right">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-4">
                      <step.icon className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-300">{step.description}</p>
                  </div>

                  <div className="flex-1">
                    {/* <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={step.image || "/placeholder.svg"}
                        alt={`Step ${index + 1}: ${step.title}`}
                        className="w-full h-auto"
                      />
                    </div> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
