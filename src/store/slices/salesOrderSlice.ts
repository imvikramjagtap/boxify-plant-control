import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SalesOrderItem {
  id: string;
  boxId: string;
  boxName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications: Record<string, any>;
  deliveryDate: string;
  productionStatus: 'pending' | 'in_progress' | 'completed' | 'shipped';
}

export interface SalesOrder {
  id: string;
  quotationId: string;
  costingProjectId: string;
  clientId: string;
  orderDate: string;
  expectedDeliveryDate: string;
  totalAmount: number;
  status: 'draft' | 'confirmed' | 'in_production' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled';
  items: SalesOrderItem[];
  paymentTerms: string;
  deliveryTerms: string;
  specialInstructions?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  productionStartDate?: string;
  shippingDate?: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionCapacity {
  boxTypeId: string;
  dailyCapacity: number;
  currentLoad: number;
  availableCapacity: number;
  nextAvailableDate: string;
}

interface SalesOrderState {
  orders: SalesOrder[];
  productionCapacity: ProductionCapacity[];
  loading: boolean;
  error: string | null;
}

const initialState: SalesOrderState = {
  orders: [],
  productionCapacity: [
    {
      boxTypeId: "BOX001",
      dailyCapacity: 1000,
      currentLoad: 750,
      availableCapacity: 250,
      nextAvailableDate: "2024-01-15"
    }
  ],
  loading: false,
  error: null,
};

const salesOrderSlice = createSlice({
  name: 'salesOrders',
  initialState,
  reducers: {
    createSalesOrderFromQuote: (state, action: PayloadAction<{
      quotationId: string;
      costingProjectId: string;
      clientId: string;
      expectedDeliveryDate: string;
      createdBy: string;
    }>) => {
      const newOrder: SalesOrder = {
        id: `SO${String(state.orders.length + 1).padStart(4, '0')}`,
        ...action.payload,
        orderDate: new Date().toISOString(),
        totalAmount: 0, // Will be calculated based on items
        status: 'draft',
        items: [],
        paymentTerms: "30 days from delivery",
        deliveryTerms: "Ex-works",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.orders.push(newOrder);
    },

    addSalesOrderItem: (state, action: PayloadAction<{ orderId: string; item: Omit<SalesOrderItem, 'id'> }>) => {
      const order = state.orders.find(o => o.id === action.payload.orderId);
      if (order) {
        const newItem: SalesOrderItem = {
          ...action.payload.item,
          id: `ITEM${String(order.items.length + 1).padStart(3, '0')}`,
        };
        order.items.push(newItem);
        order.totalAmount = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
        order.updatedAt = new Date().toISOString();
      }
    },

    updateSalesOrderStatus: (state, action: PayloadAction<{ id: string; status: SalesOrder['status'] }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
        order.updatedAt = new Date().toISOString();
        
        if (action.payload.status === 'in_production' && !order.productionStartDate) {
          order.productionStartDate = new Date().toISOString();
        }
        if (action.payload.status === 'shipped' && !order.shippingDate) {
          order.shippingDate = new Date().toISOString();
        }
        if (action.payload.status === 'delivered' && !order.deliveryDate) {
          order.deliveryDate = new Date().toISOString();
        }
      }
    },

    approveSalesOrder: (state, action: PayloadAction<{ id: string; approvedBy: string }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.status = 'confirmed';
        order.approvedBy = action.payload.approvedBy;
        order.approvedAt = new Date().toISOString();
        order.updatedAt = new Date().toISOString();
      }
    },

    updateProductionCapacity: (state, action: PayloadAction<{ boxTypeId: string; updates: Partial<ProductionCapacity> }>) => {
      const index = state.productionCapacity.findIndex(c => c.boxTypeId === action.payload.boxTypeId);
      if (index !== -1) {
        state.productionCapacity[index] = {
          ...state.productionCapacity[index],
          ...action.payload.updates,
        };
      }
    },

    checkProductionCapacity: (state, action: PayloadAction<{ boxTypeId: string; quantity: number; requestedDate: string }>) => {
      const capacity = state.productionCapacity.find(c => c.boxTypeId === action.payload.boxTypeId);
      if (capacity) {
        const requiredDays = Math.ceil(action.payload.quantity / capacity.dailyCapacity);
        const availableDate = new Date();
        availableDate.setDate(availableDate.getDate() + requiredDays);
        capacity.nextAvailableDate = availableDate.toISOString().split('T')[0];
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
  createSalesOrderFromQuote,
  addSalesOrderItem,
  updateSalesOrderStatus,
  approveSalesOrder,
  updateProductionCapacity,
  checkProductionCapacity,
  setLoading,
  setError,
} = salesOrderSlice.actions;

export default salesOrderSlice.reducer;

// Selectors
export const selectSalesOrdersByClient = (state: { salesOrders: SalesOrderState }, clientId: string) =>
  state.salesOrders.orders.filter(o => o.clientId === clientId);

export const selectSalesOrderByQuotation = (state: { salesOrders: SalesOrderState }, quotationId: string) =>
  state.salesOrders.orders.find(o => o.quotationId === quotationId);

export const selectAllSalesOrders = (state: { salesOrders: SalesOrderState }) =>
  state.salesOrders.orders;

export const selectProductionCapacityByBoxType = (state: { salesOrders: SalesOrderState }, boxTypeId: string) =>
  state.salesOrders.productionCapacity.find(c => c.boxTypeId === boxTypeId);