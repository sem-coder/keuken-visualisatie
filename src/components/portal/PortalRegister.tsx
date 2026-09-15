'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';

interface PortalRegisterProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function PortalRegister({ onSuccess, onSwitchToLogin }: PortalRegisterProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    websiteUrl: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/portal/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Registratie mislukt');
      }

      onSuccess();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Registratie mislukt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">Account aanmaken</h1>
      <p className="mt-2 text-sm text-slate-600">
        Maak een gratis account aan om je visualisatie-tool te embedden en leads te ontvangen.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Bedrijfsnaam
          </label>
          <Input
            id="name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="mt-2"
            placeholder="Woeler Keukens"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            E-mailadres
          </label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="mt-2"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="websiteUrl" className="text-sm font-medium text-slate-700">
            Website (optioneel)
          </label>
          <Input
            id="websiteUrl"
            value={form.websiteUrl}
            onChange={(event) => setForm({ ...form, websiteUrl: event.target.value })}
            className="mt-2"
            placeholder="https://www.jouwwebsite.nl"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Wachtwoord
          </label>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className="mt-2"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <p className="mt-1 text-xs text-slate-400">Minimaal 8 tekens</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
            Bevestig wachtwoord
          </label>
          <PasswordInput
            id="confirmPassword"
            value={form.confirmPassword}
            onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
            className="mt-2"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Bezig...' : 'Account aanmaken'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Heb je al een account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-amber-700 hover:underline"
        >
          Inloggen
        </button>
      </p>
    </div>
  );
}
