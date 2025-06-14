import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CostingProject } from '../types';

interface CostingState {
  projects: CostingProject[];
  loading: boolean;
  error: string | null;
}

const initialState: CostingState = {
  projects: [
    {
      id: "COST001",
      quotationId: "QUO001",
      name: "ABC Retail - Small Box Order",
      clientId: "CLI001",
      boxId: "BOX001",
      quantity: 1000,
      jwRate: 50,
      sheetInwardRate: 2,
      boxMakingRate: 1.5,
      printingCostRate: 3,
      accessoriesRate: 0.5,
      roiPercentage: 20,
      carriageOutward: 2,
      boxName: "Monitor Packaging Box",
      totalBoxWeight: 485.2,
      calculations: {
        totalBoxWeightKg: 0.4852,
        jwCharges: 0.024,
        sheetInwardCost: 0.970,
        boxMakingCost: 1.5,
        printingCost: 3,
        accessoriesCost: 0.243,
        mfgCostPerBox: 5.737,
        roiAmount: 1.147,
        totalCostPerBox: 8.884,
        totalPrice: 8884
      },
      quotationDetails: {
        quotationId: "QUO001",
        quotationDate: "2024-01-01",
        validityDays: 30,
        paymentTerms: "30 days",
        deliveryTerms: "Ex-works"
      },
      status: "quoted",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    }
  ],
  loading: false,
  error: null,
};

const costingSlice = createSlice({
  name: 'costing',
  initialState,
  reducers: {
    addCostingProject: (state, action: PayloadAction<Omit<CostingProject, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newProject: CostingProject = {
        ...action.payload,
        id: `COST${String(state.projects.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.projects.push(newProject);
    },
    
    updateCostingProject: (state, action: PayloadAction<{ id: string; updates: Partial<CostingProject> }>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = {
          ...state.projects[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    approveCostingProject: (state, action: PayloadAction<string>) => {
      const index = state.projects.findIndex(p => p.id === action.payload);
      if (index !== -1) {
        state.projects[index] = {
          ...state.projects[index],
          status: 'approved',
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    rejectCostingProject: (state, action: PayloadAction<string>) => {
      const index = state.projects.findIndex(p => p.id === action.payload);
      if (index !== -1) {
        state.projects[index] = {
          ...state.projects[index],
          status: 'rejected',
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    deleteCostingProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload);
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
  addCostingProject, 
  updateCostingProject, 
  approveCostingProject,
  rejectCostingProject,
  deleteCostingProject, 
  setLoading, 
  setError, 
  clearError 
} = costingSlice.actions;

export default costingSlice.reducer;

// Selectors
export const selectAllCostingProjects = (state: { costing: CostingState }) => state.costing.projects;
export const selectCostingProjectById = (state: { costing: CostingState }, id: string) => 
  state.costing.projects.find(p => p.id === id);
export const selectCostingProjectsByClientId = (state: { costing: CostingState }, clientId: string) => 
  state.costing.projects.filter(p => p.clientId === clientId);
export const selectCostingProjectsByStatus = (state: { costing: CostingState }, status: CostingProject['status']) => 
  state.costing.projects.filter(p => p.status === status);