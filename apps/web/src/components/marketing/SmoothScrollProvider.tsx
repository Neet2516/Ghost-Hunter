'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Lenis from 'lenis';

interface MotionContextType {
  reducedMotion: boolean;
  setReducedMotion: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const MotionContext = createContext<MotionContextType>({
  reducedMotion: false,
  setReducedMotion: () => {},
});

export const useMotionPreference = () => useContext(MotionContext);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check system preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Initialize Lenis only if reduced motion is NOT active
  useEffect(() => {
    if (typeof window === 'undefined' || reducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return (
    <MotionContext.Provider value={{ reducedMotion, setReducedMotion }}>
      {children}
    </MotionContext.Provider>
  );
}
