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
  /** Successful AI visualizations per calendar month (Europe/Amsterdam). 0 = unlimited. */
  monthlyVisualizationLimit?: number;
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
  monthlyVisualizationLimit: number;
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
  monthlyVisualizationLimit?: number;
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
  monthlyVisualizationLimit?: number;
}
