import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PurchaseOrder } from '../types';

interface PurchaseOrdersState {
  orders: PurchaseOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: PurchaseOrdersState = {
  orders: [],
  loading: false,
  error: null,
};

const purchaseOrdersSlice = createSlice({
  name: 'purchaseOrders',
  initialState,
  reducers: {
    addPurchaseOrder: (state, action: PayloadAction<Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newPO: PurchaseOrder = {
        ...action.payload,
        id: `PO-${new Date().getFullYear()}-${String(state.orders.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.orders.push(newPO);
    },
    
    updatePurchaseOrder: (state, action: PayloadAction<{ id: string; updates: Partial<PurchaseOrder> }>) => {
      const index = state.orders.findIndex(po => po.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = {
          ...state.orders[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    approvePurchaseOrder: (state, action: PayloadAction<{ id: string; approvedBy: string }>) => {
      const index = state.orders.findIndex(po => po.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = {
          ...state.orders[index],
          status: 'approved',
          approvedBy: action.payload.approvedBy,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    rejectPurchaseOrder: (state, action: PayloadAction<string>) => {
      const index = state.orders.findIndex(po => po.id === action.payload);
      if (index !== -1) {
        state.orders[index] = {
          ...state.orders[index],
          status: 'rejected',
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    submitPurchaseOrder: (state, action: PayloadAction<string>) => {
      const index = state.orders.findIndex(po => po.id === action.payload);
      if (index !== -1) {
        state.orders[index] = {
          ...state.orders[index],
          status: 'pending',
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    sendPurchaseOrder: (state, action: PayloadAction<string>) => {
      const index = state.orders.findIndex(po => po.id === action.payload);
      if (index !== -1) {
        state.orders[index] = {
          ...state.orders[index],
          status: 'sent',
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    acknowledgePurchaseOrder: (state, action: PayloadAction<string>) => {
      const index = state.orders.findIndex(po => po.id === action.payload);
      if (index !== -1) {
        state.orders[index] = {
          ...state.orders[index],
          status: 'acknowledged',
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    deliverPurchaseOrder: (state, action: PayloadAction<string>) => {
      const index = state.orders.findIndex(po => po.id === action.payload);
      if (index !== -1) {
        state.orders[index] = {
          ...state.orders[index],
          status: 'delivered',
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    deletePurchaseOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(po => po.id !== action.payload);
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
  addPurchaseOrder, 
  updatePurchaseOrder, 
  submitPurchaseOrder,
  sendPurchaseOrder,
  acknowledgePurchaseOrder,
  approvePurchaseOrder,
  rejectPurchaseOrder,
  deliverPurchaseOrder,
  deletePurchaseOrder, 
  setLoading, 
  setError, 
  clearError 
} = purchaseOrdersSlice.actions;

export default purchaseOrdersSlice.reducer;

// Selectors
export const selectAllPurchaseOrders = (state: { purchaseOrders: PurchaseOrdersState }) => state.purchaseOrders.orders;
export const selectPurchaseOrderById = (state: { purchaseOrders: PurchaseOrdersState }, id: string) => 
  state.purchaseOrders.orders.find(po => po.id === id);
export const selectPendingPurchaseOrders = (state: { purchaseOrders: PurchaseOrdersState }) => 
  state.purchaseOrders.orders.filter(po => po.status === 'pending');
export const selectPurchaseOrdersBySupplierId = (state: { purchaseOrders: PurchaseOrdersState }, supplierId: string) => 
  state.purchaseOrders.orders.filter(po => po.supplier.id === supplierId);