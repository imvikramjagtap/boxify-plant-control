import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RawMaterial, PriceHistory, SupplierMaterial } from '../types';

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
      suppliers: [
        {
          supplierId: "SUP001",
          supplierName: "Paper Mills Pvt Ltd",
          isPrimary: true,
          unitPrice: 45.50,
          leadTimeDays: 7,
          minimumOrderQuantity: 100,
          qualityScore: 92,
          deliveryPerformance: 88,
          priceStability: 85,
          lastSuppliedDate: "2024-06-10",
          isActive: true
        }
      ],
      batchNumber: "B2024001",
      manufacturingDate: "2024-06-01",
      receivedDate: "2024-06-10",
      status: "In Stock",
      priceHistory: [
        { price: 45.50, date: "2024-06-10", source: "po", poId: "PO-2024-001" },
        { price: 44.00, date: "2024-05-10", source: "po", poId: "PO-2024-005" }
      ],
      riskLevel: "High",
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
      suppliers: [
        {
          supplierId: "SUP002",
          supplierName: "Adhesive Solutions",
          isPrimary: true,
          unitPrice: 85.00,
          leadTimeDays: 5,
          minimumOrderQuantity: 50,
          qualityScore: 95,
          deliveryPerformance: 92,
          priceStability: 78,
          lastSuppliedDate: "2024-06-05",
          isActive: true
        }
      ],
      batchNumber: "ADH2024005",
      manufacturingDate: "2024-05-15",
      receivedDate: "2024-06-05",
      status: "Low Stock",
      priceHistory: [
        { price: 85.00, date: "2024-06-05", source: "po", poId: "PO-2024-002" }
      ],
      riskLevel: "High",
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
      suppliers: [
        {
          supplierId: "SUP003",
          supplierName: "Wire Industries Ltd",
          isPrimary: true,
          unitPrice: 125.00,
          leadTimeDays: 10,
          minimumOrderQuantity: 20,
          qualityScore: 87,
          deliveryPerformance: 95,
          priceStability: 90,
          lastSuppliedDate: "2024-06-08",
          isActive: true
        }
      ],
      batchNumber: "WIRE2024003",
      manufacturingDate: "2024-05-20",
      receivedDate: "2024-06-08",
      status: "In Stock",
      priceHistory: [
        { price: 125.00, date: "2024-06-08", source: "po", poId: "PO-2024-003" }
      ],
      riskLevel: "High",
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
    
    addSupplierToMaterial: (state, action: PayloadAction<{ materialId: string; supplier: SupplierMaterial }>) => {
      const index = state.materials.findIndex(m => m.id === action.payload.materialId);
      if (index !== -1) {
        // Check if supplier already exists
        const existingSupplierIndex = state.materials[index].suppliers.findIndex(
          s => s.supplierId === action.payload.supplier.supplierId
        );
        
        if (existingSupplierIndex === -1) {
          state.materials[index].suppliers.push(action.payload.supplier);
          
          // Recalculate risk level
          const supplierCount = state.materials[index].suppliers.length;
          let riskLevel: "Low" | "Medium" | "High" = "Low";
          if (supplierCount === 1) riskLevel = "High";
          else if (supplierCount === 2) riskLevel = "Medium";
          
          state.materials[index].riskLevel = riskLevel;
          state.materials[index].updatedAt = new Date().toISOString();
        }
      }
    },
    
    updateSupplierInMaterial: (state, action: PayloadAction<{ materialId: string; supplierId: string; updates: Partial<SupplierMaterial> }>) => {
      const materialIndex = state.materials.findIndex(m => m.id === action.payload.materialId);
      if (materialIndex !== -1) {
        const supplierIndex = state.materials[materialIndex].suppliers.findIndex(
          s => s.supplierId === action.payload.supplierId
        );
        
        if (supplierIndex !== -1) {
          state.materials[materialIndex].suppliers[supplierIndex] = {
            ...state.materials[materialIndex].suppliers[supplierIndex],
            ...action.payload.updates
          };
          state.materials[materialIndex].updatedAt = new Date().toISOString();
        }
      }
    },
    
    removeSupplierFromMaterial: (state, action: PayloadAction<{ materialId: string; supplierId: string }>) => {
      const materialIndex = state.materials.findIndex(m => m.id === action.payload.materialId);
      if (materialIndex !== -1) {
        const material = state.materials[materialIndex];
        
        // Don't allow removing the last supplier
        if (material.suppliers.length <= 1) {
          state.error = "Cannot remove the last supplier from a material";
          return;
        }
        
        const wasRemovedPrimary = material.suppliers.find(
          s => s.supplierId === action.payload.supplierId
        )?.isPrimary;
        
        material.suppliers = material.suppliers.filter(
          s => s.supplierId !== action.payload.supplierId
        );
        
        // If primary supplier was removed, make the first remaining supplier primary
        if (wasRemovedPrimary && material.suppliers.length > 0) {
          material.suppliers[0].isPrimary = true;
          material.unitPrice = material.suppliers[0].unitPrice;
        }
        
        // Recalculate risk level
        const supplierCount = material.suppliers.length;
        let riskLevel: "Low" | "Medium" | "High" = "Low";
        if (supplierCount === 1) riskLevel = "High";
        else if (supplierCount === 2) riskLevel = "Medium";
        
        material.riskLevel = riskLevel;
        material.updatedAt = new Date().toISOString();
      }
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
  clearError,
  addSupplierToMaterial,
  updateSupplierInMaterial,
  removeSupplierFromMaterial
} = rawMaterialsSlice.actions;

export default rawMaterialsSlice.reducer;

// Selectors
export const selectAllMaterials = (state: { rawMaterials: RawMaterialsState }) => state.rawMaterials.materials;
export const selectMaterialById = (state: { rawMaterials: RawMaterialsState }, id: string) => 
  state.rawMaterials.materials.find(m => m.id === id);
export const selectMaterialsBySupplierId = (state: { rawMaterials: RawMaterialsState }, supplierId: string) => 
  state.rawMaterials.materials.filter(m => m.suppliers.some(s => s.supplierId === supplierId));
export const selectLowStockMaterials = (state: { rawMaterials: RawMaterialsState }) => 
  state.rawMaterials.materials.filter(m => m.status === 'Low Stock' || m.status === 'Out of Stock');
export const selectMaterialsByProductType = (state: { rawMaterials: RawMaterialsState }, productType: string) => 
  state.rawMaterials.materials.filter(m => m.productType === productType);