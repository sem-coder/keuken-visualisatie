'use client';

import { Button } from '@/components/ui/button';
import { ColorStep } from '@/components/visualizer/ColorStep';
import { DetailsStep } from '@/components/visualizer/DetailsStep';
import { GeneratingState } from '@/components/visualizer/GeneratingState';
import { PhotoStep } from '@/components/visualizer/PhotoStep';
import { Progress } from '@/components/visualizer/Progress';
import { ResultStep } from '@/components/visualizer/ResultStep';
import { SampleSelection } from '@/components/visualizer/SampleSelection';
import { SampleStickyBar } from '@/components/visualizer/SampleStickyBar';
import { SuccessStep } from '@/components/visualizer/SuccessStep';
import { useIframeAutoHeight } from '@/hooks/useIframeAutoHeight';
import { mergeAttribution, parseAttributionFromSearch } from '@/lib/embed/attribution';
import { isParentMessage, sendEmbedEvent } from '@/lib/embed/events';
import { getMaterialById } from '@/lib/materials';
import { config } from '@/lib/config';
import { createMockVisualization } from '@/lib/client/createMockVisualization';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';
import { useCallback, useEffect, useState } from 'react';

export function KitchenVisualizer() {
  const {
    step,
    originalImage,
    originalPreviewUrl,
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

  const generateMaterialVisualization = useCallback(
    async (materialId: string, options?: { navigateToResult?: boolean }) => {
      const material = getMaterialById(materialId);
      if (!material || !originalImage) return false;

      const cached = useKitchenVisualizer.getState().visualizations[materialId];
      if (cached) {
        if (options?.navigateToResult !== false) {
          setActiveMaterialId(materialId);
          setStep('result');
        }
        return true;
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
          mockMode?: boolean;
          error?: string;
        };

        if (!response.ok || !data.imageUrl) {
          throw new Error(data.error ?? 'Visualisatie mislukt');
        }

        if (data.kitchenImageKey) {
          setKitchenImageStorageKey(data.kitchenImageKey);
        }

        let imageUrl = data.imageUrl;
        if (data.mockMode && originalPreviewUrl) {
          imageUrl = await createMockVisualization(originalPreviewUrl, material);
        }

        addVisualization({ materialId, imageUrl });
        sendEmbedEvent('visualization_completed', { materialId });

        if (options?.navigateToResult !== false) {
          setStep('result');
        }

        return true;
      } catch (error) {
        setGenerationFailed(true);
        setGenerationError(
          error instanceof Error ? error.message : 'Visualisatie mislukt',
        );
        sendEmbedEvent('visualization_failed', { materialId });
        setStep('colors');
        return false;
      }
    },
    [
      originalImage,
      originalPreviewUrl,
      setActiveMaterialId,
      setStep,
      setGenerationError,
      addVisualization,
      setKitchenImageStorageKey,
    ],
  );

  const handleGenerate = useCallback(
    (materialId: string) => generateMaterialVisualization(materialId),
    [generateMaterialVisualization],
  );

  const handleGenerateSelected = useCallback(async () => {
    const { selectedSampleIds, visualizations } = useKitchenVisualizer.getState();
    const missing = selectedSampleIds.filter((id) => !visualizations[id]);

    if (missing.length === 0) {
      setStep('samples');
      return;
    }

    for (const materialId of missing) {
      const success = await generateMaterialVisualization(materialId, {
        navigateToResult: false,
      });
      if (!success) return;
    }

    setStep('samples');
  }, [generateMaterialVisualization, setStep]);

  const retryGeneration = () => {
    const { activeMaterialId } = useKitchenVisualizer.getState();
    if (activeMaterialId) handleGenerate(activeMaterialId);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
          Keuken visualisatie
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
          Bekijk jouw favoriete kleur op je eigen keuken
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Upload een foto van je keuken, probeer verschillende kleuren uit en bestel jouw
          favoriete samples.
        </p>
        <ul className="mt-5 flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Gebruik je eigen keukenfoto
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Vergelijk voor en na
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
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
      {step === 'colors' && (
        <ColorStep onGenerate={handleGenerate} onGenerateSelected={handleGenerateSelected} />
      )}
      {step === 'generating' && originalPreviewUrl && (
        <GeneratingState originalImageUrl={originalPreviewUrl} />
      )}
      {step === 'result' && <ResultStep />}
      {step === 'samples' && <SampleSelection />}
      {step === 'details' && <DetailsStep />}
      {step === 'success' && <SuccessStep />}

      {selectedSampleIds.length > 0 &&
        step !== 'details' &&
        step !== 'success' &&
        step !== 'result' &&
        step !== 'samples' && <SampleStickyBar />}
    </div>
  );
}
