import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PricingHeader from "./pricing/PricingHeader";
import CustomerAgreementAlert from "./pricing/CustomerAgreementAlert";
import PricingSummaryCards from "./pricing/PricingSummaryCards";
import PricingAdjustmentTable from "./pricing/PricingAdjustmentTable";

interface PricingAdjustment {
  type: 'quantity_discount' | 'customer_agreement' | 'seasonal_adjustment' | 'loyalty_discount';
  description: string;
  percentage: number;
  amount: number;
  applicable: boolean;
}

interface PricingTierManagerProps {
  clientId: string;
  quantity: number;
  basePrice: number;
  onPricingUpdate: (adjustments: PricingAdjustment[], finalPrice: number) => void;
}

export default function PricingTierManager({ 
  clientId, 
  quantity, 
  basePrice, 
  onPricingUpdate 
}: PricingTierManagerProps) {
  const [pricingAdjustments, setPricingAdjustments] = useState<PricingAdjustment[]>([]);
  
  const customerAgreement = useAppSelector(state => 
    state.quotationManagement?.customerAgreements?.find(a => a.clientId === clientId && a.isActive)
  );
  const seasonalAdjustments = useAppSelector(state => 
    state.quotationManagement?.seasonalAdjustments?.filter(a => a.isActive) || []
  );

  useEffect(() => {
    const adjustments: PricingAdjustment[] = [];

    // Quantity-based discounts
    let quantityDiscount = 0;
    let quantityDiscountDesc = "No quantity discount";
    
    if (customerAgreement) {
      const applicableTier = customerAgreement.pricingTiers
        .filter(tier => quantity >= tier.minQuantity && (!tier.maxQuantity || quantity <= tier.maxQuantity))
        .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
      
      if (applicableTier) {
        quantityDiscount = applicableTier.discountPercentage;
        quantityDiscountDesc = `${applicableTier.description} (${applicableTier.minQuantity.toLocaleString()}${applicableTier.maxQuantity ? '-' + applicableTier.maxQuantity.toLocaleString() : '+'} units)`;
      }
    } else {
      // Standard quantity discounts
      if (quantity >= 10000) {
        quantityDiscount = 15;
        quantityDiscountDesc = "Enterprise Volume (10,000+ units)";
      } else if (quantity >= 5000) {
        quantityDiscount = 10;
        quantityDiscountDesc = "High Volume (5,000-9,999 units)";
      } else if (quantity >= 1000) {
        quantityDiscount = 5;
        quantityDiscountDesc = "Standard Volume (1,000-4,999 units)";
      }
    }

    adjustments.push({
      type: 'quantity_discount',
      description: quantityDiscountDesc,
      percentage: quantityDiscount,
      amount: basePrice * (quantityDiscount / 100),
      applicable: quantityDiscount > 0,
    });

    // Customer agreement special discounts
    if (customerAgreement) {
      customerAgreement.specialDiscounts.forEach(discount => {
        adjustments.push({
          type: 'customer_agreement',
          description: `Special Agreement Discount: ${discount.conditions}`,
          percentage: discount.discountPercentage,
          amount: basePrice * (discount.discountPercentage / 100),
          applicable: true,
        });
      });
    }

    // Seasonal adjustments
    seasonalAdjustments.forEach(seasonal => {
      const amount = seasonal.adjustmentType === 'percentage' 
        ? basePrice * (seasonal.adjustmentValue / 100)
        : seasonal.adjustmentValue;
      
      adjustments.push({
        type: 'seasonal_adjustment',
        description: `${seasonal.name} (${new Date(seasonal.startDate).toLocaleDateString()} - ${new Date(seasonal.endDate).toLocaleDateString()})`,
        percentage: seasonal.adjustmentType === 'percentage' ? seasonal.adjustmentValue : 0,
        amount,
        applicable: true,
      });
    });

    // Loyalty discount (mock - would be based on customer history)
    const isLoyalCustomer = customerAgreement !== undefined; // Simplified logic
    if (isLoyalCustomer) {
      adjustments.push({
        type: 'loyalty_discount',
        description: "Loyal Customer Discount",
        percentage: 2,
        amount: basePrice * 0.02,
        applicable: true,
      });
    }

    setPricingAdjustments(adjustments);
    const netAdjustment = adjustments
      .filter(adj => adj.applicable && adj.type === 'seasonal_adjustment')
      .reduce((sum, adj) => sum + adj.amount, 0) - 
      adjustments
      .filter(adj => adj.applicable && (adj.type === 'quantity_discount' || adj.type === 'customer_agreement' || adj.type === 'loyalty_discount'))
      .reduce((sum, adj) => sum + adj.amount, 0);
    onPricingUpdate(adjustments, basePrice + netAdjustment);
  }, [clientId, quantity, basePrice, customerAgreement, seasonalAdjustments, onPricingUpdate]);

  const totalDiscount = pricingAdjustments
    .filter(adj => adj.applicable && (adj.type === 'quantity_discount' || adj.type === 'customer_agreement' || adj.type === 'loyalty_discount'))
    .reduce((sum, adj) => sum + adj.amount, 0);

  const totalPremium = pricingAdjustments
    .filter(adj => adj.applicable && adj.type === 'seasonal_adjustment')
    .reduce((sum, adj) => sum + adj.amount, 0);

  const netAdjustment = totalPremium - totalDiscount;
  const finalPrice = basePrice + netAdjustment;


  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <PricingHeader finalPrice={finalPrice} netAdjustment={netAdjustment} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customerAgreement && (
          <CustomerAgreementAlert customerAgreement={customerAgreement} />
        )}

        <PricingSummaryCards totalDiscount={totalDiscount} totalPremium={totalPremium} />

        <PricingAdjustmentTable adjustments={pricingAdjustments} />
      </CardContent>
    </Card>
  );
}