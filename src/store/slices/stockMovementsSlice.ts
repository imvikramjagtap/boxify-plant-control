import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StockMovement } from '../types';

interface StockMovementsState {
  movements: StockMovement[];
  loading: boolean;
  error: string | null;
}

const initialState: StockMovementsState = {
  movements: [
    {
      id: "SM001",
      materialId: "RM001",
      type: "IN",
      quantity: 1000,
      reason: "Purchase Order",
      poNumber: "PO-2024-001",
      date: "2024-06-10",
      notes: "Fresh stock from Paper Mills",
      createdBy: "System"
    },
    {
      id: "SM002",
      materialId: "RM001",
      type: "OUT",
      quantity: 250,
      reason: "Production Consumption",
      jobId: "JOB001",
      date: "2024-06-12",
      notes: "Used for ABC Industries order",
      createdBy: "John Doe"
    }
  ],
  loading: false,
  error: null,
};

const stockMovementsSlice = createSlice({
  name: 'stockMovements',
  initialState,
  reducers: {
    addStockMovement: (state, action: PayloadAction<Omit<StockMovement, 'id'>>) => {
      const newMovement: StockMovement = {
        ...action.payload,
        id: `SM${String(state.movements.length + 1).padStart(3, '0')}`,
      };
      state.movements.push(newMovement);
    },
    
    deleteStockMovement: (state, action: PayloadAction<string>) => {
      state.movements = state.movements.filter(sm => sm.id !== action.payload);
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  addStockMovement, 
  deleteStockMovement, 
  setLoading, 
  setError, 
  clearError 
} = stockMovementsSlice.actions;

export default stockMovementsSlice.reducer;

// Selectors
export const selectAllStockMovements = (state: { stockMovements: StockMovementsState }) => state.stockMovements.movements;
export const selectStockMovementsByMaterialId = (state: { stockMovements: StockMovementsState }, materialId: string) => 
  state.stockMovements.movements.filter(sm => sm.materialId === materialId);
export const selectRecentStockMovements = (state: { stockMovements: StockMovementsState }, days = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return state.stockMovements.movements.filter(sm => new Date(sm.date) >= cutoffDate);
};