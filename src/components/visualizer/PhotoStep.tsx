'use client';

import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { KitchenPhoto } from '@/components/visualizer/KitchenPhoto';
import { PhotoUpload } from '@/components/visualizer/PhotoUpload';
import { sendEmbedEvent } from '@/lib/embed/events';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';

const tips = [
  'Zorg voor voldoende licht',
  'Zorg dat de keuken goed zichtbaar is',
  'Maak de foto niet te schuin',
  'Zorg dat kastfronten niet volledig worden afgedekt',
];

export function PhotoStep() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { originalPreviewUrl, setOriginalImage, setStep } = useKitchenVisualizer();

  const handleSelect = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setOriginalImage(file, previewUrl);
    sendEmbedEvent('kitchen_photo_uploaded', { fileSize: file.size, fileType: file.type });
  };

  return (
    <section className="animate-in fade-in duration-300">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">1. Upload een foto van je keuken</h2>
        <p className="mt-2 text-sm text-slate-600">
          Gebruik bij voorkeur een duidelijke foto waarop de keukenfronten goed zichtbaar zijn.
        </p>

        <div className="mt-4">
          {!originalPreviewUrl ? (
            <PhotoUpload onSelect={handleSelect} />
          ) : (
            <KitchenPhoto
              src={originalPreviewUrl}
              onReplace={() => inputRef.current?.click()}
              onRemove={() => {
                if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
                setOriginalImage(null, null);
              }}
            />
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          capture="environment"
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
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {originalPreviewUrl && (
          <div className="mt-6 flex justify-end">
            <Button type="button" size="lg" onClick={() => setStep('colors')}>
              Kies een kleur
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
