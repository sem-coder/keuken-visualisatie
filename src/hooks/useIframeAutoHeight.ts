'use client';

import { useEffect } from 'react';
import { sendHeightToParent } from '@/lib/embed/events';

export function useIframeAutoHeight(resizeKey: string): void {
  useEffect(() => {
    const notify = () => {
      const height = document.documentElement.scrollHeight;
      sendHeightToParent(height);
    };

    notify();

    const observer = new ResizeObserver(() => {
      notify();
    });

    observer.observe(document.documentElement);
    observer.observe(document.body);

    window.addEventListener('resize', notify);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', notify);
    };
  }, [resizeKey]);
}
