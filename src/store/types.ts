// Shared types for Redux store

export interface ContactPerson {
  name: string;
  phone: string;
}

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
  contactPersons: ContactPerson[];
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  gstNumber: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  contactPersons: ContactPerson[];
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
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
  priceHistory: PriceHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistory {
  price: number;
  date: string;
  source: string; // 'manual' | 'po'
  poId?: string;
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
  createdAt: string;
  updatedAt: string;
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
  createdBy: string;
}

export interface BoxMaster {
  id: string;
  name: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  materials: Array<{
    materialId: string;
    quantity: number;
    unit: string;
  }>;
  estimatedCost: number;
  category: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CostingProject {
  id: string;
  name: string;
  clientId: string;
  boxId: string;
  quantity: number;
  materialCosts: Array<{
    materialId: string;
    quantity: number;
    rate: number;
    total: number;
  }>;
  laborCost: number;
  overheadCost: number;
  profitMargin: number;
  totalCost: number;
  quotedPrice: number;
  status: "draft" | "quoted" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}