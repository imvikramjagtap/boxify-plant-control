import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BoxMaster } from '../types';

interface BoxMasterState {
  boxes: BoxMaster[];
  loading: boolean;
  error: string | null;
}

const initialState: BoxMasterState = {
  boxes: [
    {
      id: "BOX001",
      name: "Small Shipping Box",
      dimensions: {
        length: 20,
        width: 15,
        height: 10
      },
      materials: [
        { materialId: "RM001", quantity: 2, unit: "Pieces" },
        { materialId: "RM002", quantity: 0.1, unit: "KG" },
        { materialId: "RM003", quantity: 0.5, unit: "Rolls" }
      ],
      estimatedCost: 125.50,
      category: "Shipping",
      description: "Standard small shipping box for lightweight items",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    }
  ],
  loading: false,
  error: null,
};

const boxMasterSlice = createSlice({
  name: 'boxMaster',
  initialState,
  reducers: {
    addBox: (state, action: PayloadAction<Omit<BoxMaster, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newBox: BoxMaster = {
        ...action.payload,
        id: `BOX${String(state.boxes.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.boxes.push(newBox);
    },
    
    updateBox: (state, action: PayloadAction<{ id: string; updates: Partial<BoxMaster> }>) => {
      const index = state.boxes.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.boxes[index] = {
          ...state.boxes[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    deleteBox: (state, action: PayloadAction<string>) => {
      state.boxes = state.boxes.filter(b => b.id !== action.payload);
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
  addBox, 
  updateBox, 
  deleteBox, 
  setLoading, 
  setError, 
  clearError 
} = boxMasterSlice.actions;

export default boxMasterSlice.reducer;

// Selectors
export const selectAllBoxes = (state: { boxMaster: BoxMasterState }) => state.boxMaster.boxes;
export const selectBoxById = (state: { boxMaster: BoxMasterState }, id: string) => 
  state.boxMaster.boxes.find(b => b.id === id);
export const selectBoxesByCategory = (state: { boxMaster: BoxMasterState }, category: string) => 
  state.boxMaster.boxes.filter(b => b.category === category);