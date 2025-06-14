import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Client } from '../types';

interface ClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  clients: [
    {
      id: "CLI001",
      name: "ABC Retail Chain",
      email: "procurement@abcretail.com",
      phone: "+91 9876543220",
      gstNumber: "27ZZZZZ0000Z1Z5",
      address: "456 Commercial Street",
      city: "Mumbai",
      state: "Maharashtra",
      pinCode: "400002",
      contactPersons: [
        { name: "Suresh Gupta", phone: "+91 9876543221" }
      ],
      status: "Active",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    }
  ],
  loading: false,
  error: null,
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    addClient: (state, action: PayloadAction<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>) => {
      // Check for duplicates
      const duplicate = state.clients.find(
        c => c.name.toLowerCase() === action.payload.name.toLowerCase() || 
            c.email.toLowerCase() === action.payload.email.toLowerCase() ||
            c.gstNumber === action.payload.gstNumber
      );
      
      if (duplicate) {
        state.error = 'Client with same name, email, or GST number already exists';
        return;
      }

      const newClient: Client = {
        ...action.payload,
        id: `CLI${String(state.clients.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.clients.push(newClient);
      state.error = null;
    },
    
    updateClient: (state, action: PayloadAction<{ id: string; updates: Partial<Client> }>) => {
      const index = state.clients.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        // Check for duplicates when updating
        if (action.payload.updates.name || action.payload.updates.email || action.payload.updates.gstNumber) {
          const duplicate = state.clients.find(
            (c, i) => i !== index && (
              (action.payload.updates.name && c.name.toLowerCase() === action.payload.updates.name.toLowerCase()) ||
              (action.payload.updates.email && c.email.toLowerCase() === action.payload.updates.email.toLowerCase()) ||
              (action.payload.updates.gstNumber && c.gstNumber === action.payload.updates.gstNumber)
            )
          );
          
          if (duplicate) {
            state.error = 'Client with same name, email, or GST number already exists';
            return;
          }
        }

        state.clients[index] = {
          ...state.clients[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
        state.error = null;
      }
    },
    
    deleteClient: (state, action: PayloadAction<string>) => {
      state.clients = state.clients.filter(c => c.id !== action.payload);
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
  addClient, 
  updateClient, 
  deleteClient, 
  setLoading, 
  setError, 
  clearError 
} = clientsSlice.actions;

export default clientsSlice.reducer;

// Selectors
export const selectAllClients = (state: { clients: ClientsState }) => state.clients.clients;
export const selectClientById = (state: { clients: ClientsState }, id: string) => 
  state.clients.clients.find(c => c.id === id);
export const selectActiveClients = (state: { clients: ClientsState }) => 
  state.clients.clients.filter(c => c.status === 'Active');