import { CostCalculation } from '@/store/types';
import { PricingTier, CustomerPricingAgreement, SeasonalAdjustment } from '@/store/slices/quotationManagementSlice';

export interface MaterialCostData {
  materialId: string;
  currentPrice: number;
  priceDate: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  volatility: number; // 0-100
}

export interface AdvancedPricingInput {
  baseCostCalculation: CostCalculation;
  quantity: number;
  clientId: string;
  boxTypeId: string;
  materialCosts: MaterialCostData[];
  customerAgreement?: CustomerPricingAgreement;
  seasonalAdjustments: SeasonalAdjustment[];
  competitiveFactors?: {
    marketPremium: number; // percentage
    urgencyFactor: number; // percentage for rush orders
    loyaltyDiscount: number; // percentage for loyal customers
  };
}

export interface AdvancedPricingOutput {
  originalPrice: number;
  adjustedPrice: number;
  discounts: {
    quantityDiscount: number;
    customerAgreementDiscount: number;
    loyaltyDiscount: number;
    totalDiscount: number;
  };
  premiums: {
    seasonalPremium: number;
    marketPremium: number;
    urgencyPremium: number;
    totalPremium: number;
  };
  materialCostAdjustment: number;
  finalPrice: number;
  pricePerUnit: number;
  breakdown: {
    baseCost: number;
    materialAdjustment: number;
    afterDiscounts: number;
    afterPremiums: number;
    final: number;
  };
  recommendedValidityDays: number;
  escalationClause?: string;
}

export function calculateAdvancedPricing(input: AdvancedPricingInput): AdvancedPricingOutput {
  const { baseCostCalculation, quantity, customerAgreement, seasonalAdjustments, competitiveFactors, materialCosts } = input;
  
  const originalPrice = baseCostCalculation.totalPrice;
  let adjustedPrice = originalPrice;

  // Material cost adjustment based on recent price changes
  let materialCostAdjustment = 0;
  materialCosts.forEach(material => {
    if (material.trend === 'increasing') {
      materialCostAdjustment += originalPrice * (material.volatility / 100) * 0.1; // 10% of volatility impact
    } else if (material.trend === 'decreasing') {
      materialCostAdjustment -= originalPrice * (material.volatility / 100) * 0.05; // 5% benefit from decrease
    }
  });

  adjustedPrice += materialCostAdjustment;

  // Calculate quantity-based discounts
  let quantityDiscount = 0;
  if (customerAgreement) {
    const applicableTier = customerAgreement.pricingTiers
      .filter(tier => quantity >= tier.minQuantity && (!tier.maxQuantity || quantity <= tier.maxQuantity))
      .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
    
    if (applicableTier) {
      quantityDiscount = adjustedPrice * (applicableTier.discountPercentage / 100);
    }
  } else {
    // Standard quantity discounts if no customer agreement
    if (quantity >= 10000) quantityDiscount = adjustedPrice * 0.15;
    else if (quantity >= 5000) quantityDiscount = adjustedPrice * 0.10;
    else if (quantity >= 1000) quantityDiscount = adjustedPrice * 0.05;
  }

  // Customer agreement special discounts
  let customerAgreementDiscount = 0;
  if (customerAgreement) {
    customerAgreement.specialDiscounts.forEach(discount => {
      if (!discount.boxTypeId || discount.boxTypeId === input.boxTypeId) {
        customerAgreementDiscount += adjustedPrice * (discount.discountPercentage / 100);
      }
    });
  }

  // Loyalty discount
  const loyaltyDiscount = competitiveFactors?.loyaltyDiscount 
    ? adjustedPrice * (competitiveFactors.loyaltyDiscount / 100) 
    : 0;

  const totalDiscount = quantityDiscount + customerAgreementDiscount + loyaltyDiscount;

  // Apply discounts
  const afterDiscounts = adjustedPrice - totalDiscount;

  // Calculate seasonal premiums
  let seasonalPremium = 0;
  const currentDate = new Date();
  seasonalAdjustments.forEach(adjustment => {
    if (adjustment.isActive && 
        new Date(adjustment.startDate) <= currentDate && 
        new Date(adjustment.endDate) >= currentDate) {
      if (adjustment.adjustmentType === 'percentage') {
        seasonalPremium += afterDiscounts * (adjustment.adjustmentValue / 100);
      } else {
        seasonalPremium += adjustment.adjustmentValue;
      }
    }
  });

  // Market premium
  const marketPremium = competitiveFactors?.marketPremium 
    ? afterDiscounts * (competitiveFactors.marketPremium / 100) 
    : 0;

  // Urgency premium for rush orders
  const urgencyPremium = competitiveFactors?.urgencyFactor 
    ? afterDiscounts * (competitiveFactors.urgencyFactor / 100) 
    : 0;

  const totalPremium = seasonalPremium + marketPremium + urgencyPremium;

  // Final calculations
  const finalPrice = afterDiscounts + totalPremium;
  const pricePerUnit = finalPrice / quantity;

  // Determine recommended validity based on material volatility
  const avgVolatility = materialCosts.reduce((sum, m) => sum + m.volatility, 0) / materialCosts.length;
  const recommendedValidityDays = avgVolatility > 70 ? 15 : avgVolatility > 40 ? 30 : 45;

  // Generate escalation clause for volatile materials
  let escalationClause: string | undefined;
  if (avgVolatility > 50) {
    escalationClause = `Material prices subject to adjustment if raw material costs increase by more than 10% during the validity period.`;
  }

  return {
    originalPrice,
    adjustedPrice,
    discounts: {
      quantityDiscount,
      customerAgreementDiscount,
      loyaltyDiscount,
      totalDiscount,
    },
    premiums: {
      seasonalPremium,
      marketPremium,
      urgencyPremium,
      totalPremium,
    },
    materialCostAdjustment,
    finalPrice,
    pricePerUnit,
    breakdown: {
      baseCost: originalPrice,
      materialAdjustment: materialCostAdjustment,
      afterDiscounts,
      afterPremiums: finalPrice,
      final: finalPrice,
    },
    recommendedValidityDays,
    escalationClause,
  };
}

export function generateCompetitiveAnalysis(
  ourPrice: number,
  marketData: { competitorName: string; estimatedPrice: number; marketShare: number }[]
): {
  positionInMarket: 'lowest' | 'competitive' | 'premium' | 'highest';
  priceAdvantage: number; // percentage difference from market average
  recommendations: string[];
} {
  const marketAvg = marketData.reduce((sum, comp) => sum + comp.estimatedPrice, 0) / marketData.length;
  const priceAdvantage = ((marketAvg - ourPrice) / marketAvg) * 100;
  
  let positionInMarket: 'lowest' | 'competitive' | 'premium' | 'highest';
  const recommendations: string[] = [];

  if (ourPrice <= Math.min(...marketData.map(c => c.estimatedPrice))) {
    positionInMarket = 'lowest';
    recommendations.push('Consider slight price increase to improve margins while maintaining competitiveness');
  } else if (ourPrice <= marketAvg * 1.05) {
    positionInMarket = 'competitive';
    recommendations.push('Pricing is well-positioned for market competition');
  } else if (ourPrice <= marketAvg * 1.15) {
    positionInMarket = 'premium';
    recommendations.push('Ensure value proposition justifies premium pricing');
    recommendations.push('Highlight quality and service advantages');
  } else {
    positionInMarket = 'highest';
    recommendations.push('Consider price reduction or enhanced value proposition');
    recommendations.push('Review cost structure for optimization opportunities');
  }

  return {
    positionInMarket,
    priceAdvantage,
    recommendations,
  };
}