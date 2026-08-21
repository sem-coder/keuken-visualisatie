'use client';

import { SampleRequestForm } from '@/components/visualizer/SampleRequestForm';
import { SelectedSamples } from '@/components/visualizer/SelectedSamples';

export function DetailsStep() {
  return (
    <section className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
          Waar mogen we de samples naartoe sturen?
        </h2>
      </div>

      <div className="mb-8">
        <SelectedSamples />
      </div>

      <SampleRequestForm />
    </section>
  );
}
