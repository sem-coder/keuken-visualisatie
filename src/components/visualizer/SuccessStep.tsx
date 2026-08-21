'use client';

import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';
import { getMaterialById } from '@/lib/materials';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';

export function SuccessStep() {
  const { selectedSampleIds, visualizations, resetForNewColor, resetAll } =
    useKitchenVisualizer();

  return (
    <section className="animate-in fade-in duration-300 text-center py-8">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-8 w-8 text-green-700" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
        Je samples zijn aangevraagd
      </h2>
      <p className="mt-3 text-stone-600">We hebben je aanvraag ontvangen.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 max-w-lg mx-auto">
        {selectedSampleIds.map((id) => {
          const material = getMaterialById(id);
          if (!material) return null;
          const visualization = visualizations[id];

          return (
            <div
              key={id}
              className="rounded-2xl border border-stone-200 bg-white p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-lg border border-stone-200"
                  style={{ backgroundColor: material.preview }}
                />
                <div>
                  <p className="font-medium text-stone-900">{material.name}</p>
                  <p className="text-sm text-stone-500">{material.code}</p>
                </div>
              </div>
              {visualization && (
                <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={visualization.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Button type="button" size="lg" onClick={resetForNewColor}>
          Nog een kleur bekijken
        </Button>
        {config.parentWebsiteUrl && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => {
              window.parent.location.href = config.parentWebsiteUrl;
            }}
          >
            Terug naar de website
          </Button>
        )}
        {!config.parentWebsiteUrl && (
          <Button type="button" variant="secondary" size="lg" onClick={resetAll}>
            Opnieuw beginnen
          </Button>
        )}
      </div>
    </section>
  );
}
