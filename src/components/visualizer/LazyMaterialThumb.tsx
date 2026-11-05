'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface LazyMaterialThumbProps {
  src: string;
  alt: string;
  className?: string;
}

export function LazyMaterialThumb({ src, alt, className }: LazyMaterialThumbProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px', threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={cn('h-full w-full bg-stone-100', className)}>
      {shouldLoad ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
}
