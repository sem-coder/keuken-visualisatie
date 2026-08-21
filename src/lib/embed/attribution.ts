import type { Attribution } from '@/types/visualizer';

export function parseAttributionFromSearch(search: string): Attribution {
  const params = new URLSearchParams(search);
  const attribution: Attribution = {};

  const keys: (keyof Attribution)[] = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'gclid',
    'fbclid',
  ];

  for (const key of keys) {
    const value = params.get(key);
    if (value) {
      attribution[key] = value;
    }
  }

  return attribution;
}

export function mergeAttribution(
  current: Attribution,
  incoming: Attribution,
): Attribution {
  return { ...current, ...incoming };
}
