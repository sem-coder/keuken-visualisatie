'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';

interface PortalLoginProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

export function PortalLogin({ onSuccess, onSwitchToRegister, onSwitchToForgot }: PortalLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/portal/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? 'Inloggen mislukt');
      }

      onSuccess();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Inloggen mislukt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">Inloggen</h1>
      <p className="mt-2 text-sm text-slate-600">
        Log in met het e-mailadres en wachtwoord waarmee je je account hebt aangemaakt.
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

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Wachtwoord
            </label>
            <button
              type="button"
              onClick={onSwitchToForgot}
              className="text-xs font-medium text-amber-700 hover:underline"
            >
              Wachtwoord vergeten?
            </button>
          </div>
          <PasswordInput
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2"
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Bezig...' : 'Inloggen'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Nog geen account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium text-amber-700 hover:underline"
        >
          Account aanmaken
        </button>
      </p>
    </div>
  );
}
