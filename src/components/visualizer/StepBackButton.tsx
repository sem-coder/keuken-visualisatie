'use client';

import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPreviousStep } from '@/lib/stepNavigation';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';
import type { VisualizerStep } from '@/types/visualizer';

interface StepBackButtonProps {
  label?: string;
  to?: VisualizerStep;
}

export function StepBackButton({ label = 'Terug', to }: StepBackButtonProps) {
  const { step, setStep } = useKitchenVisualizer();
  const target = to ?? getPreviousStep(step);

  if (!target || step === 'generating' || step === 'success') return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="mb-4 -ml-2 text-slate-600 hover:text-slate-900"
      onClick={() => setStep(target)}
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
