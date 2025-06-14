import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, Settings, Calculator } from "lucide-react";

interface AdjustmentConfig {
  type: 'quantity_discount' | 'customer_agreement' | 'seasonal_adjustment' | 'loyalty_discount';
  enabled: boolean;
  customPercentage?: number;
  description: string;
  defaultPercentage: number;
  reasoning: string;
}

interface PricingAdjustmentControlProps {
  basePrice: number;
  quantity: number;
  onAdjustmentsChange: (adjustments: AdjustmentConfig[], finalPrice: number) => void;
}

export default function PricingAdjustmentControl({ 
  basePrice, 
  quantity, 
  onAdjustmentsChange 
}: PricingAdjustmentControlProps) {
  const [adjustments, setAdjustments] = useState<AdjustmentConfig[]>([
    {
      type: 'quantity_discount',
      enabled: true,
      description: 'Volume-based discount',
      defaultPercentage: quantity >= 10000 ? 15 : quantity >= 5000 ? 10 : quantity >= 1000 ? 5 : 0,
      reasoning: quantity >= 10000 
        ? 'Large volume orders (10,000+) qualify for maximum discount due to production efficiency and reduced setup costs.'
        : quantity >= 5000 
        ? 'High volume orders (5,000-9,999) get substantial discount for economies of scale.'
        : quantity >= 1000 
        ? 'Standard volume orders (1,000-4,999) receive basic discount for batch production.'
        : 'Small quantities do not qualify for volume discounts due to higher per-unit setup costs.'
    },
    {
      type: 'seasonal_adjustment',
      enabled: false,
      description: 'Seasonal premium/discount',
      defaultPercentage: 8,
      reasoning: 'Festive season demand increases material costs and production pressure, requiring premium pricing.'
    },
    {
      type: 'customer_agreement',
      enabled: false,
      description: 'Special customer rates',
      defaultPercentage: 5,
      reasoning: 'Long-term contracts and high-value customers receive preferential pricing for loyalty and guaranteed volume.'
    },
    {
      type: 'loyalty_discount',
      enabled: false,
      description: 'Customer loyalty bonus',
      defaultPercentage: 2,
      reasoning: 'Repeat customers receive additional discount to encourage continued business relationship.'
    }
  ]);

  const [showReasons, setShowReasons] = useState(false);

  const updateAdjustment = (index: number, field: keyof AdjustmentConfig, value: any) => {
    const newAdjustments = [...adjustments];
    newAdjustments[index] = { ...newAdjustments[index], [field]: value };
    setAdjustments(newAdjustments);
    
    calculateFinalPrice(newAdjustments);
  };

  const calculateFinalPrice = (currentAdjustments: AdjustmentConfig[]) => {
    let adjustedPrice = basePrice;
    
    currentAdjustments.forEach(adj => {
      if (adj.enabled) {
        const percentage = adj.customPercentage ?? adj.defaultPercentage;
        if (adj.type === 'seasonal_adjustment') {
          adjustedPrice += basePrice * (percentage / 100); // Premium
        } else {
          adjustedPrice -= basePrice * (percentage / 100); // Discount
        }
      }
    });
    
    onAdjustmentsChange(currentAdjustments, adjustedPrice);
  };

  const getAdjustmentTypeColor = (type: string) => {
    switch (type) {
      case 'quantity_discount':
      case 'customer_agreement':
      case 'loyalty_discount':
        return 'bg-green-100 text-green-800';
      case 'seasonal_adjustment':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalDiscount = adjustments
    .filter(adj => adj.enabled && adj.type !== 'seasonal_adjustment')
    .reduce((sum, adj) => sum + basePrice * ((adj.customPercentage ?? adj.defaultPercentage) / 100), 0);

  const totalPremium = adjustments
    .filter(adj => adj.enabled && adj.type === 'seasonal_adjustment')
    .reduce((sum, adj) => sum + basePrice * ((adj.customPercentage ?? adj.defaultPercentage) / 100), 0);

  const finalPrice = basePrice + totalPremium - totalDiscount;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Pricing Adjustments Control
          </CardTitle>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowReasons(!showReasons)}
            >
              <Info className="h-4 w-4 mr-2" />
              {showReasons ? 'Hide' : 'Show'} Reasoning
            </Button>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Adjusted Price</div>
              <div className="font-semibold text-lg">₹{finalPrice.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Base Price</div>
            <div className="text-lg font-bold text-blue-700">₹{basePrice.toFixed(2)}</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Total Discounts</div>
            <div className="text-lg font-bold text-green-700">-₹{totalDiscount.toFixed(2)}</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">Total Premiums</div>
            <div className="text-lg font-bold text-orange-700">+₹{totalPremium.toFixed(2)}</div>
          </div>
        </div>

        {/* Adjustment Controls */}
        <div className="space-y-4">
          {adjustments.map((adjustment, index) => (
            <div key={adjustment.type} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={adjustment.enabled}
                    onCheckedChange={(enabled) => updateAdjustment(index, 'enabled', enabled)}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{adjustment.description}</span>
                      <Badge className={getAdjustmentTypeColor(adjustment.type)}>
                        {adjustment.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {adjustment.type === 'seasonal_adjustment' ? 'Premium' : 'Discount'}: 
                      {adjustment.enabled ? 
                        ` ${adjustment.type === 'seasonal_adjustment' ? '+' : '-'}₹${(basePrice * ((adjustment.customPercentage ?? adjustment.defaultPercentage) / 100)).toFixed(2)}` :
                        ' Not applied'
                      }
                    </div>
                  </div>
                </div>
                
                {adjustment.enabled && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${adjustment.type}-percentage`} className="text-sm">
                      Percentage:
                    </Label>
                    <Input
                      id={`${adjustment.type}-percentage`}
                      type="number"
                      value={adjustment.customPercentage ?? adjustment.defaultPercentage}
                      onChange={(e) => updateAdjustment(index, 'customPercentage', parseFloat(e.target.value) || 0)}
                      className="w-20"
                      min="0"
                      max="50"
                      step="0.1"
                    />
                    <span className="text-sm">%</span>
                  </div>
                )}
              </div>

              {showReasons && (
                <Alert>
                  <Calculator className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Calculation Logic:</strong> {adjustment.reasoning}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>

        {/* Final Calculation Breakdown */}
        <Alert>
          <Calculator className="h-4 w-4" />
          <AlertDescription>
            <strong>Price Calculation:</strong><br />
            Base Price: ₹{basePrice.toFixed(2)}<br />
            {totalPremium > 0 && `+ Premiums: ₹${totalPremium.toFixed(2)}`}<br />
            {totalDiscount > 0 && `- Discounts: ₹${totalDiscount.toFixed(2)}`}<br />
            <strong>Final Price: ₹{finalPrice.toFixed(2)}</strong>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}