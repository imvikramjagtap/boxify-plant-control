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
  hsnCode?: string;
  gstRate?: number;
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

// Costing & Quotation Types
export interface RateConfiguration {
  id: string;
  name: string;
  jwRate: number;
  sheetInwardRate: number;
  boxMakingRate: number;
  printingCostRate: number;
  accessoriesRate: number;
  carriageOutward: number;
  isDefault: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CostCalculation {
  totalBoxWeightKg: number;
  jwCharges: number;
  sheetInwardCost: number;
  boxMakingCost: number;
  printingCost: number;
  accessoriesCost: number;
  mfgCostPerBox: number;
  roiAmount: number;
  totalCostPerBox: number;
  totalPrice: number;
}

export interface QuotationDetails {
  quotationId: string;
  quotationDate: string;
  finalSalePrice?: number;
  rateFinalisedDate?: string;
  validityDays: number;
  paymentTerms: string;
  deliveryTerms: string;
  notes?: string;
}

export interface CostingProject {
  id: string;
  quotationId: string;
  name: string;
  clientId: string;
  boxId: string;
  quantity: number;
  // Rate configuration
  jwRate: number;
  sheetInwardRate: number;
  boxMakingRate: number;
  printingCostRate: number;
  accessoriesRate: number;
  roiPercentage: number;
  carriageOutward: number;
  // Box details (cached from box master)
  boxName: string;
  totalBoxWeight: number;
  // Calculated costs
  calculations: CostCalculation;
  quotationDetails: QuotationDetails;
  status: "draft" | "quoted" | "approved" | "rejected" | "converted";
  createdAt: string;
  updatedAt: string;
}

export interface GodownLocation {
  id: string;
  name: string;
  address: string;
  state?: string;
  pinCode?: string;
  gstNumber?: string;
  type: "inbound" | "outbound" | "production" | "scrap" | "job_worker";
  capacity?: number;
  currentUsage?: number;
  contactPerson?: string;
  phone?: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
}

export interface JobWorker {
  id: string;
  name: string;
  address: string;
  phone: string;
  gstNumber: string;
  specialization: string[];
  ratePerUnit: number;
  rating: number; // 1-5
  status: "Active" | "Inactive";
  activeJobCards: number;
  createdAt: string;
  updatedAt: string;
}

export interface InwardItem {
  id: string;
  materialId: string;
  materialName: string;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  rejectionReason?: string;
  unit: string;
  rate: number;
}

export interface PurchaseInward {
  id: string;
  poId: string;
  supplierId: string;
  supplierName: string;
  receivedDate: string;
  items: InwardItem[];
  grnNumber: string;
  vehicleNumber?: string;
  invoiceNumber?: string;
  invoiceAmount?: number;
  qualityCheckStatus: 'pending' | 'partially_checked' | 'completed';
  receivedBy: string;
  notes?: string;
  status: 'draft' | 'submitted' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface JobCard {
  id: string;
  jobWorkerId: string;
  jobWorkerName: string;
  orderId?: string;
  issueDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: 'draft' | 'issued' | 'received' | 'partially_received' | 'closed' | 'cancelled';
  items: {
    id: string;
    boxId: string;
    boxName: string;
    quantity: number;
    receivedQuantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  materialsIssued: {
    materialId: string;
    materialName: string;
    quantity: number;
    unit: string;
  }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}