import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectCustomerAgreementByClientId, selectActiveSeasonalAdjustments } from "@/store/slices/quotationManagementSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Calendar, Percent } from "lucide-react";

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
  onPricingUpdate: (adjustments: PricingAdjustment[]) => void;
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
    onPricingUpdate(adjustments);
  }, [clientId, quantity, basePrice, customerAgreement, seasonalAdjustments, onPricingUpdate]);

  const totalDiscount = pricingAdjustments
    .filter(adj => adj.applicable && (adj.type === 'quantity_discount' || adj.type === 'customer_agreement' || adj.type === 'loyalty_discount'))
    .reduce((sum, adj) => sum + adj.amount, 0);

  const totalPremium = pricingAdjustments
    .filter(adj => adj.applicable && adj.type === 'seasonal_adjustment')
    .reduce((sum, adj) => sum + adj.amount, 0);

  const netAdjustment = totalPremium - totalDiscount;
  const finalPrice = basePrice + netAdjustment;

  const getAdjustmentIcon = (type: string) => {
    switch (type) {
      case 'quantity_discount':
      case 'customer_agreement':
      case 'loyalty_discount':
        return <Percent className="h-4 w-4 text-green-600" />;
      case 'seasonal_adjustment':
        return <Calendar className="h-4 w-4 text-orange-600" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getAdjustmentColor = (type: string, applicable: boolean) => {
    if (!applicable) return 'bg-gray-100 text-gray-600';
    
    switch (type) {
      case 'quantity_discount':
      case 'customer_agreement':
      case 'loyalty_discount':
        return 'bg-green-100 text-green-800';
      case 'seasonal_adjustment':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pricing Analysis</span>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Final Price</div>
            <div className="font-semibold text-lg">₹{finalPrice.toFixed(2)}</div>
            <div className={`text-sm ${netAdjustment >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {netAdjustment >= 0 ? '+' : ''}₹{netAdjustment.toFixed(2)} vs base
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customerAgreement && (
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              Active customer agreement: <strong>{customerAgreement.agreementName}</strong>
              <br />
              Valid: {new Date(customerAgreement.validFrom).toLocaleDateString()} - {new Date(customerAgreement.validTo).toLocaleDateString()}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Total Discounts</div>
            <div className="text-lg font-bold text-green-700">₹{totalDiscount.toFixed(2)}</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">Total Premiums</div>
            <div className="text-lg font-bold text-orange-700">₹{totalPremium.toFixed(2)}</div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Adjustment Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
              <TableHead className="text-right">Amount (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricingAdjustments.map((adjustment, index) => (
              <TableRow key={index} className={!adjustment.applicable ? 'opacity-50' : ''}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getAdjustmentIcon(adjustment.type)}
                    <Badge className={getAdjustmentColor(adjustment.type, adjustment.applicable)}>
                      {adjustment.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{adjustment.description}</TableCell>
                <TableCell className="text-right">
                  {adjustment.percentage > 0 ? `${adjustment.percentage}%` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {adjustment.applicable ? (
                    <span className={adjustment.type === 'seasonal_adjustment' ? 'text-orange-600' : 'text-green-600'}>
                      {adjustment.type === 'seasonal_adjustment' ? '+' : '-'}₹{adjustment.amount.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}