'use client';

import { useMemo, useState } from 'react';
import { MaterialCard } from '@/components/visualizer/MaterialCard';
import { MaterialFilters } from '@/components/visualizer/MaterialFilters';
import { getActiveMaterials } from '@/lib/materials';
import { config } from '@/lib/config';
import { sendEmbedEvent } from '@/lib/embed/events';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';
import type { MaterialFilter } from '@/types/visualizer';

interface MaterialGridProps {
  activeMaterialId: string | null;
  viewedMaterialIds: string[];
  onSelect: (id: string) => void;
}

export function MaterialGrid({
  activeMaterialId,
  viewedMaterialIds,
  onSelect,
}: MaterialGridProps) {
  const [filter, setFilter] = useState<MaterialFilter>('all');
  const [search, setSearch] = useState('');
  const {
    selectedSampleIds,
    toggleSample,
  } = useKitchenVisualizer();
  const [sampleError, setSampleError] = useState<string | null>(null);

  const materials = useMemo(() => {
    const query = search.trim().toLowerCase();
    return getActiveMaterials().filter((material) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'light' && (material.category === 'Licht' || material.category === 'Neutraal')) ||
        (filter === 'dark' && material.category === 'Donker') ||
        (filter === 'green' && material.category === 'Groen') ||
        (filter === 'wood' && material.category === 'Houtlook');

      const matchesSearch =
        !query ||
        material.name.toLowerCase().includes(query) ||
        material.code.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const handleToggleSample = (materialId: string) => {
    const error = toggleSample(materialId);
    if (error) {
      setSampleError(error);
      return;
    }
    setSampleError(null);
    const isNowSelected = useKitchenVisualizer.getState().selectedSampleIds.includes(materialId);
    sendEmbedEvent(isNowSelected ? 'sample_selected' : 'sample_removed', { materialId });
  };

  const samplesFull = selectedSampleIds.length >= config.maxSamples;

  return (
    <div>
      {selectedSampleIds.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>
            {selectedSampleIds.length} van {config.maxSamples} samples gekozen
          </strong>
          {selectedSampleIds.length < config.maxSamples
            ? ' — vink nog een kleur aan linksboven op de kaart.'
            : ' — je kunt nu visualiseren of direct je samples aanvragen.'}
        </div>
      )}

      <MaterialFilters
        activeFilter={filter}
        search={search}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {materials.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            selected={activeMaterialId === material.id}
            viewed={viewedMaterialIds.includes(material.id)}
            isSampleSelected={selectedSampleIds.includes(material.id)}
            samplesFull={samplesFull}
            onSelect={onSelect}
            onToggleSample={handleToggleSample}
          />
        ))}
      </div>

      {sampleError && <p className="mt-3 text-sm text-red-600">{sampleError}</p>}

      {materials.length === 0 && (
        <p className="text-center text-slate-500 py-8">Geen materialen gevonden.</p>
      )}
    </div>
  );
}
