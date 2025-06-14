import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PricingAdjustmentRow from "./PricingAdjustmentRow";

interface PricingAdjustment {
  type: 'quantity_discount' | 'customer_agreement' | 'seasonal_adjustment' | 'loyalty_discount';
  description: string;
  percentage: number;
  amount: number;
  applicable: boolean;
}

interface PricingAdjustmentTableProps {
  adjustments: PricingAdjustment[];
}

export default function PricingAdjustmentTable({ adjustments }: PricingAdjustmentTableProps) {
  return (
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
        {adjustments.map((adjustment, index) => (
          <PricingAdjustmentRow key={index} adjustment={adjustment} />
        ))}
      </TableBody>
    </Table>
  );
}