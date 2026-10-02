import React from 'react';
import {
  Display,
  Text,
  MonoData,
  Button,
  LinkArrow,
  Field,
  StatusChip,
  Hairline,
  Grain,
  Section,
  Counter,
} from '@/components/primitives';

export default function TokensPage() {
  const coreColors = [
    { name: '--ink', value: '#0E0E10', bg: 'bg-ink', text: 'text-paper' },
    { name: '--paper', value: '#F3EFE6', bg: 'bg-paper', text: 'text-ink', border: true },
    { name: '--signal', value: '#FF5B2E', bg: 'bg-signal', text: 'text-paper' },
    { name: '--phantom', value: '#B9B4FF', bg: 'bg-phantom', text: 'text-ink' },
    { name: '--moss', value: '#1F3D2B', bg: 'bg-moss', text: 'text-paper' },
    { name: '--bone', value: '#E4DED0', bg: 'bg-bone', text: 'text-ink' },
    { name: '--ash', value: '#6B6B70', bg: 'bg-ash', text: 'text-paper' },
  ];

  return (
    <div className="relative min-h-screen bg-paper text-ink pb-24">
      <Grain />

      <Section color="paper" borderBottom>
        <div className="flex flex-col gap-2">
          <Text variant="caption" className="text-signal">
            Ghost-Hunter Design Primitives
          </Text>
          <Display variant="h1">Design Tokens & Primitives</Display>
          <Text variant="lead" className="text-ash max-w-3xl">
            Editorial typography, hard shadows, status indicators, and form inputs designed for the signal-hunting interface.
          </Text>
        </div>
      </Section>

      {/* 1. Core Palette */}
      <Section color="paper">
        <Display variant="h2" className="mb-6">
          01 / Color Tokens
        </Display>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {coreColors.map((color) => (
            <div
              key={color.name}
              className={`${color.bg} ${color.text} ${color.border ? 'hairline' : ''} p-4 shadow-hard flex flex-col justify-between h-32`}
            >
              <Text variant="caption" className="font-bold">{color.name}</Text>
              <MonoData value={color.value} highlight="default" className={color.text} />
            </div>
          ))}
        </div>
      </Section>

      {/* 2. Status Chips */}
      <Section color="bone" borderTop borderBottom>
        <Display variant="h2" className="mb-6">
          02 / StatusChip Primitive
        </Display>
        <div className="flex flex-wrap gap-3 items-center">
          <StatusChip status="DRAFT" />
          <StatusChip status="HUNTING" subStatus="WAITING" />
          <StatusChip status="HUNTING" subStatus="GENERATING" />
          <StatusChip status="HUNTING" subStatus="AWAITING_REVIEW" />
          <StatusChip status="HUNTING" subStatus="DEGRADED" />
          <StatusChip status="REPLIED" />
          <StatusChip status="COMPLETED" />
          <StatusChip status="CANCELLED" />
          <StatusChip status="FAILED" />
        </div>
      </Section>

      {/* 3. Typography & Counters */}
      <Section color="paper">
        <Display variant="h2" className="mb-8">
          03 / Typography, Counters & MonoData
        </Display>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Counter value="14" unit="DAYS" label="Cadence waiting time" size="giant" highlight="signal" />
          <Counter value="03" unit="DRAFTS" label="Follow-ups awaiting review" size="giant" highlight="default" />
          <Counter value="28" unit="HUNTS" label="Active Temporal workflows" size="giant" highlight="moss" />
        </div>

        <Hairline color="ash" className="my-8" />

        <div className="space-y-6">
          <Display variant="xl">SILENCE IS DATA.</Display>
          <Display variant="h1">Autonomous Cadence Wait</Display>
          <Display variant="h2">Temporal Workflow State Machine</Display>
          <Text variant="lead">
            Every outreach thread is persisted durably as a Temporal workflow that sleeps for days and awakens on recruiter reply.
          </Text>
          <Text variant="body">
            Local Gemma generates high-context follow-up emails without exposing applicant data to external cloud services.
          </Text>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MonoData label="WORKFLOW_ID" value="gh-4aec24c-9f25" inline highlight="signal" />
          <MonoData label="NEXT_WAKEUP" value="03d 08h 12m" inline highlight="moss" />
        </div>
      </Section>

      {/* 4. Buttons & Links */}
      <Section color="paper" borderTop>
        <Display variant="h2" className="mb-6">
          04 / Button & LinkArrow Primitives
        </Display>
        <div className="flex flex-wrap gap-4 items-center mb-8">
          <Button variant="primary">Primary Action</Button>
          <Button variant="signal">Start Ghost Hunt</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="destructive">Cancel Hunt</Button>
          <Button variant="primary" isLoading>Processing</Button>
        </div>
        <div className="flex items-center gap-8">
          <LinkArrow href="/app">Go to App Dashboard</LinkArrow>
          <LinkArrow href="https://temporal.io" external>Temporal Documentation</LinkArrow>
        </div>
      </Section>

      {/* 5. Editorial Form Fields */}
      <Section color="bone" borderTop>
        <Display variant="h2" className="mb-6">
          05 / Field Primitive
        </Display>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <Field
            label="Target Company"
            required
            defaultValue="Stripe"
            placeholder="e.g. Stripe, Linear"
          />
          <Field
            label="Recruiter Name"
            required
            defaultValue="Patrick Collison"
            placeholder="Recruiter or Engineering Lead"
          />
          <Field
            as="select"
            label="Outreach Channel"
            options={[
              { label: 'Email', value: 'email' },
              { label: 'LinkedIn Message', value: 'linkedin' },
              { label: 'Other', value: 'other' },
            ]}
          />
          <Field
            label="Follow-Up Cadence Delay"
            hint="seconds in demo mode, days in prod"
            defaultValue="20"
          />
          <div className="md:col-span-2">
            <Field
              as="textarea"
              label="Outreach Context"
              required
              defaultValue="Discussed distributed systems and SQLite replication after career fair presentation."
              error=""
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
