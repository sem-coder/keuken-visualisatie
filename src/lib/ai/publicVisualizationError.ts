export function getPublicVisualizationError(error: unknown): {
  message: string;
  status: number;
} {
  const raw = error instanceof Error ? error.message : '';

  if (/no credits remaining|insufficient_quota|exceeded your current quota/i.test(raw)) {
    return {
      message:
        'Het AI-tegoed is op. Visualisaties werken weer zodra er credits op het OpenAI-account staan.',
      status: 503,
    };
  }

  if (/\b429\b/.test(raw)) {
    return {
      message: 'Te veel verzoeken tegelijk. Wacht even en probeer het opnieuw.',
      status: 429,
    };
  }

  return {
    message: raw || 'De visualisatie kon niet worden gemaakt',
    status: 500,
  };
}
