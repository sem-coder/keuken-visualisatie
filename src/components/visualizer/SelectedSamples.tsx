'use client';

import { BeforeAfterSlider } from '@/components/visualizer/BeforeAfterSlider';
import { getMaterialById } from '@/lib/materials';
import { config } from '@/lib/config';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';
import { Check } from 'lucide-react';

export function SelectedSamples() {
  const { selectedSampleIds, visualizations, originalPreviewUrl, removeSample } =
    useKitchenVisualizer();

  if (selectedSampleIds.length === 0) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {selectedSampleIds.map((id) => {
        const material = getMaterialById(id);
        if (!material) return null;
        const visualization = visualizations[id];

        return (
          <article
            key={id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-lg border border-slate-200"
                  style={{ backgroundColor: material.preview }}
                />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{material.name}</p>
                  <p className="text-xs text-slate-500">{material.code}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeSample(id)}
                className="text-xs text-slate-500 underline hover:text-slate-800"
              >
                Verwijderen
              </button>
            </div>

            {visualization && originalPreviewUrl ? (
              <div className="p-3">
                <BeforeAfterSlider
                  beforeSrc={originalPreviewUrl}
                  afterSrc={visualization.imageUrl}
                  className="rounded-lg border-0 shadow-none"
                />
              </div>
            ) : (
              <div
                className="mx-3 my-3 flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-slate-200"
                style={{ backgroundColor: `${material.preview}33` }}
              >
                <div className="text-center px-4">
                  <div
                    className="mx-auto mb-2 h-14 w-14 rounded-xl border border-slate-200 shadow-sm"
                    style={{ backgroundColor: material.preview }}
                  />
                  <p className="text-sm text-slate-600">Visualisatie volgt na genereren</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-2 text-xs text-amber-800 bg-amber-50">
              <Check className="h-3.5 w-3.5" />
              Sample {selectedSampleIds.indexOf(id) + 1} van {config.maxSamples}
            </div>
          </article>
        );
      })}
    </div>
  );
}
