'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { KITCHEN_FINISHES, finishById, type KitchenFinish } from '@/lib/finishes';

const MAX_MB = 12;

export default function KitchenVisualizer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [finishId, setFinishId] = useState(KITCHEN_FINISHES[0]!.id);
  const [intensity, setIntensity] = useState(55);
  const [showAfter, setShowAfter] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const finish = useMemo(() => finishById(finishId), [finishId]);

  const onFile = useCallback((file: File | null) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Upload een afbeelding (JPG, PNG of WebP).');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Bestand te groot — max ${MAX_MB} MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    setPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setFileName(file.name);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onFile(e.dataTransfer.files[0] ?? null);
    },
    [onFile]
  );

  const reset = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    setFileName(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">Keuken visualisatie</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
          Bekijk je keuken in een nieuwe wrap
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Upload een foto van de keuken, kies een afwerking en zie direct een indicatie. Ideaal voor offertes en
          klantgesprekken — AI-render volgt in een volgende versie.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">1. Foto uploaden</h2>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center transition hover:border-amber-400 hover:bg-amber-50/50"
            >
              <span className="text-3xl">📷</span>
              <p className="mt-2 text-sm font-medium text-slate-700">Sleep een foto of klik om te kiezen</p>
              <p className="mt-1 text-xs text-slate-500">JPG, PNG, WebP · max {MAX_MB} MB</p>
              {fileName && <p className="mt-3 truncate text-xs text-amber-800">{fileName}</p>}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {photoUrl && (
              <button
                type="button"
                onClick={reset}
                className="mt-3 text-sm text-slate-500 underline hover:text-slate-800"
              >
                Andere foto kiezen
              </button>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">2. Wrap-afwerking</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {KITCHEN_FINISHES.map((f) => (
                <FinishSwatch key={f.id} finish={f} selected={f.id === finishId} onSelect={() => setFinishId(f.id)} />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">3. Intensiteit</h2>
            <input
              type="range"
              min={20}
              max={85}
              value={intensity}
              onChange={(e) => setIntensity(+e.target.value)}
              className="mt-4 w-full accent-amber-600"
            />
            <p className="mt-2 text-xs text-slate-500">Hoe sterk de wrap kleur over de fronten ligt ({intensity}%)</p>
          </section>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">Preview</h2>
            <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1 text-sm">
              <ToggleBtn active={!showAfter} onClick={() => setShowAfter(false)}>
                Voor
              </ToggleBtn>
              <ToggleBtn active={showAfter} onClick={() => setShowAfter(true)}>
                Na
              </ToggleBtn>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
            {!photoUrl ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400">
                <span className="text-5xl opacity-40">🍳</span>
                <p className="mt-4 text-sm">Upload een keukenfoto om te starten</p>
              </div>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="Keuken" className="h-full w-full object-cover" />
                {showAfter && (
                  <>
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 top-[28%]"
                      style={{
                        background: finish.texture ?? finish.color,
                        opacity: intensity / 100,
                        mixBlendMode: finish.id.includes('eiken') || finish.id.includes('walnoot') ? 'multiply' : 'color',
                      }}
                    />
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 top-[28%]"
                      style={{
                        background: `linear-gradient(to bottom, transparent, ${finish.color}88)`,
                        opacity: (intensity / 100) * 0.6,
                      }}
                    />
                  </>
                )}
              </>
            )}
          </div>

          {photoUrl && showAfter && (
            <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <strong>{finish.name}</strong> — indicatieve preview. Definitieve visualisatie volgt via AI-render op
              frontvlakken.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function FinishSwatch({
  finish,
  selected,
  onSelect,
}: {
  finish: KitchenFinish;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition ${
        selected ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <span
        className="h-8 w-8 shrink-0 rounded-md border border-black/10 shadow-inner"
        style={{ background: finish.texture ?? finish.color }}
      />
      <span className="font-medium text-slate-800">{finish.name}</span>
    </button>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 font-medium transition ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  );
}
