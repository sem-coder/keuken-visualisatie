'use client';

import { Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BeforeAfterSlider } from '@/components/visualizer/BeforeAfterSlider';
import { SelectedSamples } from '@/components/visualizer/SelectedSamples';
import { getMaterialById } from '@/lib/materials';
import { config } from '@/lib/config';
import { sendEmbedEvent } from '@/lib/embed/events';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';
import { cn } from '@/lib/utils';

export function ResultStep() {
  const {
    originalPreviewUrl,
    activeMaterialId,
    visualizations,
    selectedSampleIds,
    toggleSample,
    resetForNewColor,
    setStep,
  } = useKitchenVisualizer();
  const [sampleError, setSampleError] = useState<string | null>(null);

  const material = activeMaterialId ? getMaterialById(activeMaterialId) : null;
  const visualization = activeMaterialId ? visualizations[activeMaterialId] : null;

  if (!originalPreviewUrl || !material || !visualization) return null;

  const isSelected = selectedSampleIds.includes(material.id);
  const atMax = selectedSampleIds.length >= config.maxSamples && !isSelected;
  const canPickSecond = selectedSampleIds.length < config.maxSamples;

  const handleSelectSample = () => {
    const error = toggleSample(material.id);
    if (error) {
      setSampleError(error);
      return;
    }
    setSampleError(null);
    if (!isSelected) {
      sendEmbedEvent('sample_selected', { materialId: material.id });
    } else {
      sendEmbedEvent('sample_removed', { materialId: material.id });
    }
  };

  return (
    <section className="animate-in fade-in duration-300">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Bekijk het verschil</h2>
            <p className="mt-1 text-sm text-slate-600">
              Sleep de schuif om je huidige keuken te vergelijken met de nieuwe kleur.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1 text-sm">
            <span className="rounded-md bg-white px-3 py-1.5 font-medium text-slate-900 shadow-sm">
              Voor / Na
            </span>
          </div>
        </div>

        <BeforeAfterSlider
          beforeSrc={originalPreviewUrl}
          afterSrc={visualization.imageUrl}
        />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-xl border border-slate-200 shadow-sm"
              style={{ backgroundColor: material.preview }}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Je bekijkt
              </p>
              <p className="font-semibold text-slate-900">{material.name}</p>
              <p className="text-sm text-slate-500">{material.code}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              size="lg"
              variant={isSelected ? 'secondary' : 'primary'}
              onClick={handleSelectSample}
              disabled={atMax}
              className={cn(isSelected && 'border-amber-400 bg-amber-50 text-amber-900')}
            >
              {isSelected ? (
                <>
                  <Check className="h-4 w-4" />
                  Sample geselecteerd
                </>
              ) : atMax ? (
                'Maximaal 2 samples'
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Deze sample kiezen
                </>
              )}
            </Button>
            <Button type="button" variant="secondary" size="lg" onClick={resetForNewColor}>
              <Sparkles className="h-4 w-4" />
              {canPickSecond ? 'Tweede kleur proberen' : 'Andere kleur proberen'}
            </Button>
          </div>
        </div>

        {sampleError && <p className="mt-3 text-sm text-red-600">{sampleError}</p>}

        {selectedSampleIds.length > 0 && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>
              {selectedSampleIds.length} van {config.maxSamples} samples gekozen
            </strong>
            {canPickSecond
              ? ' — kies nog een kleur om je tweede gratis sample te selecteren.'
              : ' — je kunt nu je samples aanvragen.'}
          </p>
        )}
      </div>

      {selectedSampleIds.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Jouw gekozen samples</h3>
          <SelectedSamples />
          <div className="mt-6 flex justify-end">
            <Button type="button" size="lg" onClick={() => setStep('samples')}>
              {selectedSampleIds.length === config.maxSamples
                ? 'Samples aanvragen'
                : 'Verder met samples'}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
