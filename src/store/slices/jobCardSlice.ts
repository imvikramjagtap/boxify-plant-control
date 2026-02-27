import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { JobCard } from '../types';

interface JobCardState {
  jobCards: JobCard[];
  loading: boolean;
  error: string | null;
}

const initialState: JobCardState = {
  jobCards: [],
  loading: false,
  error: null,
};

const jobCardSlice = createSlice({
  name: 'jobCards',
  initialState,
  reducers: {
    addJobCard: (state, action: PayloadAction<Omit<JobCard, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newJobCard: JobCard = {
        ...action.payload,
        id: `JC${String(state.jobCards.length + 1).padStart(5, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.jobCards.push(newJobCard);
    },
    updateJobCard: (state, action: PayloadAction<{ id: string; updates: Partial<JobCard> }>) => {
      const index = state.jobCards.findIndex(jc => jc.id === action.payload.id);
      if (index !== -1) {
        state.jobCards[index] = {
          ...state.jobCards[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    updateJobCardStatus: (state, action: PayloadAction<{ id: string; status: JobCard['status'] }>) => {
      const jc = state.jobCards.find(j => j.id === action.payload.id);
      if (jc) {
        jc.status = action.payload.status;
        jc.updatedAt = new Date().toISOString();
      }
    },
    deleteJobCard: (state, action: PayloadAction<string>) => {
      state.jobCards = state.jobCards.filter(jc => jc.id !== action.payload);
    },
    addReceivedItem: (state, action: PayloadAction<{ 
      jcId: string; 
      itemId: string; 
      quantity: number;
    }>) => {
      const jc = state.jobCards.find(j => j.id === action.payload.jcId);
      if (jc) {
        const item = jc.items.find(i => i.id === action.payload.itemId);
        if (item) {
          item.receivedQuantity += action.payload.quantity;
          jc.updatedAt = new Date().toISOString();
          
          // Auto-update status if all items received
          const allReceived = jc.items.every(i => i.receivedQuantity >= i.quantity);
          if (allReceived) {
            jc.status = 'received';
            jc.actualReturnDate = new Date().toISOString();
          } else if (jc.items.some(i => i.receivedQuantity > 0)) {
            jc.status = 'partially_received';
          }
        }
      }
    }
  },
});

export const { 
  addJobCard, 
  updateJobCard, 
  updateJobCardStatus, 
  deleteJobCard,
  addReceivedItem
} = jobCardSlice.actions;

export default jobCardSlice.reducer;

// Selectors
export const selectAllJobCards = (state: { jobCards: JobCardState }) => state.jobCards.jobCards;
export const selectJobCardsByWorker = (state: { jobCards: JobCardState }, workerId: string) => 
  state.jobCards.jobCards.filter(jc => jc.jobWorkerId === workerId);
export const selectJobCardById = (state: { jobCards: JobCardState }, id: string) => 
  state.jobCards.jobCards.find(jc => jc.id === id);
