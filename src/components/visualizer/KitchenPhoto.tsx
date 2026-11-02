'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { notifyEmbedHeight } from '@/lib/embed/notifyHeight';
import { cn } from '@/lib/utils';

interface KitchenPhotoProps {
  src: string;
  alt?: string;
  compact?: boolean;
  onReplace: () => void;
  onRemove: () => void;
}

export function KitchenPhoto({
  src,
  alt = 'Keukenfoto',
  compact = false,
  onReplace,
  onRemove,
}: KitchenPhotoProps) {
  const bumpHeight = () => notifyEmbedHeight();

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-100',
          compact ? 'h-[min(52vw,280px)] sm:h-[280px]' : 'aspect-[4/3]',
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          unoptimized
          onLoad={bumpHeight}
          onLoadingComplete={bumpHeight}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" type="button" onClick={onReplace}>
          Andere foto kiezen
        </Button>
        <Button variant="ghost" type="button" onClick={onRemove}>
          Verwijderen
        </Button>
      </div>
    </div>
  );
}
