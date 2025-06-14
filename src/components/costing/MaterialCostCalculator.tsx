import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

interface MaterialCostData {
  materialId: string;
  materialName: string;
  currentPrice: number;
  previousPrice: number;
  priceDate: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  volatility: number;
  impact: number; // Impact on total cost
}

interface MaterialCostCalculatorProps {
  boxId: string;
  quantity: number;
  onCostUpdate: (adjustment: number, materials: MaterialCostData[]) => void;
}

export default function MaterialCostCalculator({ boxId, quantity, onCostUpdate }: MaterialCostCalculatorProps) {
  const [materialCosts, setMaterialCosts] = useState<MaterialCostData[]>([]);
  const [totalAdjustment, setTotalAdjustment] = useState(0);
  
  const rawMaterials = useAppSelector(state => state.rawMaterials.materials);
  const selectedBox = useAppSelector(state => state.boxMaster.boxes.find(b => b.id === boxId));

  useEffect(() => {
    if (selectedBox && rawMaterials.length > 0) {
      // Calculate material costs based on box materials and current market prices
      const costs: MaterialCostData[] = selectedBox.materials.map(boxMaterial => {
        const material = rawMaterials.find(m => m.id === boxMaterial.materialId);
        if (!material) return null;

        // Get price history for trend analysis
        const priceHistory = material.priceHistory || [];
        const currentPrice = material.unitPrice;
        const previousPrice = priceHistory.length > 1 ? priceHistory[priceHistory.length - 2].price : currentPrice;
        
        // Calculate trend and volatility
        const priceChange = currentPrice - previousPrice;
        const percentChange = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;
        
        let trend: 'increasing' | 'decreasing' | 'stable';
        if (Math.abs(percentChange) < 2) trend = 'stable';
        else if (percentChange > 0) trend = 'increasing';
        else trend = 'decreasing';

        // Calculate volatility based on price history
        const volatility = priceHistory.length > 2 
          ? Math.abs(percentChange) * 10 // Simplified volatility calculation
          : 0;

        // Calculate impact on total cost
        const materialQuantityNeeded = boxMaterial.quantity * quantity;
        const impact = materialQuantityNeeded * currentPrice;

        return {
          materialId: material.id,
          materialName: material.name,
          currentPrice,
          previousPrice,
          priceDate: new Date().toISOString().split('T')[0],
          trend,
          volatility: Math.min(volatility, 100),
          impact,
        };
      }).filter(Boolean) as MaterialCostData[];

      setMaterialCosts(costs);

      // Calculate total cost adjustment
      let adjustment = 0;
      costs.forEach(cost => {
        if (cost.trend === 'increasing') {
          adjustment += cost.impact * (cost.volatility / 100) * 0.05; // 5% of volatility impact
        } else if (cost.trend === 'decreasing') {
          adjustment -= cost.impact * (cost.volatility / 100) * 0.025; // 2.5% benefit
        }
      });

      setTotalAdjustment(adjustment);
      onCostUpdate(adjustment, costs);
    }
  }, [selectedBox, rawMaterials, quantity, onCostUpdate]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'bg-red-100 text-red-800';
      case 'decreasing': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVolatilityLevel = (volatility: number) => {
    if (volatility > 70) return { label: 'High', color: 'bg-red-500' };
    if (volatility > 40) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Low', color: 'bg-green-500' };
  };

  const highVolatilityMaterials = materialCosts.filter(m => m.volatility > 50);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Material Cost Analysis</span>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Cost Adjustment</div>
            <div className={`font-semibold ${totalAdjustment >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {totalAdjustment >= 0 ? '+' : ''}₹{totalAdjustment.toFixed(2)}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {highVolatilityMaterials.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {highVolatilityMaterials.length} material(s) showing high price volatility. 
              Consider shorter quote validity or escalation clauses.
            </AlertDescription>
          </Alert>
        )}

        {materialCosts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No material data available. Please select a box to see material cost analysis.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Volatility</TableHead>
                <TableHead className="text-right">Impact (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialCosts.map((material) => {
                const volatilityLevel = getVolatilityLevel(material.volatility);
                const priceChange = material.currentPrice - material.previousPrice;
                const percentChange = material.previousPrice > 0 
                  ? ((priceChange / material.previousPrice) * 100) 
                  : 0;

                return (
                  <TableRow key={material.materialId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{material.materialName}</div>
                        <div className="text-sm text-muted-foreground">
                          Updated: {new Date(material.priceDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">₹{material.currentPrice.toFixed(2)}</div>
                        <div className={`text-sm ${priceChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {priceChange >= 0 ? '+' : ''}₹{priceChange.toFixed(2)} 
                          ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(material.trend)}
                        <Badge className={getTrendColor(material.trend)}>
                          {material.trend}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={volatilityLevel.color}>
                          {volatilityLevel.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {material.volatility.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">₹{material.impact.toFixed(2)}</div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}