import type { Attribution } from '@/types/visualizer';

export type EmbedEvent =
  | 'visualizer_view'
  | 'kitchen_photo_uploaded'
  | 'material_selected'
  | 'visualization_started'
  | 'visualization_completed'
  | 'visualization_failed'
  | 'sample_selected'
  | 'sample_removed'
  | 'sample_form_view'
  | 'sample_request_submitted';

export interface EmbedMessage {
  type: 'kitchen-visualizer-event';
  event: EmbedEvent;
  payload?: Record<string, unknown>;
}

export function sendEmbedEvent(
  event: EmbedEvent,
  payload?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;

  const message: EmbedMessage = {
    type: 'kitchen-visualizer-event',
    event,
    payload,
  };

  window.parent.postMessage(message, getParentOrigin());
}

export function sendHeightToParent(height: number): void {
  if (typeof window === 'undefined') return;

  window.parent.postMessage(
    {
      type: 'kitchen-visualizer-height',
      height,
    },
    getParentOrigin(),
  );
}

function getParentOrigin(): string {
  return process.env.NEXT_PUBLIC_PARENT_ORIGIN ?? '*';
}

export type ParentMessage =
  | { type: 'kitchen-visualizer-attribution'; attribution: Attribution }
  | { type: 'kitchen-visualizer-resize' };

export function isParentMessage(data: unknown): data is ParentMessage {
  if (!data || typeof data !== 'object') return false;
  const record = data as Record<string, unknown>;
  return (
    record.type === 'kitchen-visualizer-attribution' ||
    record.type === 'kitchen-visualizer-resize'
  );
}
