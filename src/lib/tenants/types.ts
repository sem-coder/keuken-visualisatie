import type { Attribution, SampleRequestPayload } from '@/types/visualizer';

export type LeadStatus = 'new' | 'contacted' | 'closed';

export interface TenantClient {
  id: string;
  slug: string;
  name: string;
  email: string;
  websiteUrl?: string;
  passwordHash: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantClientPublic {
  id: string;
  slug: string;
  name: string;
  email: string;
  websiteUrl?: string;
  active: boolean;
}

export interface Lead {
  id: string;
  clientId: string;
  status: LeadStatus;
  customer: SampleRequestPayload['customer'];
  samples: SampleRequestPayload['samples'];
  kitchenImage?: string;
  message?: string;
  attribution?: Attribution;
  visualizationCount: number;
  submittedAt: string;
  updatedAt: string;
}

export interface ClientRegistry {
  clients: TenantClient[];
  updatedAt: string;
}

export interface ClientLeadsStore {
  leads: Lead[];
  updatedAt: string;
}

export interface CreateClientInput {
  slug?: string;
  name: string;
  email: string;
  password: string;
  websiteUrl?: string;
}

export interface RegisterClientInput {
  name: string;
  email: string;
  password: string;
  websiteUrl?: string;
  slug?: string;
}

export interface UpdateClientInput {
  name?: string;
  email?: string;
  slug?: string;
  websiteUrl?: string;
  password?: string;
  active?: boolean;
}
