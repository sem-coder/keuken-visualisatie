'use client';

import { getMaterialById } from '@/lib/materials';
import { config } from '@/lib/config';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';
import { Button } from '@/components/ui/button';

export function SampleStickyBar() {
  const { selectedSampleIds, setStep } = useKitchenVisualizer();

  if (selectedSampleIds.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur p-4 sm:hidden">
        <div className="mb-3 flex justify-center gap-2">
          {selectedSampleIds.map((id) => {
            const material = getMaterialById(id);
            if (!material) return null;
            return (
              <div key={id} className="text-center">
                <div
                  className="mx-auto h-10 w-10 rounded-lg border-2 border-amber-500 shadow-sm"
                  style={{ backgroundColor: material.preview }}
                />
                <p className="mt-1 text-[10px] text-slate-600 truncate max-w-[72px]">
                  {material.name}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-sm text-slate-600 mb-2 text-center">
          {selectedSampleIds.length} van {config.maxSamples} samples gekozen
        </p>
        <Button type="button" className="w-full" onClick={() => setStep('samples')}>
          Samples aanvragen
        </Button>
      </div>

      <div className="hidden sm:block fixed right-6 bottom-6 z-40 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
        <p className="text-sm font-semibold text-slate-900">
          {selectedSampleIds.length} van {config.maxSamples} samples
        </p>
        <div className="mt-3 space-y-2">
          {selectedSampleIds.map((id) => {
            const material = getMaterialById(id);
            if (!material) return null;
            return (
              <div key={id} className="flex items-center gap-2 text-sm">
                <div
                  className="h-8 w-8 shrink-0 rounded-lg border border-slate-200"
                  style={{ backgroundColor: material.preview }}
                />
                <span className="truncate text-slate-700">{material.name}</span>
              </div>
            );
          })}
        </div>
        <Button type="button" className="w-full mt-4" onClick={() => setStep('samples')}>
          Samples aanvragen
        </Button>
      </div>
    </>
  );
}
