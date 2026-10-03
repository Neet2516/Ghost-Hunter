import React from 'react';
import type { Metadata } from 'next';
import { MarketingLayout } from '@/components/layout';
import {
  SmoothScrollProvider,
  HeroSection,
  ScrollStory,
  InteractiveDraftSimulator,
  ArchitectureSection,
  CtaBanner,
} from '@/components/marketing';

export const metadata: Metadata = {
  title: 'Ghost-Hunter — Silence is Data | Autonomous Job Follow-Up Sentinel',
  description:
    'An air-gapped, Temporal-powered follow-up sentinel for high-stakes job applications. Offline local Gemma synthesis, durable multi-stage cadence loops, and human review gates.',
};

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <MarketingLayout>
        <HeroSection />
        <ScrollStory />
        <InteractiveDraftSimulator />
        <ArchitectureSection />
        <CtaBanner />
      </MarketingLayout>
    </SmoothScrollProvider>
  );
}
