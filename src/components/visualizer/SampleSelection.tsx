'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelectedSamples } from '@/components/visualizer/SelectedSamples';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';

export function SampleSelection() {
  const { selectedSampleIds, setStep } = useKitchenVisualizer();

  if (selectedSampleIds.length === 0) {
    return (
      <section className="text-center py-12">
        <p className="text-stone-600">Je hebt nog geen samples gekozen.</p>
        <Button type="button" className="mt-4" onClick={() => setStep('colors')}>
          Kies een kleur
        </Button>
      </section>
    );
  }

  return (
    <section className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
          Jouw samples
        </h2>
        <p className="mt-3 text-stone-600">
          Controleer je selectie voordat je je gegevens invult.
        </p>
      </div>

      <SelectedSamples />

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between">
        <Button type="button" variant="secondary" onClick={() => setStep('result')}>
          Terug naar resultaat
        </Button>
        <Button type="button" size="lg" onClick={() => setStep('details')}>
          Vul je gegevens in
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
