'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelectedSamples } from '@/components/visualizer/SelectedSamples';
import { StepBackButton } from '@/components/visualizer/StepBackButton';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';

interface SampleSelectionProps {
  onGenerateSelected?: () => void;
}

export function SampleSelection({ onGenerateSelected }: SampleSelectionProps) {
  const { selectedSampleIds, visualizations, setStep } = useKitchenVisualizer();

  const missingCount = selectedSampleIds.filter((id) => !visualizations[id]).length;
  const allVisualized = missingCount === 0;

  if (selectedSampleIds.length === 0) {
    return (
      <section className="text-center py-12 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <StepBackButton label="Terug naar kleuren" to="colors" />
        <p className="text-slate-600">Je hebt nog geen samples gekozen.</p>
        <Button type="button" className="mt-4" onClick={() => setStep('colors')}>
          Kies een kleur
        </Button>
      </section>
    );
  }

  return (
    <section className="animate-in fade-in duration-300">
      <StepBackButton label="Terug naar kleuren" to="colors" />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-slate-900">Jouw samples</h2>
        <p className="mt-2 text-sm text-slate-600">
          {allVisualized
            ? 'Bekijk je keuken in de gekozen kleuren voordat je je gegevens invult.'
            : `Genereer eerst ${missingCount === 1 ? 'de visualisatie' : 'beide visualisaties'} om je keuken in de nieuwe kleur te zien.`}
        </p>

        {!allVisualized && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              Visualisaties zijn nog niet gemaakt. Klik hieronder om je keuken in de
              geselecteerde kleuren te bekijken.
            </p>
            <Button type="button" className="mt-3" onClick={() => onGenerateSelected?.()}>
              <Sparkles className="h-4 w-4" />
              {missingCount === selectedSampleIds.length
                ? 'Bekijk beide kleuren op mijn keuken'
                : 'Visualisatie genereren'}
            </Button>
          </div>
        )}

        <div className="mt-6">
          <SelectedSamples />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between">
          <Button type="button" variant="secondary" onClick={() => setStep('colors')}>
            Samples wijzigen
          </Button>
          <Button
            type="button"
            size="lg"
            disabled={!allVisualized}
            onClick={() => setStep('details')}
          >
            Vul je gegevens in
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {!allVisualized && (
          <p className="mt-3 text-xs text-slate-500">
            Je gegevens invullen wordt beschikbaar zodra de visualisaties klaar zijn.
          </p>
        )}
      </div>
    </section>
  );
}
