'use client';

import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';
import type { VisualizerStep } from '@/types/visualizer';
import { canNavigateToStep, stepToProgressIndex } from '@/lib/stepNavigation';
import { useInIframe } from '@/hooks/useEmbedMode';
import { cn } from '@/lib/utils';

const progressSteps: { key: VisualizerStep; label: string }[] = [
  { key: 'photo', label: 'Foto' },
  { key: 'colors', label: 'Kleur' },
  { key: 'result', label: 'Resultaat' },
  { key: 'samples', label: 'Samples' },
  { key: 'details', label: 'Gegevens' },
];

export function Progress() {
  const embedded = useInIframe();
  const {
    step,
    setStep,
    originalPreviewUrl,
    visualizations,
    selectedSampleIds,
  } = useKitchenVisualizer();

  const current = stepToProgressIndex(step);

  if (step === 'success') return null;

  const context = {
    hasPhoto: Boolean(originalPreviewUrl),
    hasVisualizations: Object.keys(visualizations).length > 0,
    hasSamples: selectedSampleIds.length > 0,
  };

  const handleStepClick = (target: VisualizerStep, index: number) => {
    if (index >= current) return;
    if (!canNavigateToStep(target, step, context)) return;
    setStep(target);
  };

  const currentStep = progressSteps[Math.min(current, progressSteps.length - 1)];

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:px-4 sm:py-3',
        embedded ? 'sticky top-0 z-20 mb-3 bg-white/95 backdrop-blur-sm' : 'mb-8',
      )}
    >
      <div className="hidden sm:flex items-center justify-center gap-2 text-sm text-slate-500">
        {progressSteps.map((item, index) => {
          const isActive = index <= current;
          const isCurrent = index === current;
          const isClickable =
            index < current && canNavigateToStep(item.key, step, context);

          return (
            <div key={item.key} className="flex items-center gap-2">
              {index > 0 && (
                <span className={cn('text-slate-300', isActive && 'text-brand-blue-300')}>→</span>
              )}
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => handleStepClick(item.key, index)}
                  className={cn(
                    'transition-colors underline-offset-2 hover:underline',
                    isCurrent ? 'font-semibold text-brand-blue-800' : 'text-slate-700 hover:text-brand-blue-800',
                  )}
                >
                  {item.label}
                </button>
              ) : (
                <span
                  className={cn(
                    'transition-colors',
                    isCurrent ? 'font-semibold text-brand-blue-800' : isActive ? 'text-slate-700' : 'text-slate-400',
                  )}
                >
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{currentStep?.label}</span>
            <span className="text-slate-500">
              {' '}
              · stap {Math.min(current + 1, 5)}/5
            </span>
          </p>
          {current > 0 && (
            <button
              type="button"
              onClick={() => {
                const prev = progressSteps[current - 1];
                if (prev && canNavigateToStep(prev.key, step, context)) {
                  setStep(prev.key);
                }
              }}
              className="text-sm font-medium text-brand-blue-700 underline"
            >
              Vorige stap
            </button>
          )}
        </div>
        <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-blue-500 transition-all duration-300"
            style={{ width: `${((current + 1) / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
