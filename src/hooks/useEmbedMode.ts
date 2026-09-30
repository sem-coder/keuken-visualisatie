'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

function detectEmbedMode(initialCompact: boolean): boolean {
  if (typeof window === 'undefined') return initialCompact;
  if (initialCompact) return true;
  if (window.self !== window.top) return true;
  return new URLSearchParams(window.location.search).get('embed') === '1';
}

export function useEmbedMode(initialCompact = false): boolean {
  const [embedded, setEmbedded] = useState(() => detectEmbedMode(initialCompact));

  useLayoutEffect(() => {
    const isEmbed = detectEmbedMode(initialCompact);
    if (isEmbed) {
      document.documentElement.classList.add('kv-embed');
    }
  }, [initialCompact]);

  useEffect(() => {
    const isEmbed = detectEmbedMode(initialCompact);
    setEmbedded(isEmbed);

    if (!isEmbed) {
      document.documentElement.classList.remove('kv-embed');
    }

    return () => {
      document.documentElement.classList.remove('kv-embed');
    };
  }, [initialCompact]);

  return embedded;
}
