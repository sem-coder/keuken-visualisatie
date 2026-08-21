'use client';

import { SampleRequestForm } from '@/components/visualizer/SampleRequestForm';
import { SelectedSamples } from '@/components/visualizer/SelectedSamples';
import { StepBackButton } from '@/components/visualizer/StepBackButton';

export function DetailsStep() {
  return (
    <section className="animate-in fade-in duration-300">
      <StepBackButton label="Terug naar samples" to="samples" />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-slate-900">
          Waar mogen we de samples naartoe sturen?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Nog een laatste check van je visualisaties en samples.
        </p>

        <div className="mt-6">
          <SelectedSamples />
        </div>

        <div className="mt-8">
          <SampleRequestForm />
        </div>
      </div>
    </section>
  );
}
