import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/portal/auth-server';
import { getLead, updateLeadStatus } from '@/lib/tenants/leads';
import type { LeadStatus } from '@/lib/tenants/types';

export const runtime = 'nodejs';

const VALID_STATUSES: LeadStatus[] = ['new', 'contacted', 'closed'];

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const client = await getAuthenticatedClient();
  if (!client) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  }

  const { id } = await context.params;
  const lead = await getLead(client.id, id);
  if (!lead) {
    return NextResponse.json({ error: 'Lead niet gevonden' }, { status: 404 });
  }

  return NextResponse.json({ lead });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const client = await getAuthenticatedClient();
  if (!client) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { status?: LeadStatus };
  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 });
  }

  const lead = await updateLeadStatus(client.id, id, body.status);
  if (!lead) {
    return NextResponse.json({ error: 'Lead niet gevonden' }, { status: 404 });
  }

  return NextResponse.json({ lead });
}
