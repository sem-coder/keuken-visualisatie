'use client';

import { useEffect } from 'react';
import { sendHeightToParent } from '@/lib/embed/events';

function measureDocumentHeight(): number {
  const doc = document.documentElement;
  const body = document.body;
  return Math.max(
    doc.scrollHeight,
    doc.offsetHeight,
    body.scrollHeight,
    body.offsetHeight,
  );
}

export function useIframeAutoHeight(resizeKey: string): void {
  useEffect(() => {
    if (window.self === window.top) return;

    const notify = () => {
      sendHeightToParent(measureDocumentHeight() + 8);
    };

    notify();

    const observer = new ResizeObserver(() => {
      notify();
    });

    observer.observe(document.documentElement);
    if (document.body) {
      observer.observe(document.body);
    }

    window.addEventListener('resize', notify);

    const onMessage = (event: MessageEvent) => {
      if (
        event.data &&
        typeof event.data === 'object' &&
        (event.data as { type?: string }).type === 'kitchen-visualizer-resize'
      ) {
        notify();
      }
    };
    window.addEventListener('message', onMessage);

    const interval = window.setInterval(notify, 500);
    const stopBurst = window.setTimeout(() => window.clearInterval(interval), 8000);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', notify);
      window.removeEventListener('message', onMessage);
      window.clearInterval(interval);
      window.clearTimeout(stopBurst);
    };
  }, [resizeKey]);
}
