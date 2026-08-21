'use client';

import { Button } from '@/components/ui/button';
import { BeforeAfterSlider } from '@/components/visualizer/BeforeAfterSlider';
import { getMaterialById } from '@/lib/materials';
import { config } from '@/lib/config';
import { sendEmbedEvent } from '@/lib/embed/events';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';
import { useState } from 'react';

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
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
          Bekijk het verschil
        </h2>
        <p className="mt-3 text-stone-600">
          Sleep de schuif om je huidige keuken te vergelijken met de nieuwe kleur.
        </p>
      </div>

      <BeforeAfterSlider
        beforeSrc={originalPreviewUrl}
        afterSrc={visualization.imageUrl}
      />

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">Je bekijkt</p>
          <div className="mt-2 flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg border border-stone-200"
              style={{ backgroundColor: material.preview }}
            />
            <div>
              <p className="font-medium text-stone-900">{material.name}</p>
              <p className="text-sm text-stone-500">{material.code}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            size="lg"
            onClick={handleSelectSample}
            disabled={atMax}
          >
            {isSelected ? 'Sample geselecteerd' : atMax ? 'Maximaal 2 samples' : 'Deze sample kiezen'}
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={resetForNewColor}>
            Andere kleur proberen
          </Button>
        </div>
      </div>

      {sampleError && <p className="mt-3 text-sm text-red-600">{sampleError}</p>}

      {selectedSampleIds.length > 0 && (
        <p className="mt-4 text-sm text-stone-600">
          {selectedSampleIds.length} van {config.maxSamples} samples gekozen
        </p>
      )}

      {selectedSampleIds.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={() => setStep('samples')}>
            Ga verder met samples
          </Button>
        </div>
      )}
    </section>
  );
}
