import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GodownLocation, JobWorker } from '../types';

interface GodownJobWorkerState {
  locations: GodownLocation[];
  jobWorkers: JobWorker[];
  loading: boolean;
  error: string | null;
}

const initialState: GodownJobWorkerState = {
  locations: [
    {
      id: "LOC001",
      name: "Main Raw Material Godown",
      address: "Warehouse A, Sector 56, Industrial Estate",
      type: "inbound",
      capacity: 5000,
      currentUsage: 3200,
      contactPerson: "Mr. Sharma",
      phone: "+91 9123456780",
      status: "Active",
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date('2024-01-01').toISOString(),
    },
    {
      id: "LOC002",
      name: "Finished Goods Bay",
      address: "Warehouse B, Main Gate",
      type: "outbound",
      capacity: 2000,
      currentUsage: 450,
      contactPerson: "Rajiv Gupta",
      phone: "+91 9123456781",
      status: "Active",
      createdAt: new Date('2024-01-10').toISOString(),
      updatedAt: new Date('2024-01-10').toISOString(),
    }
  ],
  jobWorkers: [
    {
      id: "JW001",
      name: "Super Print Solutions",
      address: "Gali No. 4, Anand Industrial Area",
      phone: "+91 9988776655",
      gstNumber: "07AAAAA0000A1Z5",
      specialization: ["Offset Printing", "UV Coating"],
      ratePerUnit: 2.5,
      rating: 4.5,
      status: "Active",
      activeJobCards: 3,
      createdAt: new Date('2024-02-01').toISOString(),
      updatedAt: new Date('2024-02-01').toISOString(),
    },
    {
      id: "JW002",
      name: "Classic Die Cutters",
      address: "B-12, Okhla Phase 3",
      phone: "+91 9988776644",
      gstNumber: "07BBBBB0000B1Z5",
      specialization: ["Die Cutting", "Stitching"],
      ratePerUnit: 1.8,
      rating: 4.2,
      status: "Active",
      activeJobCards: 1,
      createdAt: new Date('2024-02-15').toISOString(),
      updatedAt: new Date('2024-02-15').toISOString(),
    }
  ],
  loading: false,
  error: null,
};

const godownJobWorkerSlice = createSlice({
  name: 'godownJobWorker',
  initialState,
  reducers: {
    // Location Actions
    addLocation: (state, action: PayloadAction<Omit<GodownLocation, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newLocation: GodownLocation = {
        ...action.payload,
        id: `LOC${String(state.locations.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.locations.push(newLocation);
    },
    updateLocation: (state, action: PayloadAction<{ id: string; updates: Partial<GodownLocation> }>) => {
      const index = state.locations.findIndex(loc => loc.id === action.payload.id);
      if (index !== -1) {
        state.locations[index] = {
          ...state.locations[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteLocation: (state, action: PayloadAction<string>) => {
      state.locations = state.locations.filter(loc => loc.id !== action.payload);
    },

    // Job Worker Actions
    addJobWorker: (state, action: PayloadAction<Omit<JobWorker, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newJW: JobWorker = {
        ...action.payload,
        id: `JW${String(state.jobWorkers.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.jobWorkers.push(newJW);
    },
    updateJobWorker: (state, action: PayloadAction<{ id: string; updates: Partial<JobWorker> }>) => {
      const index = state.jobWorkers.findIndex(jw => jw.id === action.payload.id);
      if (index !== -1) {
        state.jobWorkers[index] = {
          ...state.jobWorkers[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteJobWorker: (state, action: PayloadAction<string>) => {
      state.jobWorkers = state.jobWorkers.filter(jw => jw.id !== action.payload);
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
  addLocation,
  updateLocation,
  deleteLocation,
  addJobWorker,
  updateJobWorker,
  deleteJobWorker,
  setLoading,
  setError,
} = godownJobWorkerSlice.actions;

export default godownJobWorkerSlice.reducer;

// Selectors
export const selectAllLocations = (state: any) => state.godownJobWorker.locations;
export const selectAllJobWorkers = (state: any) => state.godownJobWorker.jobWorkers;
export const selectLocationById = (state: any, id: string) => 
  state.godownJobWorker.locations.find((loc: any) => loc.id === id);
export const selectJobWorkerById = (state: any, id: string) => 
  state.godownJobWorker.jobWorkers.find((jw: any) => jw.id === id);
