// Shared data service for managing suppliers, materials and POs across the app
export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  gstNumber: string;
  productType: string;
  state: string;
  address: string;
  pinCode: string;
  contactPersons: Array<{ name: string; phone: string }>;
  status: "Active" | "Inactive";
}

export interface RawMaterial {
  id: string;
  name: string;
  productType: string;
  specifications: Record<string, string>;
  unit: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number;
  supplierId: string;
  supplierName: string;
  batchNumber: string;
  manufacturingDate: string;
  receivedDate: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface PurchaseOrder {
  id: string;
  supplier: Supplier;
  date: Date;
  expectedDelivery: Date;
  status: "draft" | "pending" | "approved" | "sent" | "acknowledged" | "delivered" | "rejected" | "cancelled";
  totalAmount: number;
  currency: string;
  items: POItem[];
  requestedBy: string;
  approvedBy: string | null;
  terms: string;
  notes: string;
}

export interface POItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  rate: number;
  total: number;
  unit: string;
}

export interface StockMovement {
  id: string;
  materialId: string;
  type: "IN" | "OUT";
  quantity: number;
  reason: string;
  jobId?: string;
  poNumber?: string;
  date: string;
  notes: string;
}

// Mock data - in real app this would come from database
let suppliers: Supplier[] = [
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
    status: "Active"
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
    status: "Active"
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
    status: "Active"
  }
];

let rawMaterials: RawMaterial[] = [
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
    status: "In Stock"
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
    status: "Low Stock"
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
    status: "In Stock"
  }
];

let purchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-2024-001",
    supplier: suppliers[0],
    date: new Date("2024-01-15"),
    expectedDelivery: new Date("2024-01-25"),
    status: "approved",
    totalAmount: 25000.00,
    currency: "INR",
    items: [
      {
        id: "POI001",
        materialId: "RM001",
        materialName: "5-Ply Corrugated Sheet - Brown",
        quantity: 500,
        rate: 45.50,
        total: 22750.00,
        unit: "Pieces"
      }
    ],
    requestedBy: "John Doe",
    approvedBy: "Jane Smith",
    terms: "Net 30 days payment terms",
    notes: "Urgent requirement for Q1 production"
  },
  {
    id: "PO-2024-002",
    supplier: suppliers[1],
    date: new Date("2024-01-10"),
    expectedDelivery: new Date("2024-01-20"),
    status: "pending",
    totalAmount: 18500.00,
    currency: "INR",
    items: [
      {
        id: "POI002",
        materialId: "RM002",
        materialName: "White PVA Adhesive",
        quantity: 200,
        rate: 85.00,
        total: 17000.00,
        unit: "KG"
      }
    ],
    requestedBy: "Mike Johnson",
    approvedBy: null,
    terms: "Net 15 days payment terms",
    notes: "Quality check required upon delivery"
  }
];

let stockMovements: StockMovement[] = [
  {
    id: "SM001",
    materialId: "RM001",
    type: "IN",
    quantity: 1000,
    reason: "Purchase Order",
    poNumber: "PO-2024-001",
    date: "2024-06-10",
    notes: "Fresh stock from Paper Mills"
  },
  {
    id: "SM002",
    materialId: "RM001",
    type: "OUT",
    quantity: 250,
    reason: "Production Consumption",
    jobId: "JOB001",
    date: "2024-06-12",
    notes: "Used for ABC Industries order"
  }
];

// Suppliers API
export const supplierService = {
  getAll: () => suppliers,
  getById: (id: string) => suppliers.find(s => s.id === id),
  getByProductType: (productType: string) => suppliers.filter(s => s.productType === productType),
  add: (supplier: Omit<Supplier, "id">) => {
    const newSupplier = { ...supplier, id: `SUP${String(suppliers.length + 1).padStart(3, '0')}` };
    suppliers.push(newSupplier);
    return newSupplier;
  },
  update: (id: string, updates: Partial<Supplier>) => {
    const index = suppliers.findIndex(s => s.id === id);
    if (index !== -1) {
      suppliers[index] = { ...suppliers[index], ...updates };
      return suppliers[index];
    }
    return null;
  }
};

// Raw Materials API
export const materialService = {
  getAll: () => rawMaterials,
  getById: (id: string) => rawMaterials.find(m => m.id === id),
  getBySupplierId: (supplierId: string) => rawMaterials.filter(m => m.supplierId === supplierId),
  add: (material: Omit<RawMaterial, "id">) => {
    const newMaterial = { ...material, id: `RM${String(rawMaterials.length + 1).padStart(3, '0')}` };
    rawMaterials.push(newMaterial);
    return newMaterial;
  },
  update: (id: string, updates: Partial<RawMaterial>) => {
    const index = rawMaterials.findIndex(m => m.id === id);
    if (index !== -1) {
      rawMaterials[index] = { ...rawMaterials[index], ...updates };
      return rawMaterials[index];
    }
    return null;
  },
  updateStock: (id: string, quantity: number, type: "IN" | "OUT") => {
    const material = rawMaterials.find(m => m.id === id);
    if (material) {
      const newStock = type === "IN" 
        ? material.currentStock + quantity 
        : Math.max(0, material.currentStock - quantity);
      
      let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
      if (newStock === 0) {
        status = "Out of Stock";
      } else if (newStock <= material.minimumStock) {
        status = "Low Stock";
      }
      
      return materialService.update(id, { currentStock: newStock, status });
    }
    return null;
  }
};

// Purchase Orders API
export const purchaseOrderService = {
  getAll: () => purchaseOrders,
  getById: (id: string) => purchaseOrders.find(po => po.id === id),
  getPending: () => purchaseOrders.filter(po => po.status === "pending"),
  add: (po: Omit<PurchaseOrder, "id">) => {
    const newPO = { ...po, id: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}` };
    purchaseOrders.push(newPO);
    return newPO;
  },
  update: (id: string, updates: Partial<PurchaseOrder>) => {
    const index = purchaseOrders.findIndex(po => po.id === id);
    if (index !== -1) {
      purchaseOrders[index] = { ...purchaseOrders[index], ...updates };
      
      // If PO is delivered, update stock for all items
      if (updates.status === "delivered" && purchaseOrders[index].status === "delivered") {
        purchaseOrders[index].items.forEach(item => {
          materialService.updateStock(item.materialId, item.quantity, "IN");
          
          // Add stock movement record
          const movement: StockMovement = {
            id: `SM${String(stockMovements.length + 1).padStart(3, '0')}`,
            materialId: item.materialId,
            type: "IN",
            quantity: item.quantity,
            reason: "Purchase Order Delivery",
            poNumber: id,
            date: new Date().toISOString().split('T')[0],
            notes: `Delivered from ${purchaseOrders[index].supplier.name}`
          };
          stockMovements.push(movement);
        });
      }
      
      return purchaseOrders[index];
    }
    return null;
  },
  approve: (id: string, approvedBy: string) => {
    return purchaseOrderService.update(id, { status: "approved", approvedBy });
  },
  reject: (id: string) => {
    return purchaseOrderService.update(id, { status: "rejected" });
  }
};

// Stock Movements API
export const stockMovementService = {
  getAll: () => stockMovements,
  getByMaterialId: (materialId: string) => stockMovements.filter(sm => sm.materialId === materialId),
  add: (movement: Omit<StockMovement, "id">) => {
    const newMovement = { ...movement, id: `SM${String(stockMovements.length + 1).padStart(3, '0')}` };
    stockMovements.push(newMovement);
    
    // Update material stock
    materialService.updateStock(movement.materialId, movement.quantity, movement.type);
    
    return newMovement;
  }
};