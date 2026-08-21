'use client';

import { Button } from '@/components/ui/button';
import { ColorStep } from '@/components/visualizer/ColorStep';
import { DetailsStep } from '@/components/visualizer/DetailsStep';
import { GeneratingState } from '@/components/visualizer/GeneratingState';
import { PhotoStep } from '@/components/visualizer/PhotoStep';
import { Progress } from '@/components/visualizer/Progress';
import { ResultStep } from '@/components/visualizer/ResultStep';
import { SampleSelection } from '@/components/visualizer/SampleSelection';
import { SuccessStep } from '@/components/visualizer/SuccessStep';
import { useIframeAutoHeight } from '@/hooks/useIframeAutoHeight';
import { mergeAttribution, parseAttributionFromSearch } from '@/lib/embed/attribution';
import { isParentMessage, sendEmbedEvent } from '@/lib/embed/events';
import { getMaterialById } from '@/lib/materials';
import { config } from '@/lib/config';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';
import { useCallback, useEffect, useState } from 'react';

export function KitchenVisualizer() {
  const {
    step,
    originalImage,
    originalPreviewUrl,
    visualizations,
    selectedSampleIds,
    setStep,
    setActiveMaterialId,
    addVisualization,
    setKitchenImageStorageKey,
    setGenerationError,
    setAttribution,
    generationError,
  } = useKitchenVisualizer();

  const [generationFailed, setGenerationFailed] = useState(false);

  useIframeAutoHeight(
    `${step}-${selectedSampleIds.length}-${Boolean(generationError)}-${Boolean(generationFailed)}-${Boolean(originalPreviewUrl)}`,
  );

  useEffect(() => {
    sendEmbedEvent('visualizer_view');
    setAttribution(parseAttributionFromSearch(window.location.search));

    const handleMessage = (event: MessageEvent) => {
      if (!isParentMessage(event.data)) return;
      if (event.data.type === 'kitchen-visualizer-attribution') {
        const current = useKitchenVisualizer.getState().attribution;
        setAttribution(mergeAttribution(current, event.data.attribution));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setAttribution]);

  const handleGenerate = useCallback(
    async (materialId: string) => {
      const material = getMaterialById(materialId);
      if (!material || !originalImage) return;

      const cached = visualizations[materialId];
      if (cached) {
        setActiveMaterialId(materialId);
        setStep('result');
        return;
      }

      setActiveMaterialId(materialId);
      setGenerationError(null);
      setGenerationFailed(false);
      setStep('generating');
      sendEmbedEvent('visualization_started', { materialId });

      const formData = new FormData();
      formData.append('image', originalImage);
      formData.append('materialId', materialId);

      try {
        const response = await fetch('/api/visualize', {
          method: 'POST',
          body: formData,
        });

        const data = (await response.json()) as {
          imageUrl?: string;
          kitchenImageKey?: string;
          error?: string;
        };

        if (!response.ok || !data.imageUrl) {
          throw new Error(data.error ?? 'Visualisatie mislukt');
        }

        if (data.kitchenImageKey) {
          setKitchenImageStorageKey(data.kitchenImageKey);
        }

        addVisualization({ materialId, imageUrl: data.imageUrl });
        sendEmbedEvent('visualization_completed', { materialId });
        setStep('result');
      } catch (error) {
        setGenerationFailed(true);
        setGenerationError(
          error instanceof Error ? error.message : 'Visualisatie mislukt',
        );
        sendEmbedEvent('visualization_failed', { materialId });
        setStep('colors');
      }
    },
    [
      originalImage,
      visualizations,
      setActiveMaterialId,
      setStep,
      setGenerationError,
      addVisualization,
      setKitchenImageStorageKey,
    ],
  );

  const retryGeneration = () => {
    const { activeMaterialId } = useKitchenVisualizer.getState();
    if (activeMaterialId) handleGenerate(activeMaterialId);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-10 text-center sm:text-left">
        <p className="text-sm font-medium uppercase tracking-wider text-stone-500">
          Visualiseer jouw nieuwe keuken
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight">
          Bekijk jouw favoriete kleur op je eigen keuken
        </h1>
        <p className="mt-4 text-stone-600 max-w-2xl">
          Upload een foto van je keuken, probeer verschillende kleuren uit en bestel jouw
          favoriete samples.
        </p>
        <ul className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-stone-600">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
            Gebruik je eigen keukenfoto
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
            Vergelijk voor en na
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
            Kies maximaal 2{config.showFreeSamples ? ' gratis' : ''} samples
          </li>
        </ul>
      </header>

      <Progress />

      {generationFailed && (
        <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6">
          <h3 className="font-medium text-red-900">De visualisatie kon niet worden gemaakt</h3>
          <p className="mt-2 text-sm text-red-700">
            Je foto en gekozen kleur zijn bewaard. Probeer het nog een keer.
          </p>
          <Button type="button" className="mt-4" onClick={retryGeneration}>
            Opnieuw proberen
          </Button>
        </div>
      )}

      {step === 'photo' && <PhotoStep />}
      {step === 'colors' && <ColorStep onGenerate={handleGenerate} />}
      {step === 'generating' && originalPreviewUrl && (
        <GeneratingState originalImageUrl={originalPreviewUrl} />
      )}
      {step === 'result' && <ResultStep />}
      {step === 'samples' && <SampleSelection />}
      {step === 'details' && <DetailsStep />}
      {step === 'success' && <SuccessStep />}

      {selectedSampleIds.length > 0 && step !== 'details' && step !== 'success' && (
        <>
          <div className="fixed bottom-0 inset-x-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur p-4 sm:hidden">
            <p className="text-sm text-stone-600 mb-2 text-center">
              {selectedSampleIds.length} sample{selectedSampleIds.length > 1 ? 's' : ''} gekozen
            </p>
            <Button
              type="button"
              className="w-full"
              onClick={() => setStep('samples')}
            >
              Samples aanvragen
            </Button>
          </div>
          <div className="hidden sm:block fixed right-6 top-1/2 -translate-y-1/2 z-40 w-56 rounded-2xl border border-stone-200 bg-white p-4 shadow-lg">
            <p className="text-sm text-stone-600">
              {selectedSampleIds.length} van {config.maxSamples} samples gekozen
            </p>
            <Button
              type="button"
              className="w-full mt-3"
              onClick={() => setStep('samples')}
            >
              Samples aanvragen
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
