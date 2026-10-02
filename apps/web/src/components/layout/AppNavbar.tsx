'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Plus, Radio, Layers, Settings, Activity } from 'lucide-react';
import { Button } from '@/components/primitives';

export interface AppNavbarProps {
  modelStatus?: 'ok' | 'degraded' | 'offline';
  unreadNotificationsCount?: number;
}

export function AppNavbar({
  modelStatus = 'ok',
  unreadNotificationsCount = 0,
}: AppNavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Dashboard', href: '/app', icon: Activity },
    { label: 'Applications', href: '/app/applications', icon: Layers },
    { label: 'Notifications', href: '/app/notifications', icon: Bell },
    { label: 'Settings', href: '/app/settings', icon: Settings },
  ];

  const modelStatusStyles = {
    ok: { dot: 'bg-moss', label: 'Ollama: Ready' },
    degraded: { dot: 'bg-status-review', label: 'Ollama: Degraded' },
    offline: { dot: 'bg-status-failed', label: 'Ollama: Offline' },
  };

  const currentStatus = modelStatusStyles[modelStatus];

  return (
    <nav className="w-full bg-paper hairline-b sticky top-0 z-50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center gap-6">
            <Link href="/app" className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-ink text-paper hairline flex items-center justify-center font-black text-xs shadow-sm group-hover:bg-signal transition-colors">
                GH
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black tracking-tight text-lg leading-none uppercase">
                  Ghost-Hunter
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-ash">
                  Local Sentinel
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 pl-4 hairline-l">
              {navLinks.map((link) => {
                const isActive =
                  link.href === '/app'
                    ? pathname === '/app'
                    : pathname?.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-mono text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 transition-all ${
                      isActive
                        ? 'bg-ink text-paper shadow-sm'
                        : 'text-ash hover:text-ink hover:bg-bone'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right utility items */}
          <div className="flex items-center gap-4">
            {/* Model Health Dot */}
            <div
              className="hidden sm:flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ash hairline px-2.5 py-1 bg-bone/40"
              title="Local Gemma / Ollama inference status"
            >
              <span className={`w-2 h-2 rounded-full ${currentStatus.dot} animate-pulse`} />
              <span>{currentStatus.label}</span>
            </div>

            {/* Notification Bell */}
            <Link
              href="/app/notifications"
              className="relative p-2 text-ink hover:bg-bone hairline transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-signal text-paper font-mono text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </Link>

            {/* Primary Action Button */}
            <Link href="/app/applications/new">
              <Button
                variant="signal"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                New Hunt
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
