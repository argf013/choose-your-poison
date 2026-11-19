import { create } from "zustand";
import { ExpressionInputs, ScreenStep } from "../types";

interface ExperienceState {
  currentStep: ScreenStep;
  selectedSocials: string[];
  selectedExpressionIds: string[];
  expressionInputs: ExpressionInputs;
  sessionId: string;
  sessionStartTime: number;
  paperWidth: "58mm" | "80mm";
  audioEnabled: boolean;
  isPrinting: boolean;
  hasPrinted: boolean;

  // Actions
  setStep: (step: ScreenStep) => void;
  toggleSocial: (id: string) => void;
  selectAllSocials: (ids: string[]) => void;
  clearSocials: () => void;
  toggleExpression: (id: string) => void;
  selectExpression: (id: string) => void;
  deselectExpression: (id: string) => void;
  selectAllExpressions: (ids: string[]) => void;
  clearSelections: () => void;
  updateExpressionInputs: (partial: Partial<ExpressionInputs>) => void;
  setPaperWidth: (width: "58mm" | "80mm") => void;
  toggleAudio: () => void;
  setIsPrinting: (val: boolean) => void;
  setHasPrinted: (val: boolean) => void;
  resetSession: () => void;
}

const generateSessionId = (): string => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `#00${num.toString().slice(0, 4)}`;
};

export const useExperienceStore = create<ExperienceState>((set) => ({
  currentStep: "introduction",
  selectedSocials: [],
  selectedExpressionIds: [],
  expressionInputs: {},
  sessionId: generateSessionId(),
  sessionStartTime: Date.now(),
  paperWidth: "58mm",
  audioEnabled: true,
  isPrinting: false,
  hasPrinted: false,

  setStep: (step) => set({ currentStep: step }),

  toggleSocial: (id) =>
    set((state) => {
      const exists = state.selectedSocials.includes(id);
      return {
        selectedSocials: exists
          ? state.selectedSocials.filter((item) => item !== id)
          : [...state.selectedSocials, id],
      };
    }),

  selectAllSocials: (ids) => set({ selectedSocials: ids }),

  clearSocials: () => set({ selectedSocials: [] }),

  toggleExpression: (id) =>
    set((state) => {
      const exists = state.selectedExpressionIds.includes(id);
      return {
        selectedExpressionIds: exists
          ? state.selectedExpressionIds.filter((item) => item !== id)
          : [...state.selectedExpressionIds, id],
      };
    }),

  selectExpression: (id) =>
    set((state) => {
      if (state.selectedExpressionIds.includes(id)) return state;
      return { selectedExpressionIds: [...state.selectedExpressionIds, id] };
    }),

  deselectExpression: (id) =>
    set((state) => ({
      selectedExpressionIds: state.selectedExpressionIds.filter((item) => item !== id),
    })),

  selectAllExpressions: (ids) => set({ selectedExpressionIds: ids }),

  clearSelections: () => set({ selectedExpressionIds: [] }),

  updateExpressionInputs: (partial) =>
    set((state) => ({
      expressionInputs: {
        ...state.expressionInputs,
        ...partial,
      },
    })),

  setPaperWidth: (paperWidth) => set({ paperWidth }),

  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),

  setIsPrinting: (isPrinting) => set({ isPrinting }),

  setHasPrinted: (hasPrinted) => set({ hasPrinted }),

  resetSession: () =>
    set({
      currentStep: "introduction",
      selectedSocials: [],
      selectedExpressionIds: [],
      expressionInputs: {},
      sessionId: generateSessionId(),
      sessionStartTime: Date.now(),
      isPrinting: false,
      hasPrinted: false,
    }),
}));
