'use client';

import { useState, useEffect } from 'react';

export interface CountdownResult {
  formatted: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
}

export function useCountdown(targetISO?: string | null): CountdownResult {
  const calculate = (): CountdownResult => {
    if (!targetISO) {
      return {
        formatted: '--:--:--',
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isExpired: true,
      };
    }

    const target = new Date(targetISO).getTime();
    const now = Date.now();
    const diffMs = target - now;

    if (diffMs <= 0) {
      return {
        formatted: '00:00:00 (DUE NOW)',
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isExpired: true,
      };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let formatted = '';
    if (days > 0) {
      formatted = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    } else if (hours > 0) {
      formatted = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    } else {
      formatted = `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }

    return {
      formatted,
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      isExpired: false,
    };
  };

  const [state, setState] = useState<CountdownResult>(calculate());

  useEffect(() => {
    setState(calculate());

    if (!targetISO) return;

    const interval = setInterval(() => {
      setState(calculate());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetISO]);

  return state;
}
