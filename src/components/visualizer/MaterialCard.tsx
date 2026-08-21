'use client';

import type { Material } from '@/lib/materials';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MaterialCardProps {
  material: Material;
  selected: boolean;
  viewed: boolean;
  isSampleSelected: boolean;
  hasVisualization: boolean;
  samplesFull: boolean;
  onSelect: (id: string) => void;
  onToggleSample?: (id: string) => void;
}

export function MaterialCard({
  material,
  selected,
  viewed,
  isSampleSelected,
  hasVisualization,
  samplesFull,
  onSelect,
  onToggleSample,
}: MaterialCardProps) {
  const canToggleSample =
    hasVisualization && onToggleSample && (isSampleSelected || !samplesFull);

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-white text-left transition-all shadow-sm',
        selected ? 'border-amber-500 ring-2 ring-amber-200' : 'border-slate-200 hover:border-amber-300',
        isSampleSelected && 'ring-2 ring-amber-400',
      )}
    >
      <button type="button" onClick={() => onSelect(material.id)} className="flex flex-col text-left">
        <div className="aspect-square w-full" style={{ backgroundColor: material.preview }}>
          {material.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={material.image} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="p-3">
          <p className="font-medium text-slate-900 text-sm">{material.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{material.code}</p>
          <p className="text-xs text-slate-400 mt-0.5">{material.category}</p>
        </div>
      </button>

      {canToggleSample && (
        <button
          type="button"
          onClick={() => onToggleSample(material.id)}
          className={cn(
            'mx-3 mb-3 flex items-center justify-center gap-2 rounded-lg border py-2 text-xs font-medium transition-colors',
            isSampleSelected
              ? 'border-amber-500 bg-amber-50 text-amber-900'
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-amber-400 hover:bg-amber-50',
          )}
        >
          <Check className="h-3.5 w-3.5" />
          {isSampleSelected ? 'Sample geselecteerd' : 'Sample kiezen'}
        </button>
      )}

      {hasVisualization && samplesFull && !isSampleSelected && (
        <p className="mx-3 mb-3 text-center text-[11px] text-slate-500">Max. 2 samples</p>
      )}

      {viewed && !selected && !isSampleSelected && (
        <span className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
          Bekeken
        </span>
      )}
    </div>
  );
}
