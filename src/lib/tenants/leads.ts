import { readTenantJson, writeTenantJson } from '@/lib/tenants/storage';
import type { ClientLeadsStore, Lead, LeadStatus } from '@/lib/tenants/types';
import type { SampleRequestPayload } from '@/types/visualizer';

function leadsPath(clientId: string): string {
  return `leads/${clientId}.json`;
}

function emptyLeadsStore(): ClientLeadsStore {
  return { leads: [], updatedAt: new Date().toISOString() };
}

async function readLeads(clientId: string): Promise<ClientLeadsStore> {
  const store = await readTenantJson(leadsPath(clientId), emptyLeadsStore());
  if (!Array.isArray(store.leads)) {
    return emptyLeadsStore();
  }
  return store;
}

async function writeLeads(clientId: string, store: ClientLeadsStore): Promise<void> {
  store.updatedAt = new Date().toISOString();
  await writeTenantJson(leadsPath(clientId), store);
}

export async function createLead(
  clientId: string,
  leadId: string,
  payload: SampleRequestPayload,
  visualizationCount: number,
): Promise<Lead> {
  const store = await readLeads(clientId);
  const now = new Date().toISOString();

  const lead: Lead = {
    id: leadId,
    clientId,
    status: 'new',
    customer: payload.customer,
    samples: payload.samples,
    kitchenImage: payload.kitchenImage,
    message: payload.message,
    attribution: payload.attribution,
    visualizationCount,
    submittedAt: now,
    updatedAt: now,
  };

  store.leads.unshift(lead);
  await writeLeads(clientId, store);
  return lead;
}

export async function listLeadsForClient(clientId: string): Promise<Lead[]> {
  const store = await readLeads(clientId);
  return store.leads;
}

export async function getLead(clientId: string, leadId: string): Promise<Lead | null> {
  const store = await readLeads(clientId);
  return store.leads.find((lead) => lead.id === leadId) ?? null;
}

export async function updateLeadStatus(
  clientId: string,
  leadId: string,
  status: LeadStatus,
): Promise<Lead | null> {
  const store = await readLeads(clientId);
  const index = store.leads.findIndex((lead) => lead.id === leadId);
  if (index === -1) return null;

  store.leads[index] = {
    ...store.leads[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  await writeLeads(clientId, store);
  return store.leads[index];
}

export async function countLeadsByStatus(clientId: string): Promise<Record<LeadStatus, number>> {
  const leads = await listLeadsForClient(clientId);
  return {
    new: leads.filter((lead) => lead.status === 'new').length,
    contacted: leads.filter((lead) => lead.status === 'contacted').length,
    closed: leads.filter((lead) => lead.status === 'closed').length,
  };
}
