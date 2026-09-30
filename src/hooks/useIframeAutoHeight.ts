'use client';

import { useEffect } from 'react';
import { sendHeightToParent } from '@/lib/embed/events';

function measureEmbedHeight(): number {
  const root = document.querySelector('[data-kv-embed-root]');
  if (root instanceof HTMLElement) {
    return root.scrollHeight;
  }

  const doc = document.documentElement;
  const body = document.body;
  return Math.min(
    Math.max(doc.scrollHeight, body.scrollHeight),
    Math.max(doc.offsetHeight, body.offsetHeight),
  );
}

export function useIframeAutoHeight(resizeKey: string): void {
  useEffect(() => {
    if (window.self === window.top) return;

    let frame = 0;

    const notify = () => {
      sendHeightToParent(measureEmbedHeight() + 4);
    };

    const scheduleNotify = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(notify);
    };

    scheduleNotify();

    const root = document.querySelector('[data-kv-embed-root]');
    const observer = new ResizeObserver(scheduleNotify);

    if (root instanceof HTMLElement) {
      observer.observe(root);
    } else {
      observer.observe(document.documentElement);
      if (document.body) observer.observe(document.body);
    }

    window.addEventListener('resize', scheduleNotify);

    const onMessage = (event: MessageEvent) => {
      if (
        event.data &&
        typeof event.data === 'object' &&
        (event.data as { type?: string }).type === 'kitchen-visualizer-resize'
      ) {
        scheduleNotify();
      }
    };
    window.addEventListener('message', onMessage);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', scheduleNotify);
      window.removeEventListener('message', onMessage);
    };
  }, [resizeKey]);
}
