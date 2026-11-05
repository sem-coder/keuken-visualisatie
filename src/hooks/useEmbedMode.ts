'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

function detectInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  return window.self !== window.top;
}

function detectEmbedDocument(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.self !== window.top) return true;
  return new URLSearchParams(window.location.search).get('embed') === '1';
}

/** True when running inside a parent page iframe. */
export function useInIframe(): boolean {
  const [inIframe, setInIframe] = useState(false);

  useEffect(() => {
    setInIframe(detectInIframe());
  }, []);

  return inIframe;
}

/** Applies embed-specific document styles (overflow, box sizing). */
export function useEmbedDocument(): void {
  useLayoutEffect(() => {
    if (!detectEmbedDocument()) return;
    document.documentElement.classList.add('kv-embed');
    return () => {
      document.documentElement.classList.remove('kv-embed');
    };
  }, []);
}

/** @deprecated Use useInIframe() — kept for gradual migration */
export function useEmbedMode(initialCompact = false): boolean {
  const inIframe = useInIframe();
  if (initialCompact) return true;
  if (inIframe) return true;
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('embed') === '1';
}
