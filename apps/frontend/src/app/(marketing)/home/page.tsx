// src/app/(marketing)/page.tsx
'use client';

import { HeroSection } from '@/components/(marketing)/home/hero-section';
import { FeaturesSection } from '@/components/(marketing)/features/features-section';
import { BenefitsSection } from '@/components/(marketing)/home/benefits-section';
import { StatsSection } from '@/components/(marketing)/home/stats-section';
import { IntegrationSection } from '@/components/(marketing)/home/integration-section';
import { QuickLinksSection } from '@/components/(marketing)/home/quick-links-section';
import { CallToActionSection } from '@/components/(marketing)/about/call-to-action-section';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <IntegrationSection />           
      <BenefitsSection />              
      <StatsSection />                 
      <FeaturesSection />             
      <QuickLinksSection />           
      <CallToActionSection />         
    </div>
  );
}