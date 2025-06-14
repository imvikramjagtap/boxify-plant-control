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
  productType: string;
  industryType: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  contactPersons: ContactPerson[];
  associatedItems: string[];
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
}

export interface SupplierMaterial {
  supplierId: string;
  supplierName: string;
  isPrimary: boolean;
  unitPrice: number;
  leadTimeDays: number;
  minimumOrderQuantity: number;
  qualityScore: number; // 0-100
  deliveryPerformance: number; // 0-100 (on-time delivery %)
  priceStability: number; // 0-100
  lastSuppliedDate?: string;
  contractValidTill?: string;
  isActive: boolean;
}

export interface RawMaterial {
  id: string;
  name: string;
  productType: string;
  specifications: Record<string, string>;
  unit: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number; // Current/average price
  suppliers: SupplierMaterial[]; // Multiple suppliers
  batchNumber: string;
  manufacturingDate: string;
  receivedDate: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  priceHistory: PriceHistory[];
  riskLevel: "Low" | "Medium" | "High"; // Based on supplier concentration
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistory {
  price: number;
  date: string;
  source: string; // 'manual' | 'po'
  poId?: string;
}

export interface MaterialSpecifications {
  gsm?: number;
  bf?: number; // Burst Factor
  ect?: number; // Edge Crush Test
  fluteType?: string;
  grade?: string;
  thickness?: number;
  moistureContent?: number;
  qualityTolerance?: {
    gsm?: { min: number; max: number };
    bf?: { min: number; max: number };
    ect?: { min: number; max: number };
    thickness?: { min: number; max: number };
    moistureContent?: { max: number };
  };
  inspectionCriteria?: string[];
}

export interface POItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  rate: number;
  total: number;
  unit: string;
  specifications?: MaterialSpecifications;
  hsnCode?: string;
  gstRate?: number;
  gstAmount?: number;
  deliveryStatus?: "pending" | "partial" | "completed";
  deliveredQuantity?: number;
  qualityAccepted?: boolean;
  grnNumber?: string;
  inspectionNotes?: string;
}

export interface TaxCalculation {
  subtotal: number;
  gstAmount: number;
  tdsAmount?: number;
  tdsRate?: number;
  totalAfterTax: number;
}

export interface PaymentTerms {
  paymentMethod: "cash" | "cheque" | "neft" | "rtgs" | "online";
  creditDays: number;
  advancePercentage?: number;
  penaltyClause?: string;
}

export interface DeliveryDetails {
  deliveryAddress: string;
  contactPerson: string;
  contactPhone: string;
  specialInstructions?: string;
  partialDeliveryAllowed: boolean;
  deliverySchedule?: Array<{
    expectedDate: string;
    quantity: number;
    items: string[];
  }>;
}

export interface PurchaseOrder {
  id: string;
  supplier: Supplier;
  date: string;
  expectedDelivery: string;
  status: "draft" | "pending" | "approved" | "sent" | "acknowledged" | "delivered" | "rejected" | "cancelled";
  totalAmount: number;
  currency: string;
  items: POItem[];
  requestedBy: string;
  approvedBy: string | null;
  terms: string;
  notes: string;
  taxCalculation: TaxCalculation;
  paymentTerms: PaymentTerms;
  deliveryDetails: DeliveryDetails;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  emailSent?: boolean;
  emailSentAt?: string;
  printedAt?: string;
  revision?: number;
  originalPOId?: string;
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