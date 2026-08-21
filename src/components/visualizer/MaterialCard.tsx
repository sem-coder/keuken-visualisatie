'use client';

import type { Material } from '@/lib/materials';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MaterialCardProps {
  material: Material;
  selected: boolean;
  viewed: boolean;
  isSampleSelected: boolean;
  samplesFull: boolean;
  onSelect: (id: string) => void;
  onToggleSample: (id: string) => void;
}

export function MaterialCard({
  material,
  selected,
  viewed,
  isSampleSelected,
  samplesFull,
  onSelect,
  onToggleSample,
}: MaterialCardProps) {
  const sampleDisabled = samplesFull && !isSampleSelected;

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-white text-left transition-all shadow-sm',
        selected ? 'border-amber-500 ring-2 ring-amber-200' : 'border-slate-200 hover:border-amber-300',
        isSampleSelected && 'ring-2 ring-amber-400 border-amber-500',
      )}
    >
      <button
        type="button"
        aria-label={
          isSampleSelected
            ? `${material.name} deselecteren als sample`
            : `${material.name} selecteren als sample`
        }
        disabled={sampleDisabled}
        onClick={(event) => {
          event.stopPropagation();
          if (!sampleDisabled) onToggleSample(material.id);
        }}
        className={cn(
          'absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg border-2 transition-all shadow-sm',
          isSampleSelected
            ? 'border-amber-600 bg-amber-600 text-white'
            : sampleDisabled
              ? 'border-slate-200 bg-white/80 text-slate-300 cursor-not-allowed'
              : 'border-white bg-white/95 text-slate-400 hover:border-amber-400 hover:text-amber-700',
        )}
      >
        {isSampleSelected && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>

      {isSampleSelected && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-semibold text-white">
          Sample
        </span>
      )}

      <button type="button" onClick={() => onSelect(material.id)} className="flex flex-col text-left">
        <div className="aspect-square w-full" style={{ backgroundColor: material.preview }}>
          {material.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={material.image} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="p-3 pt-2">
          <p className="font-medium text-slate-900 text-sm">{material.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{material.code}</p>
          <p className="text-xs text-slate-400 mt-0.5">{material.category}</p>
        </div>
      </button>

      {sampleDisabled && (
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
