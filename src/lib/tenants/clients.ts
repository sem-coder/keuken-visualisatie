import { randomUUID } from 'crypto';
import { hashPassword } from '@/lib/tenants/password';
import { readTenantJson, writeTenantJson } from '@/lib/tenants/storage';
import type {
  ClientRegistry,
  CreateClientInput,
  RegisterClientInput,
  TenantClient,
  TenantClientPublic,
  UpdateClientInput,
} from '@/lib/tenants/types';

const REGISTRY_PATH = 'clients.json';

function emptyRegistry(): ClientRegistry {
  return { clients: [], updatedAt: new Date().toISOString() };
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicClient(client: TenantClient): TenantClientPublic {
  return {
    id: client.id,
    slug: client.slug,
    name: client.name,
    email: client.email ?? '',
    websiteUrl: client.websiteUrl,
    active: client.active,
  };
}

function normalizeStoredClient(raw: TenantClient): TenantClient {
  return {
    ...raw,
    email: raw.email ?? '',
  };
}

async function readRegistry(): Promise<ClientRegistry> {
  const registry = await readTenantJson(REGISTRY_PATH, emptyRegistry());
  if (!Array.isArray(registry.clients)) {
    return emptyRegistry();
  }
  return {
    ...registry,
    clients: registry.clients.map(normalizeStoredClient),
  };
}

async function writeRegistry(registry: ClientRegistry): Promise<void> {
  registry.updatedAt = new Date().toISOString();
  await writeTenantJson(REGISTRY_PATH, registry);
}

function ensureUniqueSlug(registry: ClientRegistry, baseSlug: string): string {
  let slug = baseSlug;
  let counter = 2;
  while (registry.clients.some((client) => client.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
  return slug;
}

export async function listClients(): Promise<TenantClientPublic[]> {
  const registry = await readRegistry();
  return registry.clients.map(toPublicClient);
}

export async function getClientBySlug(slug: string): Promise<TenantClient | null> {
  const registry = await readRegistry();
  return registry.clients.find((client) => client.slug === slug && client.active) ?? null;
}

export async function getClientByEmail(email: string): Promise<TenantClient | null> {
  const normalized = normalizeEmail(email);
  const registry = await readRegistry();
  return (
    registry.clients.find(
      (client) => client.email === normalized && client.active && client.email,
    ) ?? null
  );
}

export async function getClientById(id: string): Promise<TenantClient | null> {
  const registry = await readRegistry();
  return registry.clients.find((client) => client.id === id) ?? null;
}

async function insertClient(
  registry: ClientRegistry,
  input: {
    name: string;
    email: string;
    password: string;
    websiteUrl?: string;
    slug?: string;
  },
): Promise<TenantClient> {
  const email = normalizeEmail(input.email);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Ongeldig e-mailadres');
  }
  if (input.password.length < 8) {
    throw new Error('Wachtwoord moet minimaal 8 tekens zijn');
  }
  if (registry.clients.some((client) => client.email === email)) {
    throw new Error('Dit e-mailadres is al in gebruik');
  }

  const baseSlug = slugify(input.slug ?? input.name);
  if (!baseSlug) {
    throw new Error('Ongeldige bedrijfsnaam');
  }
  const slug = ensureUniqueSlug(registry, baseSlug);

  const now = new Date().toISOString();
  const client: TenantClient = {
    id: randomUUID(),
    slug,
    name: input.name.trim(),
    email,
    websiteUrl: input.websiteUrl?.trim() || undefined,
    passwordHash: hashPassword(input.password),
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  registry.clients.push(client);
  await writeRegistry(registry);
  return client;
}

export async function registerClient(input: RegisterClientInput): Promise<TenantClientPublic> {
  const registry = await readRegistry();
  const client = await insertClient(registry, input);
  return toPublicClient(client);
}

export async function createClient(input: CreateClientInput): Promise<TenantClientPublic> {
  const registry = await readRegistry();
  const client = await insertClient(registry, {
    ...input,
    slug: input.slug ? slugify(input.slug) : undefined,
  });
  return toPublicClient(client);
}

export async function updateClient(
  id: string,
  input: UpdateClientInput,
): Promise<TenantClientPublic | null> {
  const registry = await readRegistry();
  const index = registry.clients.findIndex((client) => client.id === id);
  if (index === -1) return null;

  const client = registry.clients[index];
  if (input.name !== undefined) client.name = input.name.trim();
  if (input.email !== undefined) {
    const email = normalizeEmail(input.email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Ongeldig e-mailadres');
    }
    if (registry.clients.some((existing) => existing.id !== id && existing.email === email)) {
      throw new Error('Dit e-mailadres is al in gebruik');
    }
    client.email = email;
  }
  if (input.slug !== undefined) {
    const slug = slugify(input.slug);
    if (!slug) {
      throw new Error('Ongeldige embed-code');
    }
    if (registry.clients.some((existing) => existing.id !== id && existing.slug === slug)) {
      throw new Error('Deze embed-code is al in gebruik');
    }
    client.slug = slug;
  }
  if (input.websiteUrl !== undefined) {
    client.websiteUrl = input.websiteUrl.trim() || undefined;
  }
  if (input.password) {
    if (input.password.length < 8) {
      throw new Error('Wachtwoord moet minimaal 8 tekens zijn');
    }
    client.passwordHash = hashPassword(input.password);
  }
  if (input.active !== undefined) client.active = input.active;
  client.updatedAt = new Date().toISOString();

  registry.clients[index] = client;
  await writeRegistry(registry);
  return toPublicClient(client);
}

export function getPublicClient(client: TenantClient): TenantClientPublic {
  return toPublicClient(client);
}

export function getEmbedUrl(slug: string, baseUrl: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set('client', slug);
  return url.toString();
}

export function getEmbedSnippet(slug: string, baseUrl: string): string {
  const embedUrl = getEmbedUrl(slug, baseUrl);
  return `<iframe
  id="kitchen-visualizer"
  src="${embedUrl}"
  width="100%"
  frameborder="0"
  scrolling="no"
  title="Bekijk een nieuwe kleur op jouw keuken"
  style="border:0;width:100%;display:block;min-height:600px;"
></iframe>`;
}
