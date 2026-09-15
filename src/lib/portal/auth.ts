import { createHmac, timingSafeEqual } from 'crypto';

export const PORTAL_SESSION_COOKIE = 'kv_portal_session';

function getSessionSecret(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}

export function isPortalAuthConfigured(): boolean {
  return Boolean(getSessionSecret());
}

export function createPortalSessionValue(clientId: string): string {
  const secret = getSessionSecret();
  if (!secret) return '';
  const token = createHmac('sha256', secret)
    .update(`portal-session:${clientId}`)
    .digest('hex');
  return `${clientId}.${token}`;
}

export function parsePortalSessionValue(value: string | undefined): string | null {
  if (!value) return null;
  const dotIndex = value.indexOf('.');
  if (dotIndex === -1) return null;

  const clientId = value.slice(0, dotIndex);
  const token = value.slice(dotIndex + 1);
  if (!clientId || !token) return null;

  const expected = createPortalSessionValue(clientId);
  const expectedToken = expected.slice(dotIndex + 1);
  if (token.length !== expectedToken.length) return null;
  if (!timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken))) return null;

  return clientId;
}

export function verifyPortalSessionValue(value: string | undefined): boolean {
  return parsePortalSessionValue(value) !== null;
}
