'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PortalForgotPasswordProps {
  onSwitchToLogin: () => void;
}

export function PortalForgotPassword({ onSwitchToLogin }: PortalForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/portal/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Aanvraag mislukt');
      }

      setMessage(
        data.message ??
          'Als dit e-mailadres bij ons bekend is, ontvang je binnen enkele minuten een reset-link.',
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Aanvraag mislukt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">Wachtwoord vergeten</h1>
      <p className="mt-2 text-sm text-slate-600">
        Vul je e-mailadres in. Je ontvangt een link om een nieuw wachtwoord in te stellen.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            E-mailadres
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2"
            autoComplete="email"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}

        <Button type="submit" className="w-full" disabled={loading || Boolean(message)}>
          {loading ? 'Bezig...' : 'Reset-link versturen'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-amber-700 hover:underline"
        >
          Terug naar inloggen
        </button>
      </p>
    </div>
  );
}
