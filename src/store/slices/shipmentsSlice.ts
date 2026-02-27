import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Shipment {
  id: string;
  orderId: string;
  clientId: string;
  lrNumber: string;
  transporterName: string;
  vehicleNumber: string;
  shipDate: string;
  deliveryDate?: string;
  status: 'in_transit' | 'delivered' | 'cancelled';
  notes?: string;
  createdBy: string;
  createdAt: string;
}

interface ShipmentsState {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
}

const initialState: ShipmentsState = {
  shipments: [
    {
      id: "SHP001",
      orderId: "ORD001",
      clientId: "CLI001",
      lrNumber: "LR123456",
      transporterName: "Safe Xpress",
      vehicleNumber: "MH 01 AB 1234",
      shipDate: "2024-06-15",
      status: "delivered",
      deliveryDate: "2024-06-17",
      createdBy: "Admin",
      createdAt: "2024-06-15T10:00:00Z"
    }
  ],
  loading: false,
  error: null,
};

const shipmentsSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {
    addShipment: (state, action: PayloadAction<Omit<Shipment, 'id' | 'createdAt'>>) => {
      const newShipment: Shipment = {
        ...action.payload,
        id: `SHP${String(state.shipments.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
      };
      state.shipments.push(newShipment);
    },
    
    updateShipmentStatus: (state, action: PayloadAction<{ id: string; status: Shipment['status']; deliveryDate?: string }>) => {
      const index = state.shipments.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.shipments[index].status = action.payload.status;
        if (action.payload.deliveryDate) {
          state.shipments[index].deliveryDate = action.payload.deliveryDate;
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
  addShipment, 
  updateShipmentStatus, 
  setLoading, 
  setError 
} = shipmentsSlice.actions;

export default shipmentsSlice.reducer;

// Selectors
export const selectAllShipments = (state: { shipments: ShipmentsState }) => state.shipments.shipments;
export const selectShipmentByOrderId = (state: { shipments: ShipmentsState }, orderId: string) => 
  state.shipments.shipments.find(s => s.orderId === orderId);
