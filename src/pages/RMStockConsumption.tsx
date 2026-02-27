import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Hammer, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  Plus, 
  Search, 
  ArrowUpRight,
  History,
  Info,
  Beaker
} from "lucide-react";
import { toast } from "sonner";

// Redux
import { selectAllMaterials, updateStock } from "@/store/slices/rawMaterialsSlice";
import { selectAllStockMovements, addStockMovement } from "@/store/slices/stockMovementsSlice";
import { RootState } from "@/store";

export default function RMStockConsumption() {
  const dispatch = useDispatch();
  const materials = useSelector((state: any) => selectAllMaterials(state));
  const movements = useSelector((state: any) => selectAllStockMovements(state));

  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    materialId: "",
    quantity: 0,
    reason: "Production Consumption",
    notes: ""
  });

  const consumptionHistory = useMemo(() => {
    return movements
      .filter(m => m.type === "OUT")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [movements]);

  const stats = {
    totalConsumed: consumptionHistory.reduce((acc, m) => acc + m.quantity, 0),
    lowStock: materials.filter(m => m.currentStock <= m.minimumStock).length,
    activeMaterials: materials.length,
    recentCount: consumptionHistory.filter(m => new Date(m.date).toDateString() === new Date().toDateString()).length
  };

  const handleRecordConsumption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.materialId || formData.quantity <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    const material = materials.find(m => m.id === formData.materialId);
    if (material && material.currentStock < formData.quantity) {
      toast.error(`Insufficient stock! Current: ${material.currentStock} ${material.unit}`);
      return;
    }

    // 1. Update Stock in RawMaterials Slice
    dispatch(updateStock({
      id: formData.materialId,
      quantity: formData.quantity,
      type: 'OUT'
    }));

    // 2. Add Stock Movement
    dispatch(addStockMovement({
      materialId: formData.materialId,
      type: "OUT",
      quantity: formData.quantity,
      reason: formData.reason,
      date: new Date().toISOString().split('T')[0],
      notes: formData.notes,
      createdBy: "Admin"
    }));

    toast.success("Consumption recorded successfully");
    setIsRecordDialogOpen(false);
    setFormData({ materialId: "", quantity: 0, reason: "Production Consumption", notes: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">RM Stock Consumption</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage raw material deductions for in-house use and production.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4 mr-2" />
                Record Material Use
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Material Consumption</DialogTitle>
                <DialogDescription>
                  Manually deduct stock for production, damage, or testing.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleRecordConsumption} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Material *</Label>
                  <Select value={formData.materialId} onValueChange={(val) => setFormData({...formData, materialId: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} (Stock: {m.currentStock} {m.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input 
                      type="number" 
                      value={formData.quantity || ""} 
                      onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Purpose</Label>
                    <Select value={formData.reason} onValueChange={(val) => setFormData({...formData, reason: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Production Consumption">Production</SelectItem>
                        <SelectItem value="Wastage / Scrap">Wastage / Scrap</SelectItem>
                        <SelectItem value="Sample / testing">Sample / Testing</SelectItem>
                        <SelectItem value="Damage">Damage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Input 
                    placeholder="e.g. Job ID or Machine Number"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsRecordDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700">Record Deduction</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Today's Consumption", desc: "Items deducted today", icon: TrendingDown, count: stats.recentCount, color: "text-amber-500" },
          { title: "Stock Remaining", desc: "In-house inventory", icon: Package, count: materials.reduce((acc: number, m: any) => acc + m.currentStock, 0).toFixed(0), color: "text-blue-500" },
          { title: "Low Stock Items", desc: "Below minimum level", icon: AlertTriangle, count: stats.lowStock, color: "text-red-500" },
          { title: "Active SKUs", desc: "Material categories", icon: Beaker, count: stats.activeMaterials, color: "text-purple-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground">{stat.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-500" />
              Consumption History
            </CardTitle>
            <CardDescription>Log of all raw material deductions from inventory.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consumptionHistory.slice(0, 10).map((m) => {
                  const material = materials.find((mat: any) => mat.id === m.materialId);
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">{new Date(m.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{material?.name || "Unknown Material"}</TableCell>
                      <TableCell className="text-red-600 font-bold">-{m.quantity} {material?.unit}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 text-[10px] uppercase">{m.reason}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.notes || "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Quick Inventory Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {materials.filter((m: any) => m.currentStock <= m.minimumStock * 1.5).slice(0, 5).map((m: any) => (
                <div key={m.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{m.name}</span>
                    <span className={m.currentStock <= m.minimumStock ? "text-red-600" : "text-amber-600"}>
                      {m.currentStock} {m.unit}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${m.currentStock <= m.minimumStock ? "bg-red-500" : "bg-amber-500"}`}
                      style={{ width: `${Math.min((m.currentStock / (m.minimumStock * 2)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2 text-xs" onClick={() => window.location.href='/raw-materials'}>
                Manage Inventory
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Consumption Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Weekly Forecast</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Stable</Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">850</span>
                  <span className="text-xs text-slate-400">Total Units Expected</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
                  <ArrowUpRight className="h-3 w-3" />
                  Demand is 15% higher this week
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
