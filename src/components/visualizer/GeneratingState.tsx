'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const messages = [
  'We bekijken je keuken...',
  'De gekozen kleur wordt toegepast...',
  'Licht en details worden verfijnd...',
  'Je visualisatie wordt afgerond...',
];

interface GeneratingStateProps {
  originalImageUrl: string;
}

export function GeneratingState({ originalImageUrl }: GeneratingStateProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="animate-in fade-in duration-300">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stone-200">
        <Image src={originalImageUrl} alt="Keuken" fill className="object-contain" unoptimized />
        <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-[1px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="text-white text-lg font-medium drop-shadow-sm transition-opacity duration-500">
            {messages[messageIndex]}
          </p>
        </div>
      </div>
    </section>
  );
}
