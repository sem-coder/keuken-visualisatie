import { cookies } from 'next/headers';
import { getClientById } from '@/lib/tenants/clients';
import type { TenantClient } from '@/lib/tenants/types';
import { PORTAL_SESSION_COOKIE, parsePortalSessionValue } from '@/lib/portal/auth';

export async function getAuthenticatedClient(): Promise<TenantClient | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(PORTAL_SESSION_COOKIE)?.value;
  const clientId = parsePortalSessionValue(value);
  if (!clientId) return null;

  const client = await getClientById(clientId);
  if (!client || !client.active) return null;
  return client;
}

export async function isPortalAuthenticated(): Promise<boolean> {
  return (await getAuthenticatedClient()) !== null;
}
