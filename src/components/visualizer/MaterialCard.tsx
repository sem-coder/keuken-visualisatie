'use client';

import type { Material } from '@/lib/materials';
import { cn } from '@/lib/utils';

interface MaterialCardProps {
  material: Material;
  selected: boolean;
  viewed: boolean;
  onSelect: (id: string) => void;
}

export function MaterialCard({ material, selected, viewed, onSelect }: MaterialCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(material.id)}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-white text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
        selected ? 'border-stone-900 ring-2 ring-stone-900/10' : 'border-stone-200 hover:border-stone-300',
      )}
    >
      <div className="aspect-square w-full" style={{ backgroundColor: material.preview }}>
        {material.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={material.image} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-stone-900 text-sm">{material.name}</p>
        <p className="text-xs text-stone-500 mt-0.5">{material.code}</p>
        <p className="text-xs text-stone-400 mt-0.5">{material.category}</p>
      </div>
      {viewed && !selected && (
        <span className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-stone-600 border border-stone-200">
          Bekeken
        </span>
      )}
    </button>
  );
}
