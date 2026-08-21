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

  const handleReplace = () => inputRef.current?.click();

  const handleRemove = () => {
    if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    setOriginalImage(null, null);
  };

  return (
    <section className="animate-in fade-in duration-300">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
          Upload een foto van je keuken
        </h2>
        <p className="mt-3 text-stone-600">
          Gebruik bij voorkeur een duidelijke foto waarop de keukenfronten goed zichtbaar zijn.
        </p>
      </div>

      {!originalPreviewUrl ? (
        <PhotoUpload onSelect={handleSelect} />
      ) : (
        <KitchenPhoto
          src={originalPreviewUrl}
          onReplace={handleReplace}
          onRemove={handleRemove}
        />
      )}

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

      <div className="mt-6 rounded-xl bg-stone-100/60 p-4 text-sm text-stone-500">
        <p className="font-medium text-stone-600 mb-2">Voor het beste resultaat:</p>
        <ul className="grid gap-1 sm:grid-cols-2">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-400" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {originalPreviewUrl && (
        <div className="mt-8 flex justify-end">
          <Button type="button" size="lg" onClick={() => setStep('colors')}>
            Kies een kleur
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
}
