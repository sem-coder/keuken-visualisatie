'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelectedSamples } from '@/components/visualizer/SelectedSamples';
import { config } from '@/lib/config';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';

export function SampleSelection() {
  const { selectedSampleIds, setStep } = useKitchenVisualizer();

  if (selectedSampleIds.length === 0) {
    return (
      <section className="text-center py-12 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <p className="text-slate-600">Je hebt nog geen samples gekozen.</p>
        <Button type="button" className="mt-4" onClick={() => setStep('colors')}>
          Kies een kleur
        </Button>
      </section>
    );
  }

  return (
    <section className="animate-in fade-in duration-300">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-slate-900">Jouw samples</h2>
        <p className="mt-2 text-sm text-slate-600">
          Je hebt {selectedSampleIds.length} van {config.maxSamples} samples gekozen met
          visualisatie op jouw keuken.
        </p>

        <div className="mt-6">
          <SelectedSamples />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between">
          <Button type="button" variant="secondary" onClick={() => setStep('colors')}>
            Nog een kleur toevoegen
          </Button>
          <Button type="button" size="lg" onClick={() => setStep('details')}>
            Vul je gegevens in
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
