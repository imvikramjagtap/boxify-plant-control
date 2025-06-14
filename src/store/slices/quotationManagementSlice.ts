import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface QuotationVersion {
  id: string;
  versionNumber: number;
  quotationId: string;
  costingProjectId: string;
  changes: string[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  previousVersionId?: string;
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface PricingTier {
  minQuantity: number;
  maxQuantity?: number;
  discountPercentage: number;
  fixedPrice?: number;
  description: string;
}

export interface CustomerPricingAgreement {
  id: string;
  clientId: string;
  agreementName: string;
  validFrom: string;
  validTo: string;
  pricingTiers: PricingTier[];
  specialDiscounts: {
    boxTypeId?: string;
    discountPercentage: number;
    conditions: string;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeasonalAdjustment {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  adjustmentType: 'percentage' | 'fixed';
  adjustmentValue: number;
  applicableBoxTypes: string[];
  isActive: boolean;
}

export interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  defaultValues: {
    jwRate: number;
    sheetInwardRate: number;
    boxMakingRate: number;
    printingCostRate: number;
    accessoriesRate: number;
    roiPercentage: number;
    carriageOutward: number;
  };
  applicableBoxTypes: string[];
  createdAt: string;
  updatedAt: string;
}

interface QuotationManagementState {
  versions: QuotationVersion[];
  customerAgreements: CustomerPricingAgreement[];
  seasonalAdjustments: SeasonalAdjustment[];
  templates: QuoteTemplate[];
  loading: boolean;
  error: string | null;
}

const initialState: QuotationManagementState = {
  versions: [],
  customerAgreements: [
    {
      id: "AGR001",
      clientId: "CLI001",
      agreementName: "ABC Retail - Annual Contract",
      validFrom: "2024-01-01",
      validTo: "2024-12-31",
      pricingTiers: [
        { minQuantity: 1000, maxQuantity: 5000, discountPercentage: 5, description: "Standard Volume" },
        { minQuantity: 5001, maxQuantity: 10000, discountPercentage: 10, description: "High Volume" },
        { minQuantity: 10001, discountPercentage: 15, description: "Enterprise Volume" }
      ],
      specialDiscounts: [],
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    }
  ],
  seasonalAdjustments: [
    {
      id: "SEA001",
      name: "Festive Season Premium",
      startDate: "2024-10-01",
      endDate: "2024-11-30",
      adjustmentType: "percentage",
      adjustmentValue: 8,
      applicableBoxTypes: [],
      isActive: true
    }
  ],
  templates: [
    {
      id: "TPL001",
      name: "Standard Box Template",
      description: "Default rates for standard corrugated boxes",
      defaultValues: {
        jwRate: 50,
        sheetInwardRate: 2,
        boxMakingRate: 1.5,
        printingCostRate: 3,
        accessoriesRate: 0.5,
        roiPercentage: 20,
        carriageOutward: 2
      },
      applicableBoxTypes: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    }
  ],
  loading: false,
  error: null,
};

const quotationManagementSlice = createSlice({
  name: 'quotationManagement',
  initialState,
  reducers: {
    addQuotationVersion: (state, action: PayloadAction<Omit<QuotationVersion, 'id' | 'createdAt'>>) => {
      const newVersion: QuotationVersion = {
        ...action.payload,
        id: `VER${String(state.versions.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
      };
      
      // Mark other versions as inactive
      state.versions.forEach(version => {
        if (version.quotationId === newVersion.quotationId) {
          version.isActive = false;
        }
      });
      
      state.versions.push(newVersion);
    },

    approveQuotationVersion: (state, action: PayloadAction<{ id: string; approvedBy: string }>) => {
      const version = state.versions.find(v => v.id === action.payload.id);
      if (version) {
        version.approvalStatus = 'approved';
        version.approvedBy = action.payload.approvedBy;
        version.approvedAt = new Date().toISOString();
      }
    },

    rejectQuotationVersion: (state, action: PayloadAction<{ id: string; rejectionReason: string }>) => {
      const version = state.versions.find(v => v.id === action.payload.id);
      if (version) {
        version.approvalStatus = 'rejected';
        version.rejectionReason = action.payload.rejectionReason;
      }
    },

    addCustomerAgreement: (state, action: PayloadAction<Omit<CustomerPricingAgreement, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newAgreement: CustomerPricingAgreement = {
        ...action.payload,
        id: `AGR${String(state.customerAgreements.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.customerAgreements.push(newAgreement);
    },

    updateCustomerAgreement: (state, action: PayloadAction<{ id: string; updates: Partial<CustomerPricingAgreement> }>) => {
      const index = state.customerAgreements.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.customerAgreements[index] = {
          ...state.customerAgreements[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    addSeasonalAdjustment: (state, action: PayloadAction<Omit<SeasonalAdjustment, 'id'>>) => {
      const newAdjustment: SeasonalAdjustment = {
        ...action.payload,
        id: `SEA${String(state.seasonalAdjustments.length + 1).padStart(3, '0')}`,
      };
      state.seasonalAdjustments.push(newAdjustment);
    },

    addQuoteTemplate: (state, action: PayloadAction<Omit<QuoteTemplate, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newTemplate: QuoteTemplate = {
        ...action.payload,
        id: `TPL${String(state.templates.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.templates.push(newTemplate);
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
  addQuotationVersion,
  approveQuotationVersion,
  rejectQuotationVersion,
  addCustomerAgreement,
  updateCustomerAgreement,
  addSeasonalAdjustment,
  addQuoteTemplate,
  setLoading,
  setError,
} = quotationManagementSlice.actions;

export default quotationManagementSlice.reducer;

// Selectors
export const selectQuotationVersionsByQuotationId = (state: { quotationManagement: QuotationManagementState }, quotationId: string) =>
  state.quotationManagement.versions.filter(v => v.quotationId === quotationId);

export const selectActiveQuotationVersion = (state: { quotationManagement: QuotationManagementState }, quotationId: string) =>
  state.quotationManagement.versions.find(v => v.quotationId === quotationId && v.isActive);

export const selectCustomerAgreementByClientId = (state: { quotationManagement: QuotationManagementState }, clientId: string) =>
  state.quotationManagement.customerAgreements.find(a => a.clientId === clientId && a.isActive);

export const selectActiveSeasonalAdjustments = (state: { quotationManagement: QuotationManagementState }) =>
  state.quotationManagement.seasonalAdjustments.filter(a => a.isActive);

export const selectQuoteTemplates = (state: { quotationManagement: QuotationManagementState }) =>
  state.quotationManagement.templates;