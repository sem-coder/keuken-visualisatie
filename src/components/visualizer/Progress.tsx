'use client';

import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';
import type { VisualizerStep } from '@/types/visualizer';
import { cn } from '@/lib/utils';

const progressSteps: { key: VisualizerStep; label: string }[] = [
  { key: 'photo', label: 'Foto' },
  { key: 'colors', label: 'Kleur' },
  { key: 'result', label: 'Resultaat' },
  { key: 'samples', label: 'Samples' },
  { key: 'details', label: 'Gegevens' },
];

function stepIndex(step: VisualizerStep): number {
  if (step === 'generating') return 2;
  if (step === 'success') return 5;
  const map: Record<VisualizerStep, number> = {
    photo: 0,
    colors: 1,
    generating: 2,
    result: 2,
    samples: 3,
    details: 4,
    success: 5,
  };
  return map[step];
}

export function Progress() {
  const step = useKitchenVisualizer((s) => s.step);
  const current = stepIndex(step);

  if (step === 'success') return null;

  return (
    <div className="mb-8">
      <div className="hidden sm:flex items-center justify-center gap-2 text-sm text-stone-500">
        {progressSteps.map((item, index) => {
          const isActive = index <= current;
          const isCurrent = index === current;
          return (
            <div key={item.key} className="flex items-center gap-2">
              {index > 0 && (
                <span className={cn('text-stone-300', isActive && 'text-stone-400')}>→</span>
              )}
              <span
                className={cn(
                  'transition-colors',
                  isCurrent ? 'font-medium text-stone-900' : isActive ? 'text-stone-600' : 'text-stone-400',
                )}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="sm:hidden">
        <p className="text-center text-sm text-stone-500 mb-2">
          Stap {Math.min(current + 1, 5)} van 5
        </p>
        <div className="h-1.5 rounded-full bg-stone-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-stone-800 transition-all duration-300"
            style={{ width: `${((current + 1) / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
