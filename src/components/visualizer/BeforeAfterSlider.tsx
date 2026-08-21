'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
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

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative aspect-[4/3] w-full select-none overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 touch-none',
        className,
      )}
      role="slider"
      aria-label="Vergelijk voor en na"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0">
        <Image src={afterSrc} alt={afterLabel} fill className="object-contain" unoptimized priority />
      </div>

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image src={beforeSrc} alt={beforeLabel} fill className="object-contain" unoptimized priority />
      </div>

      <span className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white">
        {beforeLabel}
      </span>
      <span className="absolute right-3 top-3 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white">
        {afterLabel}
      </span>

      <div
        className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white shadow-lg"
        style={{ left: `${position}%` }}
      >
        <button
          type="button"
          aria-label="Sleep om te vergelijken"
          className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-stone-900 shadow-xl cursor-ew-resize"
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
