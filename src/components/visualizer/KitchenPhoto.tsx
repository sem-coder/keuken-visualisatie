'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface KitchenPhotoProps {
  src: string;
  alt?: string;
  onReplace: () => void;
  onRemove: () => void;
}

export function KitchenPhoto({ src, alt = 'Keukenfoto', onReplace, onRemove }: KitchenPhotoProps) {
  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
        <Image src={src} alt={alt} fill className="object-contain" unoptimized />
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
