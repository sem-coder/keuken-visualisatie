'use client';

import { ArrowRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { KitchenPhoto } from '@/components/visualizer/KitchenPhoto';
import { PhotoUpload } from '@/components/visualizer/PhotoUpload';
import { compressKitchenImage } from '@/lib/client/compressKitchenImage';
import { sendEmbedEvent } from '@/lib/embed/events';
import { useInIframe } from '@/hooks/useEmbedMode';
import { notifyEmbedHeight } from '@/lib/embed/notifyHeight';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';
import { cn } from '@/lib/utils';

const tips = [
  'Zorg voor voldoende licht',
  'Zorg dat de keuken goed zichtbaar is',
  'Maak de foto niet te schuin',
  'Zorg dat kastfronten niet volledig worden afgedekt',
];

export function PhotoStep() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);
  const embedded = useInIframe();
  const { originalPreviewUrl, setOriginalImage, setStep } = useKitchenVisualizer();

  const handleSelect = async (file: File) => {
    setCompressing(true);
    try {
      const compressed = await compressKitchenImage(file);
      const previewUrl = URL.createObjectURL(compressed);
      setOriginalImage(compressed, previewUrl);
      sendEmbedEvent('kitchen_photo_uploaded', {
        fileSize: compressed.size,
        fileType: compressed.type,
      });
      requestAnimationFrame(() => {
        notifyEmbedHeight();
        window.setTimeout(notifyEmbedHeight, 300);
      });
    } finally {
      setCompressing(false);
    }
  };

  return (
    <section className="animate-in fade-in duration-300">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">1. Upload een foto van je keuken</h2>
        <p className="mt-2 text-sm text-slate-600">
          Gebruik bij voorkeur een duidelijke foto waarop de keukenfronten goed zichtbaar zijn.
        </p>

        <div className="mt-4">
          {compressing ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
              Foto optimaliseren...
            </div>
          ) : !originalPreviewUrl ? (
            <PhotoUpload onSelect={handleSelect} />
          ) : (
            <KitchenPhoto
              src={originalPreviewUrl}
              compact={embedded}
              onReplace={() => inputRef.current?.click()}
              onRemove={() => {
                if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
                setOriginalImage(null, null);
                notifyEmbedHeight();
              }}
            />
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleSelect(file);
          }}
        />

        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          <p className="font-medium text-slate-600 mb-2">Voor het beste resultaat:</p>
          <ul className="grid gap-1 sm:grid-cols-2">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-blue-500" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {originalPreviewUrl && (
          <div
            className={cn(
              'mt-6 flex justify-end',
              embedded &&
                'sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6',
            )}
          >
            <Button
              type="button"
              size="lg"
              className={embedded ? 'w-full sm:w-auto' : undefined}
              onClick={() => setStep('colors')}
            >
              Kies een kleur
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
