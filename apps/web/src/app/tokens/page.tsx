import React from 'react';

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

  const statusColors = [
    { status: 'WAITING', color: 'bg-status-waiting', label: 'Phantom (#B9B4FF)' },
    { status: 'GENERATING', color: 'bg-status-generating', label: 'Signal (#FF5B2E)' },
    { status: 'AWAITING_REVIEW', color: 'bg-status-review', label: 'Amber (#F2B84B)' },
    { status: 'REPLIED', color: 'bg-status-replied', label: 'Moss (#1F3D2B)', text: 'text-paper' },
    { status: 'CANCELLED', color: 'bg-status-cancelled', label: 'Ash (#6B6B70)', text: 'text-paper' },
    { status: 'FAILED', color: 'bg-status-failed', label: 'Crimson (#C2261B)', text: 'text-paper' },
  ];

  return (
    <div className="grain-overlay min-h-screen p-8 max-w-6xl mx-auto space-y-16">
      {/* Header */}
      <header className="border-b hairline pb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-signal">
          Ghost-Hunter Design System
        </span>
        <h1 className="display-h1 uppercase mt-2">Design Tokens & Typography</h1>
        <p className="text-ash text-lg mt-2">
          Editorial signal-hunting aesthetic: high contrast, tactile grain, hard shadows, clamped grotesque headlines.
        </p>
      </header>

      {/* 1. Core Palette */}
      <section className="space-y-6">
        <h2 className="display-h2 uppercase">01 / Palette Tokens</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {coreColors.map((color) => (
            <div
              key={color.name}
              className={`${color.bg} ${color.text} ${color.border ? 'hairline' : ''} p-4 shadow-hard flex flex-col justify-between h-32`}
            >
              <span className="font-mono text-xs font-bold">{color.name}</span>
              <span className="font-mono text-sm tracking-tight">{color.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Status Tokens */}
      <section className="space-y-6">
        <h2 className="display-h2 uppercase">02 / Workflow Statuses</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statusColors.map((st) => (
            <div
              key={st.status}
              className={`${st.color} ${st.text || 'text-ink'} p-4 shadow-hard flex flex-col justify-between h-28`}
            >
              <span className="font-mono text-xs uppercase font-extrabold tracking-wider">{st.status}</span>
              <span className="font-mono text-xs opacity-80">{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Typography Scale */}
      <section className="space-y-8 hairline p-8 bg-paper shadow-hard">
        <h2 className="display-h2 uppercase">03 / Typography Hierarchy</h2>

        <div>
          <span className="font-mono text-xs text-ash uppercase">Display XL — Bricolage Grotesque (clamp: 3.5rem to 12rem)</span>
          <div className="display-xl text-ink mt-2">
            SILENCE IS DATA.
          </div>
        </div>

        <div className="pt-6 hairline-t">
          <span className="font-mono text-xs text-ash uppercase">Display H1 — clamp(2.25rem, 6vw, 4.5rem)</span>
          <div className="display-h1 uppercase text-ink mt-1">
            Autonomous Outreach Cadence
          </div>
        </div>

        <div className="pt-6 hairline-t">
          <span className="font-mono text-xs text-ash uppercase">Display H2 — clamp(1.75rem, 3.5vw, 2.75rem)</span>
          <div className="display-h2 text-ink mt-1">
            Temporal Durable Timer Wait
          </div>
        </div>

        <div className="pt-6 hairline-t grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <span className="font-mono text-xs text-ash uppercase">Body (Inter 16/24)</span>
            <p className="text-base text-ink mt-2 leading-relaxed">
              Applicants send dozens of messages and lose track of who replied, who was followed up, and when. Ghost-Hunter persists outreach state durably across crashes and restarts, keeping all recruiter data completely private and local.
            </p>
          </div>
          <div>
            <span className="font-mono text-xs text-ash uppercase">Mono Data (JetBrains Mono tabular-nums)</span>
            <div className="mt-2 space-y-1 font-mono text-sm">
              <div className="p-2 bg-bone hairline flex justify-between">
                <span>WORKFLOW_ID</span>
                <span className="text-signal">gh-7c9e6679-7425-40de</span>
              </div>
              <div className="p-2 bg-bone hairline flex justify-between">
                <span>NEXT_TIMER_EXPIRY</span>
                <span>02d 14h 22m 19s</span>
              </div>
              <div className="p-2 bg-bone hairline flex justify-between">
                <span>STAGE</span>
                <span>STAGE 02 / 03</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Shadows & Buttons */}
      <section className="space-y-6">
        <h2 className="display-h2 uppercase">04 / Shadows & Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <button className="btn-primary">
            Primary Action
          </button>
          <button className="btn-secondary">
            Secondary Action &rarr;
          </button>
          <button className="btn-signal">
            Trigger Ghost Hunt
          </button>
          <span className="px-3 py-1 rounded-full bg-status-waiting text-ink font-mono text-xs font-bold uppercase tracking-wider hairline">
            Status: WAITING
          </span>
          <span className="px-3 py-1 rounded-full bg-status-review text-ink font-mono text-xs font-bold uppercase tracking-wider hairline">
            Status: AWAITING_REVIEW
          </span>
        </div>
      </section>

      {/* 5. Editorial Inputs */}
      <section className="space-y-6 max-w-xl">
        <h2 className="display-h2 uppercase">05 / Editorial Input Style</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase text-ash tracking-wider mb-1">
              Target Company
            </label>
            <input
              type="text"
              defaultValue="Stripe"
              className="input-editorial font-display text-2xl font-bold"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase text-ash tracking-wider mb-1">
              Recruiter Name
            </label>
            <input
              type="text"
              defaultValue="Patrick Collison"
              className="input-editorial font-display text-2xl font-bold"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
