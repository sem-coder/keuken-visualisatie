'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import type { TenantClientPublic } from '@/lib/tenants/types';
import { cn } from '@/lib/utils';

interface AdminClient extends TenantClientPublic {
  embedUrl: string;
  embedSnippet: string;
  visualizationQuota?: {
    used: number;
    limit: number | null;
    periodKey: string;
  } | null;
  sampleStats?: {
    requestCount: number;
    sampleCount: number;
  };
}

interface ClientFormState {
  name: string;
  email: string;
  slug: string;
  websiteUrl: string;
  password: string;
  active: boolean;
  monthlyVisualizationLimit: string;
}

function emptyForm(): ClientFormState {
  return {
    name: '',
    email: '',
    slug: '',
    websiteUrl: '',
    password: '',
    active: true,
    monthlyVisualizationLimit: '150',
  };
}

function formFromClient(client: AdminClient): ClientFormState {
  return {
    name: client.name,
    email: client.email,
    slug: client.slug,
    websiteUrl: client.websiteUrl ?? '',
    password: '',
    active: client.active,
    monthlyVisualizationLimit: String(client.monthlyVisualizationLimit ?? 150),
  };
}

function parseVisualizationLimitInput(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 150;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('Visualisatielimiet moet 0 (onbeperkt) of een positief getal zijn');
  }
  return parsed;
}

function clientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatMonthKey(periodKey: string): string {
  const [year, month] = periodKey.split('-');
  const y = Number(year);
  const m = Number(month);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return periodKey;
  return new Intl.DateTimeFormat('nl-NL', { month: 'long', year: 'numeric' }).format(
    new Date(y, m - 1, 1),
  );
}

function SummaryStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

function UsageMeter({
  used,
  limit,
  periodKey,
}: {
  used: number;
  limit: number;
  periodKey?: string;
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const tone =
    pct >= 95 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-brand-blue-500';

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-2xl font-bold tabular-nums text-slate-900">
          {used}
          <span className="text-base font-semibold text-slate-400"> / {limit}</span>
        </p>
        <span className="text-xs font-medium text-slate-500">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={cn('h-full rounded-full transition-all', tone)} style={{ width: `${pct}%` }} />
      </div>
      {periodKey ? (
        <p className="text-xs text-slate-400">Kalendermaand {formatMonthKey(periodKey)} (NL)</p>
      ) : null}
    </div>
  );
}

function ClientMetricCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-100 bg-slate-50/80 p-4',
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function AdminClients() {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<ClientFormState>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ClientFormState>(emptyForm);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/clients');
      if (response.status === 401) {
        window.location.reload();
        return;
      }
      if (!response.ok) {
        throw new Error('Klanten konden niet worden geladen');
      }
      const data = (await response.json()) as { clients: AdminClient[] };
      setClients(data.clients);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Fout bij laden');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const summary = useMemo(() => {
    const activeCount = clients.filter((client) => client.active).length;
    const totalSampleRequests = clients.reduce(
      (sum, client) => sum + (client.sampleStats?.requestCount ?? 0),
      0,
    );
    const totalSamples = clients.reduce(
      (sum, client) => sum + (client.sampleStats?.sampleCount ?? 0),
      0,
    );
    return { activeCount, totalSampleRequests, totalSamples };
  }, [clients]);

  const filteredClients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        client.slug.toLowerCase().includes(q),
    );
  }, [clients, searchQuery]);

  const copyText = async (clientId: string, text: string, kind: 'snippet' | 'url') => {
    await navigator.clipboard.writeText(text);
    if (kind === 'snippet') {
      setCopiedId(clientId);
      window.setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedUrlId(clientId);
      window.setTimeout(() => setCopiedUrlId(null), 2000);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setFormError(null);

    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          email: createForm.email,
          slug: createForm.slug || undefined,
          websiteUrl: createForm.websiteUrl || undefined,
          password: createForm.password,
          monthlyVisualizationLimit: parseVisualizationLimitInput(
            createForm.monthlyVisualizationLimit,
          ),
        }),
      });

      const data = (await response.json()) as { client?: AdminClient; error?: string };
      if (!response.ok || !data.client) {
        throw new Error(data.error ?? 'Klant kon niet worden aangemaakt');
      }

      const created: AdminClient = {
        ...data.client,
        sampleStats: { requestCount: 0, sampleCount: 0 },
      };
      setClients((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setCreateForm(emptyForm());
      setShowCreateForm(false);
    } catch (createError) {
      setFormError(createError instanceof Error ? createError.message : 'Fout bij aanmaken');
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (client: AdminClient) => {
    setEditingId(client.id);
    setEditForm(formFromClient(client));
    setFormError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(emptyForm());
    setFormError(null);
  };

  const handleUpdate = async (event: React.FormEvent, clientId: string) => {
    event.preventDefault();
    setSavingId(clientId);
    setFormError(null);

    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          slug: editForm.slug,
          websiteUrl: editForm.websiteUrl,
          active: editForm.active,
          password: editForm.password || undefined,
          monthlyVisualizationLimit: parseVisualizationLimitInput(
            editForm.monthlyVisualizationLimit,
          ),
        }),
      });

      const data = (await response.json()) as { client?: AdminClient; error?: string };
      if (!response.ok || !data.client) {
        throw new Error(data.error ?? 'Klant kon niet worden bijgewerkt');
      }

      setClients((current) =>
        current
          .map((client) =>
            client.id === clientId
              ? {
                  ...client,
                  ...data.client!,
                  visualizationQuota: client.visualizationQuota,
                  sampleStats: client.sampleStats,
                }
              : client,
          )
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      cancelEditing();
      void loadClients();
    } catch (updateError) {
      setFormError(updateError instanceof Error ? updateError.message : 'Fout bij opslaan');
    } finally {
      setSavingId(null);
    }
  };

  const renderFormFields = (
    form: ClientFormState,
    setForm: React.Dispatch<React.SetStateAction<ClientFormState>>,
    options: { isCreate: boolean; originalSlug?: string },
  ) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`${options.isCreate ? 'create' : 'edit'}-name`}>Bedrijfsnaam</Label>
        <Input
          id={`${options.isCreate ? 'create' : 'edit'}-name`}
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${options.isCreate ? 'create' : 'edit'}-email`}>E-mail</Label>
        <Input
          id={`${options.isCreate ? 'create' : 'edit'}-email`}
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${options.isCreate ? 'create' : 'edit'}-slug`}>Embed-code (slug)</Label>
        <Input
          id={`${options.isCreate ? 'create' : 'edit'}-slug`}
          value={form.slug}
          onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
          placeholder={options.isCreate ? 'Wordt afgeleid van bedrijfsnaam' : undefined}
        />
        {!options.isCreate && options.originalSlug && form.slug !== options.originalSlug && (
          <p className="text-xs text-amber-700">
            Let op: de embed-URL wijzigt als je de code aanpast.
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${options.isCreate ? 'create' : 'edit'}-website`}>Website</Label>
        <Input
          id={`${options.isCreate ? 'create' : 'edit'}-website`}
          type="url"
          value={form.websiteUrl}
          onChange={(event) => setForm((current) => ({ ...current, websiteUrl: event.target.value }))}
          placeholder="https://"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${options.isCreate ? 'create' : 'edit'}-viz-limit`}>
          AI-visualisaties per maand
        </Label>
        <Input
          id={`${options.isCreate ? 'create' : 'edit'}-viz-limit`}
          type="number"
          min={0}
          step={1}
          value={form.monthlyVisualizationLimit}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              monthlyVisualizationLimit: event.target.value,
            }))
          }
          placeholder="150"
        />
        <p className="text-xs text-slate-500">
          Standaard 150. Zet op 0 voor onbeperkt (kalendermaand, NL-tijd).
        </p>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${options.isCreate ? 'create' : 'edit'}-password`}>
          {options.isCreate ? 'Wachtwoord' : 'Nieuw wachtwoord (optioneel)'}
        </Label>
        <PasswordInput
          id={`${options.isCreate ? 'create' : 'edit'}-password`}
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          placeholder={options.isCreate ? 'Minimaal 8 tekens' : 'Laat leeg om ongewijzigd te laten'}
          required={options.isCreate}
          minLength={options.isCreate ? 8 : undefined}
        />
      </div>
      {!options.isCreate && (
        <label className="flex items-center gap-3 sm:col-span-2">
          <Checkbox
            checked={form.active}
            onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
          />
          <span className="text-sm text-slate-700">Account actief</span>
        </label>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-24 rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
            Keuken visualisatie admin
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Klantenbeheer</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Accounts, limieten en embed-codes. Klanten loggen in via{' '}
            <a
              href="/portal"
              className="font-medium text-amber-800 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              het portaal
            </a>{' '}
            voor leads en sample-aanvragen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => void loadClients()}>
            Vernieuwen
          </Button>
          <Button
            type="button"
            variant={showCreateForm ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => {
              setShowCreateForm((current) => !current);
              setFormError(null);
              setCreateForm(emptyForm());
            }}
          >
            {showCreateForm ? 'Annuleren' : 'Nieuwe klant'}
          </Button>
        </div>
      </div>

      {clients.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryStat label="Klanten" value={String(clients.length)} hint={`${summary.activeCount} actief`} />
          <SummaryStat
            label="Sample-aanvragen"
            value={String(summary.totalSampleRequests)}
            hint={
              summary.totalSamples > 0
                ? `${summary.totalSamples} gekozen samples totaal`
                : 'Via embed met klantcode'
            }
          />
          <SummaryStat
            label="Portaal"
            value="/portal"
            hint="Leads per klant in hun eigen omgeving"
          />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {showCreateForm && (
        <form
          onSubmit={(event) => void handleCreate(event)}
          className="space-y-4 rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/80 to-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-bold text-slate-900">Nieuwe klant</h2>
            <p className="text-sm text-slate-600">Maak een account aan met embed-code en portaaltoegang.</p>
          </div>
          {formError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}
          {renderFormFields(createForm, setCreateForm, { isCreate: true })}
          <div className="flex justify-end border-t border-amber-100 pt-4">
            <Button type="submit" disabled={creating}>
              {creating ? 'Aanmaken...' : 'Klant aanmaken'}
            </Button>
          </div>
        </form>
      )}

      {clients.length > 1 && (
        <div className="max-w-md">
          <Label htmlFor="client-search" className="sr-only">
            Zoek klant
          </Label>
          <Input
            id="client-search"
            type="search"
            placeholder="Zoek op naam, e-mail of embed-code…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="bg-white"
          />
        </div>
      )}

      <section className="space-y-5">
        {clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">Nog geen klanten</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Maak een klant aan of laat ze zich registreren via het portaal. Elke klant krijgt een
              eigen embed-URL en leadoverzicht.
            </p>
            <Button
              type="button"
              className="mt-6"
              onClick={() => {
                setShowCreateForm(true);
                setFormError(null);
              }}
            >
              Eerste klant aanmaken
            </Button>
          </div>
        ) : filteredClients.length === 0 ? (
          <p className="text-sm text-slate-500">Geen klanten gevonden voor &quot;{searchQuery}&quot;.</p>
        ) : (
          filteredClients.map((client) => {
            const isEditing = editingId === client.id;
            const vizUsed = client.visualizationQuota?.used ?? 0;
            const vizLimit = client.monthlyVisualizationLimit;
            const periodKey = client.visualizationQuota?.periodKey;
            const sampleRequests = client.sampleStats?.requestCount ?? 0;
            const sampleTotal = client.sampleStats?.sampleCount ?? 0;

            return (
              <article
                key={client.id}
                className={cn(
                  'overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md',
                  client.active ? 'border-slate-200' : 'border-slate-200 opacity-90',
                )}
              >
                {isEditing ? (
                  <form
                    onSubmit={(event) => void handleUpdate(event, client.id)}
                    className="space-y-4 p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <h2 className="text-lg font-bold text-slate-900">Klant bewerken</h2>
                      <Button type="button" variant="secondary" size="sm" onClick={cancelEditing}>
                        Annuleren
                      </Button>
                    </div>
                    {formError && (
                      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {formError}
                      </p>
                    )}
                    {renderFormFields(editForm, setEditForm, {
                      isCreate: false,
                      originalSlug: client.slug,
                    })}
                    <div className="flex justify-end border-t border-slate-100 pt-4">
                      <Button type="submit" disabled={savingId === client.id}>
                        {savingId === client.id ? 'Opslaan...' : 'Wijzigingen opslaan'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold',
                            client.active
                              ? 'bg-brand-blue-500 text-white'
                              : 'bg-slate-200 text-slate-600',
                          )}
                          aria-hidden
                        >
                          {clientInitials(client.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold text-slate-900">{client.name}</h2>
                            <code className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                              {client.slug}
                            </code>
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-600">{client.email}</p>
                          {client.websiteUrl ? (
                            <a
                              href={client.websiteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-block truncate text-sm text-amber-800 hover:underline"
                            >
                              {client.websiteUrl.replace(/^https?:\/\//, '')}
                            </a>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 text-xs font-semibold',
                            client.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600',
                          )}
                        >
                          {client.active ? 'Actief' : 'Inactief'}
                        </span>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => startEditing(client)}
                        >
                          Bewerken
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 p-6 sm:grid-cols-2">
                      <ClientMetricCard title="AI-visualisaties">
                        {vizLimit > 0 ? (
                          <UsageMeter used={vizUsed} limit={vizLimit} periodKey={periodKey} />
                        ) : (
                          <div>
                            <p className="text-2xl font-bold tabular-nums text-slate-900">{vizUsed}</p>
                            <p className="mt-1 text-sm text-slate-600">Onbeperkt deze maand</p>
                            {periodKey ? (
                              <p className="mt-1 text-xs text-slate-400">
                                {formatMonthKey(periodKey)}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </ClientMetricCard>
                      <ClientMetricCard title="Sample-aanvragen">
                        <p className="text-2xl font-bold tabular-nums text-slate-900">
                          {sampleRequests}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {sampleRequests === 1 ? 'ingediende aanvraag' : 'ingediende aanvragen'}
                          {sampleTotal > 0 ? (
                            <>
                              {' · '}
                              <span className="font-medium text-slate-800">{sampleTotal} samples</span>
                            </>
                          ) : null}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          Zelfde data als in het klantportaal onder Leads.
                        </p>
                      </ClientMetricCard>
                    </div>

                    <details className="group border-t border-slate-100 bg-slate-50/50">
                      <summary className="cursor-pointer list-none px-6 py-4 text-sm font-semibold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center justify-between gap-2">
                          Embed &amp; Webflow
                          <span className="text-xs font-normal text-slate-500 group-open:hidden">
                            Tonen
                          </span>
                          <span className="hidden text-xs font-normal text-slate-500 group-open:inline">
                            Verbergen
                          </span>
                        </span>
                      </summary>
                      <div className="space-y-4 border-t border-slate-100 px-6 pb-6 pt-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Embed-URL
                          </p>
                          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                            <code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
                              {client.embedUrl}
                            </code>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="shrink-0"
                              onClick={() => void copyText(client.id, client.embedUrl, 'url')}
                            >
                              {copiedUrlId === client.id ? 'URL gekopieerd' : 'Kopieer URL'}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Embed-code (iframe + script)
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">
                            Voeg <strong className="font-medium text-slate-700">embed.css</strong> en{' '}
                            <strong className="font-medium text-slate-700">embed.js</strong> toe in Webflow.
                            Op mobiel: embed-blok 100% breed, grid 1 kolom onder 767px.
                          </p>
                          <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700">
                            {client.embedSnippet}
                          </pre>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="mt-3"
                            onClick={() => void copyText(client.id, client.embedSnippet, 'snippet')}
                          >
                            {copiedId === client.id ? 'Code gekopieerd' : 'Kopieer embed-code'}
                          </Button>
                        </div>
                      </div>
                    </details>
                  </>
                )}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
