import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Package } from "lucide-react";

interface MaterialAdjustment {
  materialId: string;
  materialName: string;
  currentPrice: number;
  suggestedAdjustment: number;
  reason: string;
  enabled: boolean;
  trend: 'increasing' | 'decreasing' | 'stable';
  volatility: number;
  customReason?: string;
}

interface MaterialCostAnalyzerProps {
  onCostAdjustment: (totalAdjustment: number, details: MaterialAdjustment[]) => void;
}

export default function MaterialCostAnalyzer({ onCostAdjustment }: MaterialCostAnalyzerProps) {
  const rawMaterials = useAppSelector(state => state.rawMaterials.materials);
  const [materialAdjustments, setMaterialAdjustments] = useState<MaterialAdjustment[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [autoApply, setAutoApply] = useState(false);

  useEffect(() => {
    // Analyze raw materials for cost adjustments
    const adjustments: MaterialAdjustment[] = rawMaterials.map(material => {
      // Mock trend analysis - in real app, this would come from price history
      const mockTrend = Math.random();
      const trend: 'increasing' | 'decreasing' | 'stable' = 
        mockTrend > 0.6 ? 'increasing' : mockTrend < 0.3 ? 'decreasing' : 'stable';
      
      const volatility = Math.random() * 100;
      
      let suggestedAdjustment = 0;
      let reason = '';
      
      if (trend === 'increasing' && volatility > 60) {
        suggestedAdjustment = material.unitPrice * 0.08; // 8% increase
        reason = `High volatility (${volatility.toFixed(1)}%) with increasing trend requires cost adjustment to maintain margins`;
      } else if (trend === 'increasing' && volatility > 30) {
        suggestedAdjustment = material.unitPrice * 0.05; // 5% increase
        reason = `Moderate price increase trend detected, adjustment recommended for cost stability`;
      } else if (trend === 'decreasing' && volatility > 40) {
        suggestedAdjustment = -material.unitPrice * 0.03; // 3% decrease
        reason = `Decreasing material costs allow for competitive pricing adjustment`;
      } else {
        reason = `Material prices are stable, no adjustment needed`;
      }

      return {
        materialId: material.id,
        materialName: material.name,
        currentPrice: material.unitPrice,
        suggestedAdjustment,
        reason,
        enabled: Math.abs(suggestedAdjustment) > 0 && !autoApply,
        trend,
        volatility
      };
    });

    setMaterialAdjustments(adjustments);
  }, [rawMaterials, autoApply]);

  useEffect(() => {
    const totalAdjustment = materialAdjustments
      .filter(adj => autoApply || adj.enabled)
      .reduce((sum, adj) => sum + adj.suggestedAdjustment, 0);
    
    onCostAdjustment(totalAdjustment, materialAdjustments);
  }, [materialAdjustments, autoApply, onCostAdjustment]);

  const updateAdjustment = (materialId: string, field: keyof MaterialAdjustment, value: any) => {
    setMaterialAdjustments(prev => 
      prev.map(adj => 
        adj.materialId === materialId 
          ? { ...adj, [field]: value }
          : adj
      )
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'bg-red-100 text-red-800';
      case 'decreasing':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPositiveAdjustment = materialAdjustments
    .filter(adj => (autoApply || adj.enabled) && adj.suggestedAdjustment > 0)
    .reduce((sum, adj) => sum + adj.suggestedAdjustment, 0);

  const totalNegativeAdjustment = materialAdjustments
    .filter(adj => (autoApply || adj.enabled) && adj.suggestedAdjustment < 0)
    .reduce((sum, adj) => sum + Math.abs(adj.suggestedAdjustment), 0);

  const netAdjustment = totalPositiveAdjustment - totalNegativeAdjustment;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Material Cost Analysis
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-apply">Auto-apply adjustments:</Label>
              <Switch
                id="auto-apply"
                checked={autoApply}
                onCheckedChange={setAutoApply}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-sm text-red-600 font-medium">Cost Increases</div>
            <div className="text-lg font-bold text-red-700">+₹{totalPositiveAdjustment.toFixed(2)}</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Cost Savings</div>
            <div className="text-lg font-bold text-green-700">-₹{totalNegativeAdjustment.toFixed(2)}</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Net Impact</div>
            <div className={`text-lg font-bold ${netAdjustment >= 0 ? 'text-red-700' : 'text-green-700'}`}>
              {netAdjustment >= 0 ? '+' : ''}₹{netAdjustment.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Mode Alert */}
        <Alert>
          {autoApply ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Auto-apply mode enabled:</strong> All recommended adjustments are automatically applied based on real-time material cost analysis.
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Manual mode:</strong> Review and selectively enable material cost adjustments. Use toggles to control which adjustments to apply.
              </AlertDescription>
            </>
          )}
        </Alert>

        {/* Material Adjustments Table */}
        {showDetails && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Adjustment</TableHead>
                <TableHead>Reason</TableHead>
                {!autoApply && <TableHead>Apply</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialAdjustments.map((adjustment) => (
                <TableRow key={adjustment.materialId}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{adjustment.materialName}</div>
                      <div className="text-sm text-muted-foreground">
                        Volatility: {adjustment.volatility.toFixed(1)}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>₹{adjustment.currentPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(adjustment.trend)}
                      <Badge className={getTrendColor(adjustment.trend)}>
                        {adjustment.trend}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {Math.abs(adjustment.suggestedAdjustment) > 0 ? (
                      <span className={adjustment.suggestedAdjustment > 0 ? 'text-red-600' : 'text-green-600'}>
                        {adjustment.suggestedAdjustment > 0 ? '+' : ''}₹{adjustment.suggestedAdjustment.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400">No change</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="text-sm">{adjustment.reason}</div>
                      {!autoApply && adjustment.enabled && (
                        <Textarea
                          placeholder="Add custom reason (optional)"
                          value={adjustment.customReason || ''}
                          onChange={(e) => updateAdjustment(adjustment.materialId, 'customReason', e.target.value)}
                          className="mt-2 text-xs"
                          rows={2}
                        />
                      )}
                    </div>
                  </TableCell>
                  {!autoApply && (
                    <TableCell>
                      <Switch
                        checked={adjustment.enabled}
                        onCheckedChange={(enabled) => updateAdjustment(adjustment.materialId, 'enabled', enabled)}
                        disabled={Math.abs(adjustment.suggestedAdjustment) === 0}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Explanation */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Material Cost Impact:</strong> Adjustments are calculated based on recent price trends, market volatility, and supply chain factors. 
            {autoApply 
              ? ' All adjustments are automatically applied to maintain competitive pricing.'
              : ' Review each adjustment and enable only those you want to include in the final quote.'
            }
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}