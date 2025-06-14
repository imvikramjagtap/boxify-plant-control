interface PricingSummaryCardsProps {
  totalDiscount: number;
  totalPremium: number;
}

export default function PricingSummaryCards({ totalDiscount, totalPremium }: PricingSummaryCardsProps) {
  return (
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
  );
}