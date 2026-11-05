'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
} from 'react';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

function readAspectRatio(event: SyntheticEvent<HTMLImageElement>): number | null {
  const { naturalWidth, naturalHeight } = event.currentTarget;
  if (!naturalWidth || !naturalHeight) return null;
  return naturalWidth / naturalHeight;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Voor',
  afterLabel = 'Na',
  className,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const syncAspectRatio = useCallback((ratio: number | null) => {
    if (!ratio) return;
    setAspectRatio((current) => {
      if (current === null) return ratio;
      return Math.abs(current - ratio) > 0.01 ? ratio : current;
    });
  }, []);

  useEffect(() => {
    setAspectRatio(null);
  }, [beforeSrc, afterSrc]);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setPosition(percent);
  }, []);

  const handlePointerDown = (event: ReactPointerEvent) => {
    event.preventDefault();
    setIsDragging(true);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    updatePosition(event.clientX);
  };

  const handlePointerMove = (event: ReactPointerEvent) => {
    if (!isDragging) return;
    updatePosition(event.clientX);
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setPosition((p) => Math.max(0, p - 2));
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setPosition((p) => Math.min(100, p + 2));
    }
  };

  useEffect(() => {
    const handleGlobalPointerUp = () => setIsDragging(false);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
  }, []);

  const imgClass =
    'kv-fit-img pointer-events-none absolute inset-0 h-full w-full max-h-full max-w-full object-contain object-center';

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full max-h-[min(58vh,640px)] sm:max-h-[min(72vh,640px)] select-none overflow-hidden rounded-xl border border-slate-200 bg-slate-100 touch-none shadow-sm',
        aspectRatio === null && 'aspect-[4/3]',
        className,
      )}
      style={aspectRatio !== null ? { aspectRatio: `${aspectRatio}` } : undefined}
      role="slider"
      aria-label="Vergelijk voor en na"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterSrc}
        alt={afterLabel}
        className={imgClass}
        draggable={false}
        onLoad={(event) => syncAspectRatio(readAspectRatio(event))}
      />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className={imgClass}
          draggable={false}
          onLoad={(event) => syncAspectRatio(readAspectRatio(event))}
        />
      </div>

      <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 z-20 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
        {afterLabel}
      </span>

      <div
        className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white shadow-lg"
        style={{ left: `${position}%` }}
      >
        <button
          type="button"
          aria-label="Sleep om te vergelijken"
          className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-2 border-white bg-brand-blue-500 shadow-xl"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <span className="flex gap-0.5">
            <span className="h-4 w-0.5 bg-white/80" />
            <span className="h-4 w-0.5 bg-white/80" />
          </span>
        </button>
      </div>
    </div>
  );
}
