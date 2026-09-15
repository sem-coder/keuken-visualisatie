'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const statusMessages = [
  'We bekijken je keuken...',
  'De gekozen kleur wordt toegepast...',
  'Kastfronten worden afgewerkt...',
  'Licht en schaduwen worden verfijnd...',
  'Je visualisatie wordt afgerond...',
];

const funFacts = [
  'Keukenwraps zijn binnen één dag te plaatsen — zonder sloopwerk.',
  'Met wrap kun je elke keukenkleur proberen voordat je samples bestelt.',
  'Folie is krasbestendiger dan veel mensen denken — ideaal voor drukke keukens.',
  'Een nieuwe keukenkleur kan een hele ruimte laten aanvoelen als nieuw.',
  'Wrap folie is makkelijk te onderhouden: gewoon afnemen met een vochtige doek.',
  'Je kunt keukenfronten, lades én zijpanelen in dezelfde kleur laten uitvoeren.',
  'Samples geven je het beste beeld van kleur en structuur in jouw eigen licht.',
  'Donkere kleuren maken een keuken vaak strakker; lichte kleuren laten ruimtes groter lijken.',
  'Groene keukens zijn de afgelopen jaren sterk in opkomst — van salie tot bosgroen.',
  'Houtlook-wraps geven de warmte van hout, zonder het onderhoud van echt hout.',
];

interface GeneratingStateProps {
  originalImageUrl: string;
}

export function GeneratingState({ originalImageUrl }: GeneratingStateProps) {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const targetDurationMs = 48_000;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / targetDurationMs, 1);
      const eased = 1 - (1 - t) ** 3;
      setProgress(Math.min(Math.round(eased * 94), 94));
    }, 120);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => Math.min(prev + 1, statusMessages.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="animate-in fade-in duration-300 space-y-5">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
        <Image src={originalImageUrl} alt="Keuken" fill className="object-contain" unoptimized />
        <div className="absolute inset-0 bg-stone-900/10" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-900">{statusMessages[statusIndex]}</p>
          <span className="text-sm tabular-nums text-brand-blue-700">{progress}%</span>
        </div>

        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-blue-600 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 rounded-xl bg-brand-blue-50 px-4 py-3 border border-brand-blue-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue-800">
            Wist je dat?
          </p>
          <p
            key={factIndex}
            className="mt-1.5 text-sm text-brand-blue-950/80 animate-in fade-in duration-500"
          >
            {funFacts[factIndex]}
          </p>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          AI-visualisatie duurt meestal 15–45 seconden. Even geduld — het is de moeite waard.
        </p>
      </div>
    </section>
  );
}
