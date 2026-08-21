'use client';

import { create } from 'zustand';
import type {
  Attribution,
  CustomerFormData,
  VisualizationEntry,
  VisualizerStep,
} from '@/types/visualizer';

interface KitchenVisualizerState {
  step: VisualizerStep;
  originalImage: File | null;
  originalPreviewUrl: string | null;
  kitchenImageStorageKey: string | null;
  activeMaterialId: string | null;
  visualizations: Record<string, VisualizationEntry>;
  viewedMaterialIds: string[];
  selectedSampleIds: string[];
  customer: CustomerFormData;
  attribution: Attribution;
  requestId?: string;
  generationError: string | null;
  isSubmitting: boolean;

  setStep: (step: VisualizerStep) => void;
  setOriginalImage: (file: File | null, previewUrl: string | null) => void;
  setKitchenImageStorageKey: (key: string | null) => void;
  setActiveMaterialId: (id: string | null) => void;
  addVisualization: (entry: VisualizationEntry) => void;
  markMaterialViewed: (materialId: string) => void;
  toggleSample: (materialId: string) => string | null;
  removeSample: (materialId: string) => void;
  updateCustomer: (data: Partial<CustomerFormData>) => void;
  setAttribution: (attribution: Attribution) => void;
  setRequestId: (id: string) => void;
  setGenerationError: (error: string | null) => void;
  setIsSubmitting: (value: boolean) => void;
  resetForNewColor: () => void;
  resetAll: () => void;
}

const initialCustomer: CustomerFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  houseNumber: '',
  addition: '',
  postalCode: '',
  city: '',
  message: '',
  consent: false,
};

export const useKitchenVisualizer = create<KitchenVisualizerState>((set, get) => ({
  step: 'photo',
  originalImage: null,
  originalPreviewUrl: null,
  kitchenImageStorageKey: null,
  activeMaterialId: null,
  visualizations: {},
  viewedMaterialIds: [],
  selectedSampleIds: [],
  customer: initialCustomer,
  attribution: {},
  generationError: null,
  isSubmitting: false,

  setStep: (step) => set({ step }),

  setOriginalImage: (file, previewUrl) =>
    set({ originalImage: file, originalPreviewUrl: previewUrl }),

  setKitchenImageStorageKey: (key) => set({ kitchenImageStorageKey: key }),

  setActiveMaterialId: (id) => set({ activeMaterialId: id }),

  addVisualization: (entry) =>
    set((state) => ({
      visualizations: { ...state.visualizations, [entry.materialId]: entry },
      viewedMaterialIds: state.viewedMaterialIds.includes(entry.materialId)
        ? state.viewedMaterialIds
        : [...state.viewedMaterialIds, entry.materialId],
    })),

  markMaterialViewed: (materialId) =>
    set((state) => ({
      viewedMaterialIds: state.viewedMaterialIds.includes(materialId)
        ? state.viewedMaterialIds
        : [...state.viewedMaterialIds, materialId],
    })),

  toggleSample: (materialId) => {
    const { selectedSampleIds } = get();
    if (selectedSampleIds.includes(materialId)) {
      set({ selectedSampleIds: selectedSampleIds.filter((id) => id !== materialId) });
      return null;
    }
    if (selectedSampleIds.length >= 2) {
      return 'Je kunt maximaal 2 samples kiezen. Verwijder eerst een andere sample.';
    }
    set({ selectedSampleIds: [...selectedSampleIds, materialId] });
    return null;
  },

  removeSample: (materialId) =>
    set((state) => ({
      selectedSampleIds: state.selectedSampleIds.filter((id) => id !== materialId),
    })),

  updateCustomer: (data) =>
    set((state) => ({ customer: { ...state.customer, ...data } })),

  setAttribution: (attribution) => set({ attribution }),

  setRequestId: (id) => set({ requestId: id }),

  setGenerationError: (error) => set({ generationError: error }),

  setIsSubmitting: (value) => set({ isSubmitting: value }),

  resetForNewColor: () =>
    set({ step: 'colors', activeMaterialId: null, generationError: null }),

  resetAll: () =>
    set({
      step: 'photo',
      originalImage: null,
      originalPreviewUrl: null,
      kitchenImageStorageKey: null,
      activeMaterialId: null,
      visualizations: {},
      viewedMaterialIds: [],
      selectedSampleIds: [],
      customer: initialCustomer,
      requestId: undefined,
      generationError: null,
      isSubmitting: false,
    }),
}));
