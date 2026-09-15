'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';

interface PortalResetPasswordProps {
  token: string;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function PortalResetPassword({
  token,
  onSuccess,
  onSwitchToLogin,
}: PortalResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/portal/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Wachtwoord kon niet worden bijgewerkt');
      }

      onSuccess();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">Nieuw wachtwoord instellen</h1>
      <p className="mt-2 text-sm text-slate-600">Kies een nieuw wachtwoord voor je account.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Nieuw wachtwoord
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-2"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Bezig...' : 'Wachtwoord opslaan'}
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
