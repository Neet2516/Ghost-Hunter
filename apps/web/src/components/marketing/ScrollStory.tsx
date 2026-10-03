'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionPreference } from './SmoothScrollProvider';
import {
  Send,
  Clock,
  Radio,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Terminal,
} from 'lucide-react';

interface StoryStep {
  number: string;
  title: string;
  tagline: string;
  badge: string;
  description: string;
  technicalDetail: string;
  icon: React.ElementType;
  preview: {
    status: string;
    subStatus: string;
    actionTitle: string;
    actionDetail: string;
    codeSnippet?: string;
  };
}

const STEPS: StoryStep[] = [
  {
    number: '01',
    title: 'Apply & Arm',
    tagline: 'Record your application and set your cadence curve.',
    badge: 'STAGE 0: INITIATION',
    description:
      'Log your job application, recruiter contact, and outreach channel. Choose a cadence schedule like 3d → 7d → 14d or Demo Mode. The Sentinel initializes an isolated Temporal workflow instance.',
    technicalDetail:
      'Temporal starts workflow `gh-app-{id}` on task queue `ghost-hunter`. Initial application state saved to SQLite with WAL mode.',
    icon: Send,
    preview: {
      status: 'HUNTING',
      subStatus: 'INITIALIZED',
      actionTitle: 'Cadence Schedule Initialized',
      actionDetail: 'Target: Lead AI Engineer at Anthropic. Schedule: [3d, 7d, 14d].',
      codeSnippet: 'workflow.start("ghostHunterWorkflow", { cadence: [3d, 7d, 14d] })',
    },
  },
  {
    number: '02',
    title: 'Durable Wait',
    tagline: 'Silence is tracked with cryptographic durability.',
    badge: 'STAGE 1: DURABLE SLEEP',
    description:
      'The sentinel enters durable sleep. Unlike in-memory timers (`setTimeout`) that vanish when containers restart, Temporal persists timers in server event history. Compute nodes can restart with zero timer loss.',
    technicalDetail:
      '`await condition(() => isReplied || isCancelled, delayDuration)`. Server records `STAGE_WAIT_STARTED` event.',
    icon: Clock,
    preview: {
      status: 'HUNTING',
      subStatus: 'WAITING',
      actionTitle: 'Cadence Timer Ticking',
      actionDetail: 'Next check-in scheduled for Day +3. Zero CPU consumed while idle.',
      codeSnippet: 'Timer scheduled in Temporal event history. Memory usage: 0 MB.',
    },
  },
  {
    number: '03',
    title: 'Signal Interruption',
    tagline: 'Instant halt if the recruiter replies.',
    badge: 'RACE GUARD: REAL-TIME',
    description:
      'If the recruiter emails you or calls, one click dispatches a `recruiterReplied` signal. The workflow breaks its sleep condition immediately, cancels scheduled drafts, and transitions to REPLIED.',
    technicalDetail:
      'Deterministic condition wake-up. Race guard discards in-flight draft with `DISCARDED_REPLY` if reply arrives during generation.',
    icon: Radio,
    preview: {
      status: 'REPLIED',
      subStatus: 'FINALIZED',
      actionTitle: 'Recruiter Contacted via LinkedIn',
      actionDetail: 'Hunt resolved as REPLIED. All future cadence stages cancelled.',
      codeSnippet: 'handle.signal(recruiterRepliedSignal, { note: "Interview offered" })',
    },
  },
  {
    number: '04',
    title: 'Local Gemma Draft',
    tagline: 'Contextual synthesis on offline hardware.',
    badge: 'AIR-GAPPED AI SYNTHESIS',
    description:
      'If the cadence delay expires in silence, the Sentinel wakes up and calls local Gemma via Ollama. It reads your outreach context and synthesizes a punchy follow-up check-in under 120 words.',
    technicalDetail:
      'Zero tokens sent to third-party clouds. Quarantined prompt builder prevents prompt injection. Non-retryable validation schema.',
    icon: Sparkles,
    preview: {
      status: 'HUNTING',
      subStatus: 'GENERATING',
      actionTitle: 'Local Gemma 2B Generating Draft',
      actionDetail: 'Offline inference via Ollama. Synthesizing Stage 1 follow-up...',
      codeSnippet: 'prompt: "Write courteous 80-word check-in to Sarah referencing portfolio"',
    },
  },
  {
    number: '05',
    title: 'Human Review Gate',
    tagline: 'You retain complete executive control.',
    badge: 'HUMAN REVIEW GATE',
    description:
      'The draft enters AWAITING_REVIEW. You receive a desktop alert and real-time SSE stream notification. You can inspect the text, make inline edits, approve, skip the stage, or snooze for 24 hours.',
    technicalDetail:
      'Auto-skips after review timeout (48h default) to prevent stale emails. Signals workflow via `draftDecisionSignal`.',
    icon: CheckCircle2,
    preview: {
      status: 'HUNTING',
      subStatus: 'AWAITING_REVIEW',
      actionTitle: 'Follow-Up Draft Ready for Review',
      actionDetail: 'Word count: 74 words. Source: Gemma Local. Actions: Approve | Skip | Snooze',
      codeSnippet: 'handle.signal(draftDecisionSignal, { action: "approve" })',
    },
  },
];

export function ScrollStory() {
  const [activeStep, setActiveStep] = useState(0);
  const { reducedMotion } = useMotionPreference();
  const current = STEPS[activeStep];

  return (
    <section
      id="story"
      className="py-24 px-4 sm:px-6 lg:px-8 border-b border-ink/10 bg-surface relative"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-ink text-paper text-xs font-mono uppercase tracking-widest border border-ink shadow-hard mb-4">
            <span>The 5-Step Sentinel Journey</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase tracking-tight leading-none mb-4">
            How Ghost-Hunter works
          </h2>
          <p className="text-ash text-base sm:text-lg font-sans leading-relaxed">
            From the moment you hit submit to the final recruiter interview slot,
            every transition is deterministic, durably recorded, and human-gated.
          </p>
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-12 border-b border-ink/20 pb-4">
          {STEPS.map((step, index) => {
            const isSelected = activeStep === index;
            const Icon = step.icon;
            return (
              <button
                key={step.number}
                onClick={() => setActiveStep(index)}
                className={`text-left p-3 border transition-all ${
                  isSelected
                    ? 'bg-ink text-paper border-ink shadow-hard'
                    : 'bg-paper text-ash border-ink/20 hover:border-ink hover:text-ink'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isSelected ? 'text-signal' : 'text-ash'
                    }`}
                  >
                    STEP {step.number}
                  </span>
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-signal' : 'text-ash/60'
                    }`}
                  />
                </div>
                <span className="font-display font-bold text-sm block truncate">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase: Dual Column Layout */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.number}
            initial={reducedMotion ? {} : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            {/* Left Column: Narrative Explanation */}
            <div className="lg:col-span-6 bg-paper border-2 border-ink p-8 shadow-hard flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 bg-phantom text-ink font-mono text-xs uppercase font-bold tracking-wider mb-4 border border-ink/30">
                  {current.badge}
                </div>

                <h3 className="font-display text-3xl sm:text-4xl font-black text-ink uppercase tracking-tight mb-2">
                  {current.title}
                </h3>
                <p className="font-mono text-sm text-signal font-bold mb-6">
                  {current.tagline}
                </p>

                <p className="font-sans text-base text-ink leading-relaxed mb-6">
                  {current.description}
                </p>
              </div>

              <div className="p-4 bg-surface border border-ink/20 mt-4">
                <span className="font-mono text-[10px] uppercase text-ash tracking-widest block mb-1">
                  Temporal Engine Specification:
                </span>
                <p className="font-mono text-xs text-ink leading-relaxed">
                  {current.technicalDetail}
                </p>
              </div>
            </div>

            {/* Right Column: Simulated Visual State Preview */}
            <div className="lg:col-span-6 bg-paper border-2 border-ink shadow-hard overflow-hidden flex flex-col">
              {/* Preview terminal title bar */}
              <div className="bg-ink text-paper px-4 py-3 flex items-center justify-between border-b border-ink">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-signal" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    Workflow State Inspector
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-paper/70">
                    STATUS:
                  </span>
                  <span className="px-2 py-0.5 bg-signal text-paper font-mono text-[10px] font-bold uppercase">
                    {current.preview.status}
                  </span>
                </div>
              </div>

              {/* Preview content body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-[10px] font-mono text-ash uppercase tracking-wider block mb-1">
                    Event Log & Action
                  </span>
                  <h4 className="font-display text-xl font-bold text-ink mb-1">
                    {current.preview.actionTitle}
                  </h4>
                  <p className="font-sans text-sm text-ash leading-relaxed">
                    {current.preview.actionDetail}
                  </p>
                </div>

                {current.preview.codeSnippet && (
                  <div className="bg-ink text-paper p-4 font-mono text-xs rounded-none border border-ink overflow-x-auto">
                    <span className="text-ash block text-[10px] mb-1">
                      // Deterministic execution frame
                    </span>
                    <code className="text-signal">
                      {current.preview.codeSnippet}
                    </code>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ink/10 font-mono text-xs">
                  <div>
                    <span className="text-ash text-[10px] uppercase block">
                      SubStatus State
                    </span>
                    <strong className="text-ink">
                      {current.preview.subStatus}
                    </strong>
                  </div>
                  <div>
                    <span className="text-ash text-[10px] uppercase block">
                      Verification
                    </span>
                    <strong className="text-signal flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Deterministic
                    </strong>
                  </div>
                </div>
              </div>

              {/* Next step footer button */}
              <div className="bg-surface p-4 border-t border-ink/20 flex items-center justify-between">
                <span className="font-mono text-xs text-ash">
                  Step {activeStep + 1} of {STEPS.length}
                </span>
                <button
                  onClick={() =>
                    setActiveStep((prev) => (prev + 1) % STEPS.length)
                  }
                  className="inline-flex items-center gap-1 font-mono text-xs font-bold text-ink hover:text-signal uppercase transition-colors"
                >
                  <span>
                    {activeStep === STEPS.length - 1 ? 'Back to Step 1' : 'Next Step'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
