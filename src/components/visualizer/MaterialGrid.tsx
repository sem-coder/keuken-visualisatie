'use client';

import { useMemo, useState } from 'react';
import { MaterialCard } from '@/components/visualizer/MaterialCard';
import { MaterialFilters } from '@/components/visualizer/MaterialFilters';
import { getActiveMaterials } from '@/lib/materials';
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

  return (
    <div>
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
            onSelect={onSelect}
          />
        ))}
      </div>
      {materials.length === 0 && (
        <p className="text-center text-stone-500 py-8">Geen materialen gevonden.</p>
      )}
    </div>
  );
}
