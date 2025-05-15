// src/app/(marketing)/page.tsx
'use client';

import { HeroSection } from '@/components/home/hero-section';
import { FeaturesSection } from '@/components/home/features-section';
import { BenefitsSection } from '@/components/home/benefits-section';
import { StatsSection } from '@/components/home/stats-section';
import { IntegrationSection } from '@/components/home/integration-section';
import { QuickLinksSection } from '@/components/home/quick-links-section';
import { CallToActionSection } from '@/components/home/call-to-action-section';
import { TeamSection } from '@/components/home/team-section';

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <BenefitsSection />
      <IntegrationSection />
      <QuickLinksSection />
      <CallToActionSection />
      <TeamSection />
    </div>
  );
}