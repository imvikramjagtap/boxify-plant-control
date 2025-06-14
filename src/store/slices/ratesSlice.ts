import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RateConfiguration } from '../types';

interface RatesState {
  rates: RateConfiguration[];
  activeRateId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: RatesState = {
  rates: [
    {
      id: "RATE001",
      name: "Standard Rates",
      jwRate: 50,
      sheetInwardRate: 2,
      boxMakingRate: 1.5,
      printingCostRate: 3,
      accessoriesRate: 0.5,
      carriageOutward: 2,
      isDefault: true,
      effectiveFrom: "2024-01-01",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  activeRateId: "RATE001",
  loading: false,
  error: null,
};

const ratesSlice = createSlice({
  name: 'rates',
  initialState,
  reducers: {
    addRateConfiguration: (state, action: PayloadAction<Omit<RateConfiguration, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newRate: RateConfiguration = {
        ...action.payload,
        id: `RATE${String(state.rates.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.rates.push(newRate);
    },
    
    updateRateConfiguration: (state, action: PayloadAction<{ id: string; updates: Partial<RateConfiguration> }>) => {
      const index = state.rates.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.rates[index] = {
          ...state.rates[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    setActiveRate: (state, action: PayloadAction<string>) => {
      state.activeRateId = action.payload;
    },
    
    setDefaultRate: (state, action: PayloadAction<string>) => {
      // Remove default from all rates
      state.rates.forEach(rate => { rate.isDefault = false; });
      // Set new default
      const index = state.rates.findIndex(r => r.id === action.payload);
      if (index !== -1) {
        state.rates[index].isDefault = true;
        state.activeRateId = action.payload;
      }
    },
    
    deleteRateConfiguration: (state, action: PayloadAction<string>) => {
      const rateToDelete = state.rates.find(r => r.id === action.payload);
      if (rateToDelete && !rateToDelete.isDefault) {
        state.rates = state.rates.filter(r => r.id !== action.payload);
        if (state.activeRateId === action.payload) {
          const defaultRate = state.rates.find(r => r.isDefault);
          state.activeRateId = defaultRate?.id || null;
        }
      }
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
  addRateConfiguration, 
  updateRateConfiguration, 
  setActiveRate,
  setDefaultRate,
  deleteRateConfiguration, 
  setLoading, 
  setError 
} = ratesSlice.actions;

export default ratesSlice.reducer;

// Selectors
export const selectAllRates = (state: { rates: RatesState }) => state.rates.rates;
export const selectActiveRate = (state: { rates: RatesState }) => 
  state.rates.rates.find(r => r.id === state.rates.activeRateId);
export const selectDefaultRate = (state: { rates: RatesState }) => 
  state.rates.rates.find(r => r.isDefault);
export const selectRateById = (state: { rates: RatesState }, id: string) => 
  state.rates.rates.find(r => r.id === id);