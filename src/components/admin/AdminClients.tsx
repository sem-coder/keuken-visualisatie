'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import type { TenantClientPublic } from '@/lib/tenants/types';

interface AdminClient extends TenantClientPublic {
  embedUrl: string;
  embedSnippet: string;
}

interface ClientFormState {
  name: string;
  email: string;
  slug: string;
  websiteUrl: string;
  password: string;
  active: boolean;
}

function emptyForm(): ClientFormState {
  return {
    name: '',
    email: '',
    slug: '',
    websiteUrl: '',
    password: '',
    active: true,
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
  };
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

  const copySnippet = async (clientId: string, snippet: string) => {
    await navigator.clipboard.writeText(snippet);
    setCopiedId(clientId);
    window.setTimeout(() => setCopiedId(null), 2000);
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
        }),
      });

      const data = (await response.json()) as { client?: AdminClient; error?: string };
      if (!response.ok || !data.client) {
        throw new Error(data.error ?? 'Klant kon niet worden aangemaakt');
      }

      setClients((current) => [...current, data.client!].sort((a, b) => a.name.localeCompare(b.name)));
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
        }),
      });

      const data = (await response.json()) as { client?: AdminClient; error?: string };
      if (!response.ok || !data.client) {
        throw new Error(data.error ?? 'Klant kon niet worden bijgewerkt');
      }

      setClients((current) =>
        current
          .map((client) => (client.id === clientId ? data.client! : client))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      cancelEditing();
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
    return <p className="text-slate-600">Klanten laden...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Klanten</h2>
          <p className="mt-2 text-sm text-slate-600">
            Beheer klantaccounts, embed-codes en toegang. Klanten kunnen ook zelf registreren via{' '}
            <a href="/portal" className="text-amber-700 hover:underline" target="_blank" rel="noreferrer">
              /portal
            </a>
            .
          </p>
        </div>
        <Button
          type="button"
          variant={showCreateForm ? 'secondary' : 'primary'}
          onClick={() => {
            setShowCreateForm((current) => !current);
            setFormError(null);
            setCreateForm(emptyForm());
          }}
        >
          {showCreateForm ? 'Annuleren' : 'Nieuwe klant'}
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {showCreateForm && (
        <form
          onSubmit={(event) => void handleCreate(event)}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
        >
          <h3 className="text-lg font-bold text-slate-900">Nieuwe klant aanmaken</h3>
          {formError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}
          {renderFormFields(createForm, setCreateForm, { isCreate: true })}
          <div className="flex justify-end">
            <Button type="submit" disabled={creating}>
              {creating ? 'Aanmaken...' : 'Klant aanmaken'}
            </Button>
          </div>
        </form>
      )}

      <section className="space-y-4">
        {clients.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nog geen klanten. Maak er een aan of deel /portal voor zelfregistratie.
          </p>
        ) : (
          clients.map((client) => {
            const isEditing = editingId === client.id;

            return (
              <div
                key={client.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                {isEditing ? (
                  <form
                    onSubmit={(event) => void handleUpdate(event, client.id)}
                    className="space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-slate-900">Klant bewerken</h3>
                      <Button type="button" variant="secondary" onClick={cancelEditing}>
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
                    <div className="flex justify-end">
                      <Button type="submit" disabled={savingId === client.id}>
                        {savingId === client.id ? 'Opslaan...' : 'Wijzigingen opslaan'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{client.name}</h3>
                        <p className="text-sm text-slate-500">{client.email}</p>
                        <p className="text-sm text-slate-500">Code: {client.slug}</p>
                        {client.websiteUrl && (
                          <p className="text-sm text-slate-500">{client.websiteUrl}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            client.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {client.active ? 'Actief' : 'Inactief'}
                        </span>
                        <Button type="button" variant="secondary" onClick={() => startEditing(client)}>
                          Bewerken
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Embed URL
                        </p>
                        <code className="mt-1 block overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                          {client.embedUrl}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Embed code
                        </p>
                        <pre className="mt-1 overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                          {client.embedSnippet}
                        </pre>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void copySnippet(client.id, client.embedSnippet)}
                      >
                        {copiedId === client.id ? 'Gekopieerd!' : 'Kopieer embed code'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
