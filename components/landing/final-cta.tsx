"use client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

interface FinalCTAProps {
  isLoggedIn: boolean
}

export default function FinalCTA({ isLoggedIn }: FinalCTAProps) {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Turn Your Conversations into Currency</h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
          Stop letting valuable insights and commitments slip through the cracks. With Veritas AI, every meeting becomes
          a source of actionable intelligence.
        </p>

        {isLoggedIn ? (
          <div className="flex justify-center">
            <Button onClick={() => redirect("/auth/login")} size="lg" className="bg-green-500 hover:bg-green-600 text-black font-medium px-8 py-6 text-lg">
              Get Started
            </Button>
          </div>
        ) : (
          <Link href="/auth/signup">
            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-medium px-8 py-6 text-lg">
              Start Your Free Trial
            </Button>
          </Link>
        )}

        <p className="text-gray-400 mt-4">No credit card required. 14-day free trial.</p>
      </div>
    </section>
  )
}
