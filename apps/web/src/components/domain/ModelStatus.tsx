'use client';

import React from 'react';
import { Sparkles, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export interface ModelStatusProps {
  status?: 'ok' | 'degraded' | 'offline';
  modelName?: string;
  latencyMs?: number | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ModelStatus({
  status = 'ok',
  modelName = 'gemma 3:4b',
  latencyMs,
  onRefresh,
  isRefreshing = false,
}: ModelStatusProps) {
  const statusConfig = {
    ok: {
      color: 'text-moss bg-emerald-50 border-emerald-300',
      dot: 'bg-moss',
      label: 'Local Gemma Ready',
      desc: 'Local Ollama instance operational with zero external cloud leaks.',
      icon: ShieldCheck,
    },
    degraded: {
      color: 'text-amber-800 bg-amber-50 border-amber-300',
      dot: 'bg-amber-500',
      label: 'Ollama Degraded',
      desc: 'Inference slow or timed out; deterministic fallback templates active.',
      icon: AlertTriangle,
    },
    offline: {
      color: 'text-signal-orange bg-red-50 border-red-300',
      dot: 'bg-signal-orange',
      label: 'Ollama Offline',
      desc: 'Ollama server unreachable at localhost:11434. Templates will be used.',
      icon: AlertTriangle,
    },
  };

  const current = statusConfig[status];
  const Icon = current.icon;

  return (
    <div className={`p-4 hairline ${current.color} shadow-sm space-y-2`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${current.dot} animate-pulse`} />
          <span className="font-mono text-xs font-black uppercase tracking-wider">
            {current.label}
          </span>
          <span className="font-mono text-xs text-ash bg-paper px-2 py-0.5 hairline">
            {modelName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {latencyMs !== undefined && latencyMs !== null && (
            <span className="font-mono text-xs text-ash">{latencyMs}ms</span>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1 text-ash hover:text-ink transition-colors"
              title="Refresh local model status"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
          )}
        </div>
      </div>

      <p className="font-sans text-xs text-ink/80 leading-relaxed">
        {current.desc}
      </p>
    </div>
  );
}
