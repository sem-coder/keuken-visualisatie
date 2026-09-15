'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Lead, LeadStatus, TenantClientPublic } from '@/lib/tenants/types';

interface PortalData {
  client: TenantClientPublic;
  embedUrl: string;
  summary: {
    total: number;
    thisWeek: number;
    new: number;
    contacted: number;
    closed: number;
  };
  leads: Lead[];
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Nieuw',
  contacted: 'Contact gehad',
  closed: 'Afgerond',
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-amber-100 text-amber-800',
  contacted: 'bg-blue-100 text-blue-800',
  closed: 'bg-green-100 text-green-800',
};

export function PortalDashboard() {
  const [data, setData] = useState<PortalData | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/portal/leads');
      if (response.status === 401) {
        window.location.reload();
        return;
      }
      if (!response.ok) {
        throw new Error('Gegevens konden niet worden geladen');
      }
      const payload = (await response.json()) as PortalData;
      setData(payload);
      setSelectedLead((current) =>
        current ? payload.leads.find((lead) => lead.id === current.id) ?? null : null,
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Fout bij laden');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const updateStatus = async (leadId: string, status: LeadStatus) => {
    const response = await fetch(`/api/portal/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) return;
    const payload = (await response.json()) as { lead: Lead };
    setData((current) =>
      current
        ? {
            ...current,
            leads: current.leads.map((lead) =>
              lead.id === leadId ? payload.lead : lead,
            ),
            summary: {
              ...current.summary,
              ...countSummary(
                current.leads.map((lead) => (lead.id === leadId ? payload.lead : lead)),
              ),
            },
          }
        : current,
    );
    setSelectedLead(payload.lead);
  };

  const handleLogout = async () => {
    await fetch('/api/portal/auth', { method: 'DELETE' });
    window.location.reload();
  };

  if (loading) {
    return <p className="text-slate-600">Dashboard laden...</p>;
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error ?? 'Geen data beschikbaar'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
            Jouw dashboard
          </p>
          <h1 className="text-3xl font-bold text-slate-900">{data.client.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Bekijk wie samples heeft aangevraagd en beheer je leads
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => void loadData()}>
            Vernieuwen
          </Button>
          <Button type="button" variant="ghost" onClick={() => void handleLogout()}>
            Uitloggen
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Totaal leads" value={String(data.summary.total)} />
        <StatCard label="Deze week" value={String(data.summary.thisWeek)} />
        <StatCard label="Nieuw" value={String(data.summary.new)} highlight />
        <StatCard label="Contact gehad" value={String(data.summary.contacted)} />
        <StatCard label="Afgerond" value={String(data.summary.closed)} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Jouw visualisatie-link</h2>
        <p className="mt-1 text-sm text-slate-500">
          Deze link staat embedded op je website. Nieuwe aanvragen verschijnen hier automatisch.
        </p>
        <code className="mt-3 block overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
          {data.embedUrl}
        </code>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Alle leads</h2>
          {data.leads.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Nog geen leads ontvangen. Zodra iemand via jouw website samples aanvraagt, zie je ze
              hier.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Datum</th>
                    <th className="pb-3 pr-4 font-medium">Naam</th>
                    <th className="pb-3 pr-4 font-medium">E-mail</th>
                    <th className="pb-3 pr-4 font-medium">Samples</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`cursor-pointer border-b border-slate-50 transition hover:bg-slate-50 ${
                        selectedLead?.id === lead.id ? 'bg-amber-50' : ''
                      }`}
                    >
                      <td className="py-3 pr-4 text-slate-600">
                        {new Date(lead.submittedAt).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-900">
                        {lead.customer.firstName} {lead.customer.lastName}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{lead.customer.email}</td>
                      <td className="py-3 pr-4 text-slate-600">
                        {lead.samples.map((sample) => sample.code).join(', ')}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[lead.status]}`}
                        >
                          {STATUS_LABELS[lead.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Lead details</h2>
          {!selectedLead ? (
            <p className="mt-4 text-sm text-slate-500">
              Klik op een rij in de tabel om contactgegevens en samples te bekijken
            </p>
          ) : (
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="font-medium text-slate-900">Status</p>
                <select
                  value={selectedLead.status}
                  onChange={(event) =>
                    void updateStatus(selectedLead.id, event.target.value as LeadStatus)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <DetailBlock title="Contact">
                <p>
                  {selectedLead.customer.firstName} {selectedLead.customer.lastName}
                </p>
                <p>
                  <a
                    href={`mailto:${selectedLead.customer.email}`}
                    className="text-amber-700 hover:underline"
                  >
                    {selectedLead.customer.email}
                  </a>
                </p>
                {selectedLead.customer.phone && (
                  <p>
                    <a
                      href={`tel:${selectedLead.customer.phone}`}
                      className="text-amber-700 hover:underline"
                    >
                      {selectedLead.customer.phone}
                    </a>
                  </p>
                )}
              </DetailBlock>

              <DetailBlock title="Adres">
                <p>
                  {selectedLead.customer.address.street}{' '}
                  {selectedLead.customer.address.houseNumber}
                  {selectedLead.customer.address.addition
                    ? ` ${selectedLead.customer.address.addition}`
                    : ''}
                </p>
                <p>
                  {selectedLead.customer.address.postalCode} {selectedLead.customer.address.city}
                </p>
              </DetailBlock>

              <DetailBlock title="Samples">
                {selectedLead.samples.map((sample) => (
                  <div key={sample.id} className="space-y-2">
                    <p>
                      {sample.name} ({sample.code})
                    </p>
                    {sample.visualizationUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sample.visualizationUrl}
                        alt={`Visualisatie ${sample.name}`}
                        className="w-full rounded-lg border border-slate-100"
                      />
                    )}
                  </div>
                ))}
              </DetailBlock>

              {selectedLead.message && (
                <DetailBlock title="Bericht">
                  <p>{selectedLead.message}</p>
                </DetailBlock>
              )}

              {selectedLead.attribution && Object.keys(selectedLead.attribution).length > 0 && (
                <DetailBlock title="Campagne">
                  {Object.entries(selectedLead.attribution).map(([key, value]) => (
                    <p key={key}>
                      {key}: {value}
                    </p>
                  ))}
                </DetailBlock>
              )}

              <p className="text-xs text-slate-400">
                Ontvangen {new Date(selectedLead.submittedAt).toLocaleString('nl-NL')}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function countSummary(leads: Lead[]) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return {
    total: leads.length,
    thisWeek: leads.filter((lead) => new Date(lead.submittedAt).getTime() >= weekAgo).length,
    new: leads.filter((lead) => lead.status === 'new').length,
    contacted: leads.filter((lead) => lead.status === 'contacted').length,
    closed: leads.filter((lead) => lead.status === 'closed').length,
  };
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
      }`}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-medium text-slate-900">{title}</p>
      <div className="mt-1 space-y-1 text-slate-600">{children}</div>
    </div>
  );
}
