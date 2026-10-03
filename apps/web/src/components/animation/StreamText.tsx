'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface StreamTextProps {
  text: string;
  speed?: number; // ms per character, default 18
  className?: string;
  cursor?: boolean;
  onComplete?: () => void;
  allowSkip?: boolean;
}

export function StreamText({
  text,
  speed = 18,
  className = '',
  cursor = true,
  onComplete,
  allowSkip = true,
}: StreamTextProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const onCompleteCalled = useRef(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayedLength(text.length);
      setIsCompleted(true);
      if (!onCompleteCalled.current) {
        onCompleteCalled.current = true;
        onComplete?.();
      }
      return;
    }

    setDisplayedLength(0);
    setIsCompleted(false);
    onCompleteCalled.current = false;

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex += 1;
      setDisplayedLength(currentIndex);

      if (currentIndex >= text.length) {
        clearInterval(interval);
        setIsCompleted(true);
        if (!onCompleteCalled.current) {
          onCompleteCalled.current = true;
          onComplete?.();
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  const handleSkip = () => {
    if (allowSkip && !isCompleted) {
      setDisplayedLength(text.length);
      setIsCompleted(true);
      if (!onCompleteCalled.current) {
        onCompleteCalled.current = true;
        onComplete?.();
      }
    }
  };

  const visibleText = text.slice(0, displayedLength);

  return (
    <span
      className={`inline whitespace-pre-wrap ${allowSkip && !isCompleted ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleSkip}
      title={allowSkip && !isCompleted ? 'Click to reveal instantly' : undefined}
    >
      {visibleText}
      {!isCompleted && cursor && (
        <span className="inline-block text-signal animate-pulse font-mono ml-0.5 select-none">
          ▋
        </span>
      )}
    </span>
  );
}
