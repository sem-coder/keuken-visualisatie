'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMaterialById } from '@/lib/materials';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';

export function SelectedSamples() {
  const { selectedSampleIds, visualizations, removeSample } = useKitchenVisualizer();

  if (selectedSampleIds.length === 0) return null;

  return (
    <div className="space-y-4">
      {selectedSampleIds.map((id) => {
        const material = getMaterialById(id);
        if (!material) return null;
        const visualization = visualizations[id];

        return (
          <div
            key={id}
            className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4"
          >
            <div
              className="h-16 w-16 shrink-0 rounded-xl border border-stone-200"
              style={{ backgroundColor: material.preview }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-900">{material.name}</p>
              <p className="text-sm text-stone-500">{material.code}</p>
            </div>
            {visualization && (
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-stone-200">
                <Image
                  src={visualization.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Verwijder ${material.name}`}
              onClick={() => removeSample(id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
