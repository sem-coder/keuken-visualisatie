'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { AdminStats } from '@/lib/analytics/types';
import { maskEmail } from '@/lib/admin/auth';
import { formatEur, formatUsd } from '@/lib/analytics/cost';

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/stats');
      if (response.status === 401) {
        window.location.reload();
        return;
      }
      if (!response.ok) {
        throw new Error('Statistieken konden niet worden geladen');
      }
      const data = (await response.json()) as AdminStats;
      setStats(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Fout bij laden');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.reload();
  };

  if (loading) {
    return <p className="text-slate-600">Statistieken laden...</p>;
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error ?? 'Geen data beschikbaar'}
      </div>
    );
  }

  const { summary } = stats;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
            Keuken visualisatie admin
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Gebruik & kosten</h1>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => void loadStats()}>
            Vernieuwen
          </Button>
          <Button type="button" variant="ghost" onClick={() => void handleLogout()}>
            Uitloggen
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visualisaties" value={String(summary.totalVisualizations)} />
        <StatCard label="Sample-aanvragen" value={String(summary.totalSampleRequests)} />
        <StatCard
          label="Tokens verbruikt"
          value={summary.totalTokens.toLocaleString('nl-NL')}
          hint={`${summary.totalInputTokens.toLocaleString('nl-NL')} in · ${summary.totalOutputTokens.toLocaleString('nl-NL')} out`}
        />
        <StatCard
          label="Geschatte totale kosten"
          value={formatUsd(summary.totalEstimatedCostUsd)}
          hint={`≈ ${formatEur(summary.totalEstimatedCostUsd)}`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Gem. kosten per visualisatie"
          value={formatUsd(summary.avgCostPerVisualizationUsd)}
          hint={`${summary.successfulVisualizations} succesvol · ${summary.mockVisualizations} mock`}
        />
        <StatCard
          label="Gem. kosten per aanvraag"
          value={formatUsd(summary.avgCostPerSampleRequestUsd)}
          hint="Som van AI-kosten voor gekozen sample-kleuren"
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Laatste 14 dagen</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-4">Datum</th>
                <th className="py-2 pr-4">Visualisaties</th>
                <th className="py-2 pr-4">Aanvragen</th>
                <th className="py-2 pr-4">Tokens</th>
                <th className="py-2">Kosten</th>
              </tr>
            </thead>
            <tbody>
              {stats.dailyStats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-slate-500">
                    Nog geen data
                  </td>
                </tr>
              ) : (
                stats.dailyStats.map((day) => (
                  <tr key={day.date} className="border-b border-slate-100">
                    <td className="py-3 pr-4">{day.date}</td>
                    <td className="py-3 pr-4">{day.visualizations}</td>
                    <td className="py-3 pr-4">{day.sampleRequests}</td>
                    <td className="py-3 pr-4">{day.tokens.toLocaleString('nl-NL')}</td>
                    <td className="py-3">{formatUsd(day.estimatedCostUsd)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Recente visualisaties</h2>
          <div className="mt-4 space-y-3">
            {stats.recentVisualizations.length === 0 ? (
              <p className="text-sm text-slate-500">Nog geen visualisaties</p>
            ) : (
              stats.recentVisualizations.map((event) => (
                <div key={event.id} className="rounded-xl border border-slate-100 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">
                      {event.materialName} ({event.materialCode})
                    </p>
                    <span className="text-slate-500">{formatUsd(event.estimatedCostUsd)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(event.timestamp).toLocaleString('nl-NL')} ·{' '}
                    {event.totalTokens.toLocaleString('nl-NL')} tokens ·{' '}
                    {event.mockMode ? 'mock' : event.model} ·{' '}
                    {event.success ? 'succes' : 'mislukt'}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Recente sample-aanvragen</h2>
          <div className="mt-4 space-y-3">
            {stats.recentSampleRequests.length === 0 ? (
              <p className="text-sm text-slate-500">Nog geen aanvragen</p>
            ) : (
              stats.recentSampleRequests.map((event) => (
                <div key={event.id} className="rounded-xl border border-slate-100 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">
                      {event.sampleCount} sample{event.sampleCount > 1 ? 's' : ''}
                    </p>
                    <span className="text-slate-500">{formatUsd(event.estimatedCostUsd)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(event.timestamp).toLocaleString('nl-NL')} ·{' '}
                    {maskEmail(event.customerEmail)} · {event.sampleCodes.join(', ')} ·{' '}
                    {event.visualizationCount} visualisatie(s)
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
