'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Cpu,
  Clock,
  Bell,
  Database,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  ExternalLink,
  Zap,
  Sliders,
  Lock,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/primitives';
import { ModelStatus } from '@/components/domain';
import { api } from '@/lib/api';
import { useEventStream } from '@/hooks/useEventStream';

export default function SettingsPage() {
  const { isConnected: sseConnected } = useEventStream();

  // Local storage demo mode state
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [testResult, setTestResult] = useState<{
    success: boolean;
    source: string;
    latencyMs: number;
    response?: string;
    message?: string;
  } | null>(null);

  // Read initial client-side settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ghost_hunter_demo_mode');
      if (stored === 'true') {
        setIsDemoMode(true);
      }
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    }
  }, []);

  const handleToggleDemoMode = () => {
    const nextVal = !isDemoMode;
    setIsDemoMode(nextVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ghost_hunter_demo_mode', String(nextVal));
      window.dispatchEvent(new Event('ghost_hunter_settings_change'));
    }
  };

  const handleRequestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    }
  };

  // Queries
  const {
    data: modelStatus,
    isLoading: modelLoading,
    isRefetching: modelRefetching,
    refetch: refetchModel,
  } = useQuery({
    queryKey: ['system', 'model-status'],
    queryFn: () => api.getModelStatus(),
    refetchInterval: 30000,
  });

  const {
    data: healthData,
    isLoading: healthLoading,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => api.getHealth(),
    refetchInterval: 30000,
  });

  // Test Generate Mutation
  const testMutation = useMutation({
    mutationFn: () => api.testGenerate(),
    onSuccess: (data) => {
      setTestResult(data);
    },
    onError: (err: any) => {
      setTestResult({
        success: false,
        source: 'error',
        latencyMs: 0,
        message: err.message || 'Generation test failed to connect.',
      });
    },
  });

  const handleRefreshAll = () => {
    refetchModel();
    refetchHealth();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="border-b hairline pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <SettingsIcon className="w-4 h-4 text-signal" aria-hidden="true" />
              <span className="font-mono text-xs font-black uppercase tracking-widest text-ash">
                Sentinel Configuration // Telemetry & Diagnostics
              </span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-ink uppercase tracking-tight">
              Settings & Environment
            </h1>
            <p className="font-sans text-sm text-ink/75 mt-1.5 max-w-2xl leading-relaxed">
              Inspect local inference health, configure Temporal cadence timers, manage notification
              permissions, and toggle demonstration mode.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefreshAll}
            disabled={modelRefetching || modelLoading}
            className="flex items-center gap-2 self-start sm:self-auto"
            aria-label="Refresh all diagnostics"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${modelRefetching ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>Refresh Diagnostics</span>
          </Button>
        </div>
      </div>

      {/* Grid of Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Operational Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Local AI Inference & Ollama */}
          <section className="bg-paper hairline p-6 space-y-5 shadow-sm" aria-labelledby="ai-settings-heading">
            <div className="flex items-center justify-between border-b hairline pb-3">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-ink" aria-hidden="true" />
                <h2 id="ai-settings-heading" className="font-display font-bold text-lg text-ink uppercase">
                  Local AI Inference Engine
                </h2>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-bone hairline font-bold text-ash">
                Air-Gapped Privacy
              </span>
            </div>

            <p className="font-sans text-xs text-ink/80 leading-relaxed">
              Ghost-Hunter communicates with a locally hosted Ollama instance via HTTP socket. Prompts are quarantined
              in strict JSON schemas with anti-hallucination guardrails and clamped temperature (≤ 0.4).
            </p>

            {/* Model Status Card */}
            <ModelStatus
              status={modelStatus?.status ?? 'ok'}
              modelName={modelStatus?.model ?? 'gemma3:4b'}
              latencyMs={modelStatus?.latencyMs ?? null}
              onRefresh={refetchModel}
              isRefreshing={modelRefetching}
            />

            {/* Fallback & Offline Notice */}
            {modelStatus?.status === 'offline' && (
              <div className="p-4 bg-amber-50/60 hairline border-amber-300 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Deterministic Fallback Mode Active</span>
                </div>
                <p className="font-sans text-xs leading-relaxed text-amber-900/90">
                  Ollama is currently offline at <code className="font-mono bg-paper/80 px-1 py-0.5">{modelStatus?.baseUrl || 'http://localhost:11434'}</code>.
                  Ghost-Hunter will automatically synthesize dependable, multi-stage fallback outreach templates without failing any active hunts.
                </p>
                <div className="pt-2 font-mono text-[11px] text-ink/80 bg-bone/70 p-2 hairline">
                  <span className="text-ash block mb-1 font-bold">To launch local Gemma:</span>
                  <code>ollama serve && ollama run gemma:2b</code>
                </div>
              </div>
            )}

            {/* Interactive Test Generate Trigger */}
            <div className="pt-3 border-t hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs font-bold text-ink block">Inference Probe</span>
                <span className="font-sans text-xs text-ash">
                  Trigger an instantaneous test generation to benchmark local inference latency.
                </span>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => testMutation.mutate()}
                disabled={testMutation.isPending}
                className="flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
                aria-label="Test model inference"
              >
                <Play className={`w-3.5 h-3.5 ${testMutation.isPending ? 'animate-pulse' : ''}`} aria-hidden="true" />
                <span>{testMutation.isPending ? 'Probing Model...' : 'Test Inference'}</span>
              </Button>
            </div>

            {/* Test Probe Results */}
            {testResult && (
              <div className={`p-4 hairline text-xs space-y-2 font-mono ${testResult.success ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' : 'bg-bone text-ink'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5 text-moss" /> : <AlertTriangle className="w-3.5 h-3.5 text-signal" />}
                    Source: {testResult.source}
                  </span>
                  {testResult.latencyMs > 0 && <span>Latency: {testResult.latencyMs}ms</span>}
                </div>
                <p className="font-sans text-xs text-ink/90 leading-relaxed">
                  {testResult.response || testResult.message}
                </p>
              </div>
            )}
          </section>

          {/* Section 2: Cadence & Workflow Engine */}
          <section className="bg-paper hairline p-6 space-y-5 shadow-sm" aria-labelledby="workflow-settings-heading">
            <div className="flex items-center justify-between border-b hairline pb-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-ink" aria-hidden="true" />
                <h2 id="workflow-settings-heading" className="font-display font-bold text-lg text-ink uppercase">
                  Cadence & Workflow Engine
                </h2>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-bone hairline font-bold text-ash">
                Temporal Core
              </span>
            </div>

            <p className="font-sans text-xs text-ink/80 leading-relaxed">
              Workflow state machines are executed durably on Temporal. Timers survive machine reboots, worker restarts,
              and network disconnects without state loss or duplicate messages.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-bone/40 hairline space-y-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-ash block">Production Cadence</span>
                <span className="font-display font-black text-xl text-ink">3 · 7 · 14 Days</span>
                <span className="font-sans text-xs text-ink/70 block pt-1">
                  Default staggered intervals between initial outreach, Stage 1, Stage 2, and final check-in.
                </span>
              </div>

              <div className="p-4 bg-bone/40 hairline space-y-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-ash block">Review Gate Timeout</span>
                <span className="font-display font-black text-xl text-ink">48 Hours</span>
                <span className="font-sans text-xs text-ink/70 block pt-1">
                  Drafts awaiting human review automatically skip after 48h to prevent stale outreach.
                </span>
              </div>
            </div>

            {/* Demo Mode Setting */}
            <div className="pt-3 border-t hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-ink">Accelerated Demo Mode</span>
                  <span className={`font-mono text-[10px] font-black uppercase px-1.5 py-0.5 hairline ${isDemoMode ? 'bg-signal text-paper' : 'bg-bone text-ash'}`}>
                    {isDemoMode ? 'Active (20s)' : 'Inactive'}
                  </span>
                </div>
                <span className="font-sans text-xs text-ash">
                  Compresses multi-day cadence timers into 20-second countdowns for rapid demonstration and review testing.
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleDemoMode}
                className={`px-3 py-1.5 font-mono text-xs font-black uppercase tracking-wider hairline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal self-start sm:self-auto ${
                  isDemoMode
                    ? 'bg-signal text-paper hover:bg-signal/90'
                    : 'bg-paper text-ink hover:bg-bone'
                }`}
                aria-pressed={isDemoMode}
                aria-label={`Toggle demo mode, currently ${isDemoMode ? 'enabled' : 'disabled'}`}
              >
                {isDemoMode ? 'Disable Demo Mode' : 'Enable Demo Mode'}
              </button>
            </div>
          </section>

          {/* Section 3: Browser Notifications & Alerts */}
          <section className="bg-paper hairline p-6 space-y-5 shadow-sm" aria-labelledby="notification-settings-heading">
            <div className="flex items-center justify-between border-b hairline pb-3">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-ink" aria-hidden="true" />
                <h2 id="notification-settings-heading" className="font-display font-bold text-lg text-ink uppercase">
                  Notifications & Telemetry Feed
                </h2>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-bone hairline font-bold text-ash">
                SSE Live Stream
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-ink">Desktop System Notifications</span>
                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-bone hairline font-bold text-ash">
                    Permission: {notificationPermission}
                  </span>
                </div>
                <p className="font-sans text-xs text-ash leading-relaxed">
                  Receive real-time desktop banners when a follow-up draft is ready for review or when a recruiter replies.
                </p>
              </div>

              {notificationPermission !== 'granted' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRequestNotificationPermission}
                  className="whitespace-nowrap self-start sm:self-auto"
                  aria-label="Request notification permission"
                >
                  Enable Notifications
                </Button>
              )}
            </div>

            <div className="p-3 bg-bone/30 hairline flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-moss animate-pulse' : 'bg-signal'}`} />
                <span className="text-ink font-bold">Event Stream Connection</span>
              </div>
              <span className="text-ash">{sseConnected ? 'CONNECTED (/api/events/stream)' : 'CONNECTING...'}</span>
            </div>
          </section>
        </div>

        {/* Right 1 Col: Telemetry Sidebar & Air-Gapped Privacy */}
        <div className="space-y-8">
          {/* Cluster & Infrastructure Card */}
          <section className="bg-paper hairline p-6 space-y-4 shadow-sm" aria-labelledby="infrastructure-heading">
            <div className="flex items-center gap-2 border-b hairline pb-3">
              <Terminal className="w-4 h-4 text-ink" aria-hidden="true" />
              <h2 id="infrastructure-heading" className="font-display font-bold text-base text-ink uppercase">
                Cluster Telemetry
              </h2>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b hairline pb-2">
                <span className="text-ash">Temporal Server:</span>
                <span className="font-bold text-ink">localhost:7233</span>
              </div>

              <div className="flex justify-between border-b hairline pb-2">
                <span className="text-ash">Task Queue:</span>
                <span className="font-bold text-ink">{healthData?.taskQueue || 'ghost-hunter'}</span>
              </div>

              <div className="flex justify-between border-b hairline pb-2">
                <span className="text-ash">API Endpoint:</span>
                <span className="font-bold text-ink">localhost:3001</span>
              </div>

              <div className="flex justify-between border-b hairline pb-2">
                <span className="text-ash">Database:</span>
                <span className="font-bold text-ink">SQLite (Local)</span>
              </div>

              <div className="flex justify-between pb-1">
                <span className="text-ash">Temporal Web UI:</span>
                <a
                  href="http://localhost:8233"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-signal hover:underline flex items-center gap-1"
                >
                  :8233 <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </section>

          {/* Air-Gapped Zero Cloud Guarantee */}
          <section className="p-6 bg-bone/70 hairline space-y-4 shadow-sm" aria-labelledby="privacy-heading">
            <div className="flex items-center gap-2 border-b hairline pb-3">
              <Lock className="w-4 h-4 text-moss" aria-hidden="true" />
              <h2 id="privacy-heading" className="font-display font-bold text-base text-ink uppercase">
                Air-Gapped Guarantee
              </h2>
            </div>

            <p className="font-sans text-xs text-ink/80 leading-relaxed">
              Ghost-Hunter is architected from first principles for zero cloud data leakage:
            </p>

            <ul className="space-y-2 font-sans text-xs text-ink/80">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-moss shrink-0 mt-0.5" />
                <span><strong>No external LLM APIs:</strong> Inference runs entirely inside Ollama on your physical machine.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-moss shrink-0 mt-0.5" />
                <span><strong>Local SQLite Storage:</strong> All resumes, recruiter notes, and email history stay on your local disk.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-moss shrink-0 mt-0.5" />
                <span><strong>No Tracking Telemetry:</strong> No external analytics scripts or behavioral trackers are loaded.</span>
              </li>
            </ul>
          </section>

          {/* Quick CLI Cheatsheet */}
          <section className="bg-paper hairline p-6 space-y-3 shadow-sm font-mono text-xs">
            <span className="font-bold uppercase tracking-wider text-ink block border-b hairline pb-2">
              Management Commands
            </span>
            <div className="space-y-2 text-[11px] text-ink/80">
              <div>
                <span className="text-ash block">Seed Mock Outreach Ledger:</span>
                <code className="bg-bone px-1.5 py-0.5 block mt-0.5">pnpm seed</code>
              </div>
              <div>
                <span className="text-ash block">Reset Database & Re-seed:</span>
                <code className="bg-bone px-1.5 py-0.5 block mt-0.5">pnpm seed:reset</code>
              </div>
              <div>
                <span className="text-ash block">Run Chaos Recovery Harness:</span>
                <code className="bg-bone px-1.5 py-0.5 block mt-0.5">pnpm chaos</code>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
