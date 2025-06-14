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
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const sequence = String(state.orders.length + 1).padStart(4, '0');
      
      const newPO: PurchaseOrder = {
        ...action.payload,
        id: `PO-${year}${month}-${sequence}`,
        revision: 1,
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

    updateItemDelivery: (state, action: PayloadAction<{
      poId: string;
      itemId: string;
      deliveredQuantity: number;
      qualityAccepted: boolean;
      grnNumber?: string;
      inspectionNotes?: string;
    }>) => {
      const poIndex = state.orders.findIndex(po => po.id === action.payload.poId);
      if (poIndex !== -1) {
        const itemIndex = state.orders[poIndex].items.findIndex(item => item.id === action.payload.itemId);
        if (itemIndex !== -1) {
          const item = state.orders[poIndex].items[itemIndex];
          const newDeliveredQty = (item.deliveredQuantity || 0) + action.payload.deliveredQuantity;
          
          state.orders[poIndex].items[itemIndex] = {
            ...item,
            deliveredQuantity: newDeliveredQty,
            qualityAccepted: action.payload.qualityAccepted,
            grnNumber: action.payload.grnNumber,
            inspectionNotes: action.payload.inspectionNotes,
            deliveryStatus: newDeliveredQty >= item.quantity ? 'completed' : 'partial',
          };
          
          // Update PO status based on all items delivery status
          const allItemsDelivered = state.orders[poIndex].items.every(
            item => (item.deliveredQuantity || 0) >= item.quantity
          );
          const hasPartialDelivery = state.orders[poIndex].items.some(
            item => (item.deliveredQuantity || 0) > 0 && (item.deliveredQuantity || 0) < item.quantity
          );
          
          if (allItemsDelivered) {
            state.orders[poIndex].status = 'delivered';
          } else if (hasPartialDelivery) {
            state.orders[poIndex].status = 'acknowledged'; // Keep as acknowledged with partial delivery
          }
          
          state.orders[poIndex].updatedAt = new Date().toISOString();
        }
      }
    },

    markPOEmailSent: (state, action: PayloadAction<string>) => {
      const index = state.orders.findIndex(po => po.id === action.payload);
      if (index !== -1) {
        state.orders[index] = {
          ...state.orders[index],
          emailSent: true,
          emailSentAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    },

    markPOPrinted: (state, action: PayloadAction<string>) => {
      const index = state.orders.findIndex(po => po.id === action.payload);
      if (index !== -1) {
        state.orders[index] = {
          ...state.orders[index],
          printedAt: new Date().toISOString(),
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
  updateItemDelivery,
  markPOEmailSent,
  markPOPrinted,
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