import { createHash, randomBytes } from 'crypto';
import { readTenantJson, writeTenantJson } from '@/lib/tenants/storage';

const RESETS_PATH = 'password-resets.json';
const TOKEN_TTL_MS = 60 * 60 * 1000;

interface StoredPasswordReset {
  tokenHash: string;
  clientId: string;
  email: string;
  expiresAt: string;
}

interface PasswordResetStore {
  tokens: StoredPasswordReset[];
  updatedAt: string;
}

function emptyStore(): PasswordResetStore {
  return { tokens: [], updatedAt: new Date().toISOString() };
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

async function readStore(): Promise<PasswordResetStore> {
  const store = await readTenantJson(RESETS_PATH, emptyStore());
  if (!Array.isArray(store.tokens)) {
    return emptyStore();
  }
  return store;
}

async function writeStore(store: PasswordResetStore): Promise<void> {
  store.updatedAt = new Date().toISOString();
  await writeTenantJson(RESETS_PATH, store);
}

function pruneExpired(store: PasswordResetStore): PasswordResetStore {
  const now = Date.now();
  return {
    ...store,
    tokens: store.tokens.filter((entry) => new Date(entry.expiresAt).getTime() > now),
  };
}

export async function createPasswordResetToken(
  clientId: string,
  email: string,
): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const store = pruneExpired(await readStore());

  store.tokens = store.tokens.filter((entry) => entry.clientId !== clientId);
  store.tokens.push({
    tokenHash: hashToken(token),
    clientId,
    email,
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
  });

  await writeStore(store);
  return token;
}

export async function consumePasswordResetToken(
  token: string,
): Promise<{ clientId: string; email: string } | null> {
  const store = pruneExpired(await readStore());
  const tokenHash = hashToken(token);
  const index = store.tokens.findIndex((entry) => entry.tokenHash === tokenHash);

  if (index === -1) {
    await writeStore(store);
    return null;
  }

  const entry = store.tokens[index];
  if (new Date(entry.expiresAt).getTime() <= Date.now()) {
    store.tokens.splice(index, 1);
    await writeStore(store);
    return null;
  }

  store.tokens.splice(index, 1);
  await writeStore(store);
  return { clientId: entry.clientId, email: entry.email };
}
