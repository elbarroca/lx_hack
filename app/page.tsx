import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { hasEnvVars } from "@/lib/utils"
import HeroSection from "@/components/landing/hero-section"
import HowItWorks from "@/components/landing/how-it-works"
import FeatureDeepDive from "@/components/landing/feature-deep-dive";
import SecuritySection from "@/components/landing/security-section";
import FinalCTA from "@/components/landing/final-cta";

export default async function LandingPage() {
  // If env vars are not set, show the landing page without auth check
  if (!hasEnvVars) {
    return (
      <div className="flex-1 w-full flex flex-col bg-black text-white">
        <HeroSection isLoggedIn={false} />
        <HowItWorks />
        <FeatureDeepDive />
        <SecuritySection />
        <FinalCTA isLoggedIn={false} />
      </div>
    )
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col bg-black text-white">
      <HeroSection isLoggedIn={!!data?.user} />
      <HowItWorks />
      <FeatureDeepDive />
      <SecuritySection />
      <FinalCTA isLoggedIn={!!data?.user} />
    </div>
  )
}
