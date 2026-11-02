import { sendHeightToParent } from '@/lib/embed/events';

export function measureEmbedRootHeight(): number {
  const root = document.querySelector('[data-kv-embed-root]');
  if (root instanceof HTMLElement) {
    return root.scrollHeight;
  }

  const doc = document.documentElement;
  const body = document.body;
  return Math.max(doc.scrollHeight, body.scrollHeight, doc.offsetHeight, body.offsetHeight);
}

export function notifyEmbedHeight(): void {
  if (typeof window === 'undefined' || window.self === window.top) return;
  sendHeightToParent(measureEmbedRootHeight() + 4);
}
