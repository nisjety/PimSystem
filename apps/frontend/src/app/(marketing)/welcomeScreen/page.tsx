'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

// Import all the components we created
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { LoadingScreen } from '@/components/core/ui/loading-screen';
import { BgPattern } from "@/components/welcome-screen/bg-pattern";
import { HeroSection } from "@/components/welcome-screen/hero-section";
import { QuickLinksSection } from "@/components/welcome-screen/quick-links-section";
import { StatsSection } from "@/components/welcome-screen/stats-section";
import { FeaturesSection } from "@/components/welcome-screen/features-section";
import { BenefitsSection } from "@/components/welcome-screen/benefits-section";
import { CallToActionSection } from "@/components/welcome-screen/call-to-action-section";

export default function Home() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [userId, isLoaded, router]);

  // If auth is still loading or user is not logged in, don't render content
  if (!isLoaded || !userId) {
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Background Pattern */}
      <BgPattern />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Quick Links Section */}
      <QuickLinksSection />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Benefits Section */}
      <BenefitsSection />
      
      {/* Call to Action Section */}
      <CallToActionSection />
    </div>
  );
}
