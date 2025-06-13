import { Lock, Shield, Users } from "lucide-react"

export default function SecuritySection() {
  const securityFeatures = [
    {
      title: "Encryption",
      description: "Your API keys and credentials are encrypted at rest and in transit.",
      icon: Lock,
    },
    {
      title: "Data Privacy",
      description:
        "Your meeting data is yours alone. We are a processor, not an owner. We will never train our models on your private conversations.",
      icon: Shield,
    },
    {
      title: "Access Control",
      description:
        "You control who has access. Our systems are built on industry-standard authentication via Supabase.",
      icon: Users,
    },
  ]

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Secure by Design</h2>
        <p className="text-gray-300 text-center max-w-2xl mx-auto mb-16">
          We take security seriously. Your data is protected with enterprise-grade security measures.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-black rounded-lg p-6 border border-gray-800 hover:border-green-500/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto bg-black/50 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-medium">SOC 2 Compliance</h3>
          </div>
          <p className="text-gray-300">
            Veritas AI is committed to maintaining the highest standards of security and compliance. We are currently
            undergoing SOC 2 certification to ensure our systems meet industry standards for security, availability, and
            confidentiality.
          </p>
        </div>
      </div>
    </section>
  )
}
