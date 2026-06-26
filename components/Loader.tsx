'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible]   = useState(false);
  const tickRef    = useRef<NodeJS.Timeout | null>(null);
  const hideRef    = useRef<NodeJS.Timeout | null>(null);
  const startedRef = useRef(false);           // ← track if loader was actually started
  const pathname   = usePathname();
  const prevPath   = useRef(pathname);        // ← skip finish() on initial mount

  const start = useCallback(() => {
    if (hideRef.current) clearTimeout(hideRef.current);   // cancel any pending hide
    if (tickRef.current) clearTimeout(tickRef.current);

    startedRef.current = true;
    setProgress(0);
    setVisible(true);

    let current = 0;
    const tick = () => {
      current += current < 40 ? 8 : current < 70 ? 4 : current < 85 ? 1 : 0.3;
      if (current > 85) current = 85;
      setProgress(current);
      tickRef.current = setTimeout(tick, 120);
    };
    tick();
  }, []);

  const finish = useCallback(() => {
    if (!startedRef.current) return;          // ← never started? do nothing
    if (tickRef.current) clearTimeout(tickRef.current);
    startedRef.current = false;
    setProgress(100);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 400);
  }, []);

  // Link click → start
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('[data-no-loader]') ||
        target.closest('.no-loader') ||
        target.closest('.submenu')
      ) return;

      const link = target.closest('a');
      if (
        link &&
        link.hostname === window.location.hostname &&
        link.href !== window.location.href
      ) start();
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [start]);

  // Pathname change → finish (initial mount pe NAHI)
  useEffect(() => {
    if (prevPath.current === pathname) return;   // ← same path = skip
    prevPath.current = pathname;
    finish();
  }, [pathname, finish]);

  // Cleanup
  useEffect(() => () => {
    if (tickRef.current) clearTimeout(tickRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px]" style={{ pointerEvents: 'none' }}>
      <div
        className="h-full bg-blue-500 transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '300ms' : '120ms',
          boxShadow: '0 0 8px rgba(59, 130, 246, 0.7)',
        }}
      />
    </div>
  );
}