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

    let frame = 0;

    const notify = () => {
      sendHeightToParent(measureDocumentHeight() + 8);
    };

    const scheduleNotify = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(notify);
    };

    notify();

    const observer = new ResizeObserver(scheduleNotify);

    observer.observe(document.documentElement);
    if (document.body) {
      observer.observe(document.body);
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
