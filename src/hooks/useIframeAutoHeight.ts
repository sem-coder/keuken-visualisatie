'use client';

import { useEffect } from 'react';
import { sendHeightToParent } from '@/lib/embed/events';
import { measureEmbedRootHeight } from '@/lib/embed/notifyHeight';

export function useIframeAutoHeight(resizeKey: string): void {
  useEffect(() => {
    if (window.self === window.top) return;

    let frame = 0;

    const notify = () => {
      sendHeightToParent(measureEmbedRootHeight() + 4);
    };

    const scheduleNotify = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(notify);
    };

    scheduleNotify();
    const delayed = [50, 200, 600, 1200].map((ms) =>
      window.setTimeout(scheduleNotify, ms),
    );

    const root = document.querySelector('[data-kv-embed-root]');
    const observer = new ResizeObserver(scheduleNotify);

    if (root instanceof HTMLElement) {
      observer.observe(root);
    } else {
      observer.observe(document.documentElement);
      if (document.body) observer.observe(document.body);
    }

    window.addEventListener('resize', scheduleNotify);

    const onImageLoad = () => scheduleNotify();
    root?.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', onImageLoad, { once: true });
    });

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
      delayed.forEach((id) => window.clearTimeout(id));
      observer.disconnect();
      window.removeEventListener('resize', scheduleNotify);
      window.removeEventListener('message', onMessage);
      root?.querySelectorAll('img').forEach((img) => {
        img.removeEventListener('load', onImageLoad);
      });
    };
  }, [resizeKey]);
}
