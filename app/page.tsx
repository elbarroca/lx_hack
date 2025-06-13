import { createClient } from "@/lib/supabase/server"
import { hasEnvVars } from "@/lib/utils"
import HeroSection from "@/components/landing/hero-section"
import HowItWorks from "@/components/landing/how-it-works"
import FeatureDeepDive from "@/components/landing/feature-deep-dive";
import SecuritySection from "@/components/landing/security-section";
import FinalCTA from "@/components/landing/final-cta";

// Force this page to be dynamic since we're checking auth status
export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  let isLoggedIn = false;

  // Only check auth if env vars are set
  if (hasEnvVars) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      isLoggedIn = !error && !!data?.user;
    } catch (error) {
      console.error("Auth check failed:", error);
      // Continue with isLoggedIn = false
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col bg-black text-white">
      <HeroSection isLoggedIn={isLoggedIn} />
      <HowItWorks />
      <FeatureDeepDive />
      <SecuritySection />
      <FinalCTA isLoggedIn={isLoggedIn} />
    </div>
  )
}
