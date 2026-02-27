import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PurchaseInward } from '../types';

interface PurchaseInwardState {
  inwards: PurchaseInward[];
  loading: boolean;
  error: string | null;
}

const initialState: PurchaseInwardState = {
  inwards: [],
  loading: false,
  error: null,
};

const purchaseInwardSlice = createSlice({
  name: 'purchaseInward',
  initialState,
  reducers: {
    addInward: (state, action: PayloadAction<Omit<PurchaseInward, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const sequence = String(state.inwards.length + 1).padStart(4, '0');
      
      const newInward: PurchaseInward = {
        ...action.payload,
        id: `GRN-${year}${month}-${sequence}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.inwards.push(newInward);
    },
    updateInward: (state, action: PayloadAction<{ id: string; updates: Partial<PurchaseInward> }>) => {
      const index = state.inwards.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.inwards[index] = {
          ...state.inwards[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteInward: (state, action: PayloadAction<string>) => {
      state.inwards = state.inwards.filter(i => i.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { addInward, updateInward, deleteInward, setLoading, setError } = purchaseInwardSlice.actions;
export default purchaseInwardSlice.reducer;

// Selectors
export const selectAllInwards = (state: any) => state.purchaseInward.inwards;
export const selectInwardById = (state: any, id: string) => 
  state.purchaseInward.inwards.find((i: any) => i.id === id);
export const selectInwardsByPOId = (state: any, poId: string) => 
  state.purchaseInward.inwards.filter((i: any) => i.poId === poId);
