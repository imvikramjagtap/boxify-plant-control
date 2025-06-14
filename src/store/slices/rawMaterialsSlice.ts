import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RawMaterial, PriceHistory } from '../types';

interface RawMaterialsState {
  materials: RawMaterial[];
  loading: boolean;
  error: string | null;
}

const initialState: RawMaterialsState = {
  materials: [
    {
      id: "RM001",
      name: "5-Ply Corrugated Sheet - Brown",
      productType: "Corrugated Sheets",
      specifications: {
        grade: "5-Ply",
        thickness: "5mm",
        dimensions: "48x36 inches",
        color: "Brown"
      },
      unit: "Pieces",
      currentStock: 2500,
      minimumStock: 500,
      unitPrice: 45.50,
      supplierId: "SUP001",
      supplierName: "Paper Mills Pvt Ltd",
      batchNumber: "B2024001",
      manufacturingDate: "2024-06-01",
      receivedDate: "2024-06-10",
      status: "In Stock",
      priceHistory: [
        { price: 45.50, date: "2024-06-10", source: "po", poId: "PO-2024-001" },
        { price: 44.00, date: "2024-05-10", source: "po", poId: "PO-2024-005" }
      ],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-06-10T00:00:00Z"
    },
    {
      id: "RM002",
      name: "White PVA Adhesive",
      productType: "Adhesive & Glue",
      specifications: {
        grade: "Industrial Grade",
        viscosity: "High",
        color: "White"
      },
      unit: "KG",
      currentStock: 150,
      minimumStock: 200,
      unitPrice: 85.00,
      supplierId: "SUP002",
      supplierName: "Adhesive Solutions",
      batchNumber: "ADH2024005",
      manufacturingDate: "2024-05-15",
      receivedDate: "2024-06-05",
      status: "Low Stock",
      priceHistory: [
        { price: 85.00, date: "2024-06-05", source: "po", poId: "PO-2024-002" }
      ],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-06-05T00:00:00Z"
    },
    {
      id: "RM003",
      name: "Galvanized Stitching Wire",
      productType: "Stitching Wire",
      specifications: {
        gauge: "20 AWG",
        finish: "Galvanized",
        length: "1000m"
      },
      unit: "Rolls",
      currentStock: 75,
      minimumStock: 20,
      unitPrice: 125.00,
      supplierId: "SUP003",
      supplierName: "Wire Industries Ltd",
      batchNumber: "WIRE2024003",
      manufacturingDate: "2024-05-20",
      receivedDate: "2024-06-08",
      status: "In Stock",
      priceHistory: [
        { price: 125.00, date: "2024-06-08", source: "po", poId: "PO-2024-003" }
      ],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-06-08T00:00:00Z"
    }
  ],
  loading: false,
  error: null,
};

const rawMaterialsSlice = createSlice({
  name: 'rawMaterials',
  initialState,
  reducers: {
    addMaterial: (state, action: PayloadAction<Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt' | 'priceHistory'>>) => {
      const newMaterial: RawMaterial = {
        ...action.payload,
        id: `RM${String(state.materials.length + 1).padStart(3, '0')}`,
        priceHistory: [
          { 
            price: action.payload.unitPrice, 
            date: new Date().toISOString().split('T')[0], 
            source: 'manual' 
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.materials.push(newMaterial);
    },
    
    updateMaterial: (state, action: PayloadAction<{ id: string; updates: Partial<RawMaterial> }>) => {
      const index = state.materials.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        const material = state.materials[index];
        
        // If price is being updated, add to price history
        if (action.payload.updates.unitPrice && action.payload.updates.unitPrice !== material.unitPrice) {
          const newPriceEntry: PriceHistory = {
            price: action.payload.updates.unitPrice,
            date: new Date().toISOString().split('T')[0],
            source: 'manual'
          };
          action.payload.updates.priceHistory = [...material.priceHistory, newPriceEntry];
        }

        state.materials[index] = {
          ...material,
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    updateStock: (state, action: PayloadAction<{ id: string; quantity: number; type: 'IN' | 'OUT'; poId?: string }>) => {
      const index = state.materials.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        const material = state.materials[index];
        const newStock = action.payload.type === 'IN' 
          ? material.currentStock + action.payload.quantity
          : Math.max(0, material.currentStock - action.payload.quantity);
        
        let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
        if (newStock === 0) {
          status = "Out of Stock";
        } else if (newStock <= material.minimumStock) {
          status = "Low Stock";
        }
        
        state.materials[index] = {
          ...material,
          currentStock: newStock,
          status,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    updatePriceFromPO: (state, action: PayloadAction<{ materialId: string; price: number; poId: string }>) => {
      const index = state.materials.findIndex(m => m.id === action.payload.materialId);
      if (index !== -1) {
        const material = state.materials[index];
        const newPriceEntry: PriceHistory = {
          price: action.payload.price,
          date: new Date().toISOString().split('T')[0],
          source: 'po',
          poId: action.payload.poId
        };
        
        state.materials[index] = {
          ...material,
          unitPrice: action.payload.price,
          priceHistory: [...material.priceHistory, newPriceEntry],
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    deleteMaterial: (state, action: PayloadAction<string>) => {
      state.materials = state.materials.filter(m => m.id !== action.payload);
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
  addMaterial, 
  updateMaterial, 
  updateStock, 
  updatePriceFromPO,
  deleteMaterial, 
  setLoading, 
  setError, 
  clearError 
} = rawMaterialsSlice.actions;

export default rawMaterialsSlice.reducer;

// Selectors
export const selectAllMaterials = (state: { rawMaterials: RawMaterialsState }) => state.rawMaterials.materials;
export const selectMaterialById = (state: { rawMaterials: RawMaterialsState }, id: string) => 
  state.rawMaterials.materials.find(m => m.id === id);
export const selectMaterialsBySupplierId = (state: { rawMaterials: RawMaterialsState }, supplierId: string) => 
  state.rawMaterials.materials.filter(m => m.supplierId === supplierId);
export const selectLowStockMaterials = (state: { rawMaterials: RawMaterialsState }) => 
  state.rawMaterials.materials.filter(m => m.status === 'Low Stock' || m.status === 'Out of Stock');
export const selectMaterialsByProductType = (state: { rawMaterials: RawMaterialsState }, productType: string) => 
  state.rawMaterials.materials.filter(m => m.productType === productType);