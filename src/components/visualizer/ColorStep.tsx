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
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
          Welke kleur wil je proberen?
        </h2>
        <p className="mt-3 text-stone-600">
          Kies een kleur of materiaal en bekijk hoe deze op jouw eigen keuken staat.
        </p>
      </div>

      <MaterialGrid
        activeMaterialId={activeMaterialId}
        viewedMaterialIds={viewedMaterialIds}
        onSelect={handleSelect}
      />

      {material && (
        <div className="sticky bottom-0 mt-8 -mx-4 px-4 py-4 bg-gradient-to-t from-[#F7F5F2] via-[#F7F5F2] to-transparent sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-none">
          <Button type="button" size="lg" className="w-full sm:w-auto" onClick={handleGenerate}>
            <Sparkles className="h-4 w-4" />
            Bekijk deze kleur op mijn keuken
          </Button>
        </div>
      )}
    </section>
  );
}
