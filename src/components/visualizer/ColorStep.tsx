'use client';

import { Sparkles } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MaterialGrid } from '@/components/visualizer/MaterialGrid';
import { getMaterialById } from '@/lib/materials';
import { sendEmbedEvent } from '@/lib/embed/events';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';

interface ColorStepProps {
  onGenerate: (materialId: string) => void;
}

export function ColorStep({ onGenerate }: ColorStepProps) {
  const {
    activeMaterialId,
    viewedMaterialIds,
    visualizations,
    setActiveMaterialId,
  } = useKitchenVisualizer();

  const handleSelect = useCallback(
    (id: string) => {
      setActiveMaterialId(id);
      sendEmbedEvent('material_selected', { materialId: id });
    },
    [setActiveMaterialId],
  );

  const handleGenerate = () => {
    if (!activeMaterialId) return;

    const cached = visualizations[activeMaterialId];
    if (cached) {
      useKitchenVisualizer.getState().setStep('result');
      return;
    }

    onGenerate(activeMaterialId);
  };

  const material = activeMaterialId ? getMaterialById(activeMaterialId) : null;

  return (
    <section className="animate-in fade-in duration-300">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">2. Welke kleur wil je proberen?</h2>
        <p className="mt-2 text-sm text-slate-600">
          Kies een kleur, bekijk het resultaat en vink maximaal 2 samples aan.
        </p>

        <div className="mt-5">
          <MaterialGrid
            activeMaterialId={activeMaterialId}
            viewedMaterialIds={viewedMaterialIds}
            onSelect={handleSelect}
          />
        </div>

        {material && (
          <div className="sticky bottom-0 mt-6 -mx-5 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
            <Button type="button" size="lg" className="w-full sm:w-auto" onClick={handleGenerate}>
              <Sparkles className="h-4 w-4" />
              Bekijk deze kleur op mijn keuken
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
