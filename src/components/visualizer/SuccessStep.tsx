'use client';

import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelectedSamples } from '@/components/visualizer/SelectedSamples';
import { config } from '@/lib/config';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';

export function SuccessStep() {
  const { resetForNewColor, resetAll } = useKitchenVisualizer();

  return (
    <section className="animate-in fade-in duration-300">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-700" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900">Je samples zijn aangevraagd</h2>
        <p className="mt-3 text-slate-600">We hebben je aanvraag ontvangen.</p>

        <div className="mt-8 text-left">
          <SelectedSamples />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button type="button" size="lg" onClick={resetForNewColor}>
            Nog een kleur bekijken
          </Button>
          {config.parentWebsiteUrl ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                window.parent.location.href = config.parentWebsiteUrl;
              }}
            >
              Terug naar de website
            </Button>
          ) : (
            <Button type="button" variant="secondary" size="lg" onClick={resetAll}>
              Opnieuw beginnen
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
