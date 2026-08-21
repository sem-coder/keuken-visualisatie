'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { MaterialFilter } from '@/types/visualizer';
import { cn } from '@/lib/utils';

const filters: { value: MaterialFilter; label: string }[] = [
  { value: 'all', label: 'Alles' },
  { value: 'light', label: 'Licht' },
  { value: 'dark', label: 'Donker' },
  { value: 'green', label: 'Groen' },
  { value: 'wood', label: 'Houtlook' },
];

interface MaterialFiltersProps {
  activeFilter: MaterialFilter;
  search: string;
  onFilterChange: (filter: MaterialFilter) => void;
  onSearchChange: (value: string) => void;
}

export function MaterialFilters({
  activeFilter,
  search,
  onFilterChange,
  onSearchChange,
}: MaterialFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Zoek op kleur of code"
          className="pl-11"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              'rounded-full px-4 py-2 text-sm transition-colors min-h-[40px]',
              activeFilter === filter.value
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50',
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
