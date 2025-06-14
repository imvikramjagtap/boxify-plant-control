import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CostCalculation } from '../types';

interface CalculationState {
  calculations: Record<string, CostCalculation>; // costingId -> calculation
  loading: boolean;
  error: string | null;
}

const initialState: CalculationState = {
  calculations: {},
  loading: false,
  error: null,
};

const calculationSlice = createSlice({
  name: 'calculations',
  initialState,
  reducers: {
    setCalculation: (state, action: PayloadAction<{ costingId: string; calculation: CostCalculation }>) => {
      state.calculations[action.payload.costingId] = action.payload.calculation;
    },
    
    updateCalculation: (state, action: PayloadAction<{ costingId: string; updates: Partial<CostCalculation> }>) => {
      const existing = state.calculations[action.payload.costingId];
      if (existing) {
        state.calculations[action.payload.costingId] = {
          ...existing,
          ...action.payload.updates,
        };
      }
    },
    
    removeCalculation: (state, action: PayloadAction<string>) => {
      delete state.calculations[action.payload];
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setCalculation, 
  updateCalculation, 
  removeCalculation, 
  setLoading, 
  setError 
} = calculationSlice.actions;

export default calculationSlice.reducer;

// Selectors
export const selectCalculationById = (state: { calculations: CalculationState }, costingId: string) => 
  state.calculations.calculations[costingId];
export const selectAllCalculations = (state: { calculations: CalculationState }) => 
  state.calculations.calculations;