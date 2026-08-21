import type { VisualizerStep } from '@/types/visualizer';

const previousStep: Partial<Record<VisualizerStep, VisualizerStep>> = {
  colors: 'photo',
  generating: 'colors',
  result: 'colors',
  samples: 'colors',
  details: 'samples',
};

const navigableSteps: VisualizerStep[] = [
  'photo',
  'colors',
  'result',
  'samples',
  'details',
];

export function getPreviousStep(step: VisualizerStep): VisualizerStep | null {
  return previousStep[step] ?? null;
}

export function canNavigateToStep(
  target: VisualizerStep,
  current: VisualizerStep,
  context: {
    hasPhoto: boolean;
    hasVisualizations: boolean;
    hasSamples: boolean;
  },
): boolean {
  const targetIndex = navigableSteps.indexOf(target);
  const currentIndex = stepToNavIndex(current);

  if (targetIndex === -1 || targetIndex >= currentIndex) return false;

  switch (target) {
    case 'photo':
      return true;
    case 'colors':
      return context.hasPhoto;
    case 'result':
      return context.hasPhoto && context.hasVisualizations;
    case 'samples':
      return context.hasPhoto && context.hasSamples;
    case 'details':
      return context.hasPhoto && context.hasSamples;
    default:
      return false;
  }
}

function stepToNavIndex(step: VisualizerStep): number {
  if (step === 'generating') return navigableSteps.indexOf('result');
  if (step === 'success') return navigableSteps.length;
  return navigableSteps.indexOf(step);
}

export function stepToProgressIndex(step: VisualizerStep): number {
  return stepToNavIndex(step);
}
