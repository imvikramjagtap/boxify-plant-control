import { Users } from "lucide-react";

interface PricingHeaderProps {
  finalPrice: number;
  netAdjustment: number;
}

export default function PricingHeader({ finalPrice, netAdjustment }: PricingHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <span>Pricing Analysis</span>
      <div className="text-right">
        <div className="text-sm text-muted-foreground">Final Price</div>
        <div className="font-semibold text-lg">₹{finalPrice.toFixed(2)}</div>
        <div className={`text-sm ${netAdjustment >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
          {netAdjustment >= 0 ? '+' : ''}₹{netAdjustment.toFixed(2)} vs base
        </div>
      </div>
    </div>
  );
}