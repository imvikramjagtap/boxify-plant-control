import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Supplier } from '../types';

interface SuppliersState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
}

const initialState: SuppliersState = {
  suppliers: [
    {
      id: "SUP001",
      name: "Paper Mills Pvt Ltd",
      email: "info@papermills.com",
      phone: "+91 9876543210",
      gstNumber: "27AAAAA0000A1Z5",
      productType: "Corrugated Sheets",
      state: "Maharashtra",
      address: "123 Industrial Area, Mumbai",
      pinCode: "400001",
      contactPersons: [
        { name: "Rajesh Kumar", phone: "+91 9876543211" },
        { name: "Priya Sharma", phone: "+91 9876543212" }
      ],
      status: "Active",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    },
    {
      id: "SUP002", 
      name: "Adhesive Solutions",
      email: "sales@adhesive.com",
      phone: "+91 9876543213",
      gstNumber: "29BBBBB0000B1Z5",
      productType: "Adhesive & Glue",
      state: "Karnataka",
      address: "456 Chemical Complex, Bangalore",
      pinCode: "560001",
      contactPersons: [
        { name: "Amit Patel", phone: "+91 9876543214" }
      ],
      status: "Active",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    },
    {
      id: "SUP003",
      name: "Wire Industries Ltd",
      email: "contact@wireindustries.com",
      phone: "+91 9876543215",
      gstNumber: "19CCCCC0000C1Z5",
      productType: "Stitching Wire",
      state: "Gujarat",
      address: "789 Wire Street, Ahmedabad",
      pinCode: "380001",
      contactPersons: [
        { name: "Ravi Shah", phone: "+91 9876543216" }
      ],
      status: "Active",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    }
  ],
  loading: false,
  error: null,
};

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    addSupplier: (state, action: PayloadAction<Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>>) => {
      // Check for duplicates
      const duplicate = state.suppliers.find(
        s => s.name.toLowerCase() === action.payload.name.toLowerCase() || 
            s.email.toLowerCase() === action.payload.email.toLowerCase() ||
            s.gstNumber === action.payload.gstNumber
      );
      
      if (duplicate) {
        state.error = 'Supplier with same name, email, or GST number already exists';
        return;
      }

      const newSupplier: Supplier = {
        ...action.payload,
        id: `SUP${String(state.suppliers.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.suppliers.push(newSupplier);
      state.error = null;
    },
    
    updateSupplier: (state, action: PayloadAction<{ id: string; updates: Partial<Supplier> }>) => {
      const index = state.suppliers.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        // Check for duplicates when updating
        if (action.payload.updates.name || action.payload.updates.email || action.payload.updates.gstNumber) {
          const duplicate = state.suppliers.find(
            (s, i) => i !== index && (
              (action.payload.updates.name && s.name.toLowerCase() === action.payload.updates.name.toLowerCase()) ||
              (action.payload.updates.email && s.email.toLowerCase() === action.payload.updates.email.toLowerCase()) ||
              (action.payload.updates.gstNumber && s.gstNumber === action.payload.updates.gstNumber)
            )
          );
          
          if (duplicate) {
            state.error = 'Supplier with same name, email, or GST number already exists';
            return;
          }
        }

        state.suppliers[index] = {
          ...state.suppliers[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
        state.error = null;
      }
    },
    
    deleteSupplier: (state, action: PayloadAction<string>) => {
      state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
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
  addSupplier, 
  updateSupplier, 
  deleteSupplier, 
  setLoading, 
  setError, 
  clearError 
} = suppliersSlice.actions;

export default suppliersSlice.reducer;

// Selectors
export const selectAllSuppliers = (state: any) => state.suppliers.suppliers;
export const selectSupplierById = (state: any, id: string) => 
  state.suppliers.suppliers.find((s: any) => s.id === id);
export const selectSuppliersByProductType = (state: any, productType: string) => 
  state.suppliers.suppliers.filter((s: any) => s.productType === productType);
export const selectActiveSuppliers = (state: any) => 
  state.suppliers.suppliers.filter((s: any) => s.status === 'Active');