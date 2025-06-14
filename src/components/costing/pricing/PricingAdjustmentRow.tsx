import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Users, Calendar, Percent } from "lucide-react";

interface PricingAdjustment {
  type: 'quantity_discount' | 'customer_agreement' | 'seasonal_adjustment' | 'loyalty_discount';
  description: string;
  percentage: number;
  amount: number;
  applicable: boolean;
}

interface PricingAdjustmentRowProps {
  adjustment: PricingAdjustment;
}

export default function PricingAdjustmentRow({ adjustment }: PricingAdjustmentRowProps) {
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
    <TableRow className={!adjustment.applicable ? 'opacity-50' : ''}>
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
  );
}