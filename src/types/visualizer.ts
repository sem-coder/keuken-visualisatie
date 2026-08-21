export type VisualizerStep =
  | 'photo'
  | 'colors'
  | 'generating'
  | 'result'
  | 'samples'
  | 'details'
  | 'success';

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  houseNumber: string;
  addition: string;
  postalCode: string;
  city: string;
  message: string;
  consent: boolean;
}

export interface VisualizationEntry {
  materialId: string;
  imageUrl: string;
}

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
}

export interface SampleRequestPayload {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: {
      street: string;
      houseNumber: string;
      addition?: string;
      postalCode: string;
      city: string;
    };
  };
  samples: {
    id: string;
    name: string;
    code: string;
    sku?: string;
    visualizationUrl?: string;
  }[];
  kitchenImage?: string;
  message?: string;
  consent: boolean;
  attribution?: Attribution;
}

export type MaterialFilter = 'all' | 'light' | 'dark' | 'green' | 'wood';
