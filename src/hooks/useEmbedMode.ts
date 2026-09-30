'use client';

import { useEffect, useState } from 'react';

export function useEmbedMode(): boolean {
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    const inIframe = window.self !== window.top;
    const embedQuery =
      new URLSearchParams(window.location.search).get('embed') === '1';
    const isEmbed = inIframe || embedQuery;
    setEmbedded(isEmbed);

    if (isEmbed) {
      document.documentElement.classList.add('kv-embed');
    }

    return () => {
      document.documentElement.classList.remove('kv-embed');
    };
  }, []);

  return embedded;
}
