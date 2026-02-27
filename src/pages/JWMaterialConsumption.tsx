import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  PackageSearch, 
  TrendingDown, 
  AlertTriangle, 
  BarChart, 
  Search, 
  ArrowRight,
  TrendingUp,
  FlaskConical,
  Scale
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

// Redux
import { selectAllJobCards } from "@/store/slices/jobCardSlice";
import { selectAllJobWorkers } from "@/store/slices/godownJobWorkerSlice";
import { RootState } from "@/store";

export default function JWMaterialConsumption() {
  const jobCards = useSelector((state: any) => selectAllJobCards(state));
  const jobWorkers = useSelector((state: any) => selectAllJobWorkers(state));

  const [selectedWorkerId, setSelectedWorkerId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const consumptionData = useMemo(() => {
    const data: Record<string, { 
      issued: number, 
      consumed: number, 
      wastage: number,
      materials: Record<string, { name: string, issued: number, consumed: number }>
    }> = {};

    jobCards.forEach(jc => {
      if (selectedWorkerId !== "all" && jc.jobWorkerId !== selectedWorkerId) return;

      jc.materialsIssued.forEach(mat => {
        if (!data[mat.materialId]) {
          data[mat.materialId] = { issued: 0, consumed: 0, wastage: 0, materials: {} };
        }
        
        // Calculate total issued
        data[mat.materialId].issued += mat.quantity;
        
        // Calculate consumed based on Job Card progress
        const completionRate = jc.items.reduce((acc, item) => acc + (item.receivedQuantity / item.quantity), 0) / jc.items.length;
        const matConsumed = mat.quantity * completionRate;
        
        data[mat.materialId].consumed += matConsumed;
        
        // Track per worker in a real app, here we aggregate per material for the summary
      });
    });

    return Object.entries(data).map(([id, stats]) => ({
      id,
      name: stats.issued > 0 ? jobCards.find(jc => jc.materialsIssued.some(m => m.materialId === id))?.materialsIssued.find(m => m.materialId === id)?.materialName || "Unknown" : "Unknown",
      issued: stats.issued,
      consumed: stats.consumed,
      wastage: stats.issued * 0.02, // Mock 2% wastage
      efficiency: (stats.consumed / (stats.issued || 1)) * 100
    }));
  }, [jobCards, selectedWorkerId]);

  const filteredData = consumptionData.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalIssued: consumptionData.reduce((acc, d) => acc + d.issued, 0),
    avgEfficiency: consumptionData.length > 0 ? consumptionData.reduce((acc, d) => acc + d.efficiency, 0) / consumptionData.length : 0,
    totalWastage: consumptionData.reduce((acc, d) => acc + d.wastage, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">JW Material Consumption</h1>
          <p className="text-muted-foreground mt-1">
            Reconcile materials issued vs consumed for all outsourced production.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Job Workers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Workers</SelectItem>
              {jobWorkers.map(jw => (
                <SelectItem key={jw.id} value={jw.id}>{jw.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Materials at JW", desc: "Currently issued", icon: PackageSearch, count: stats.totalIssued.toFixed(0), color: "text-blue-500" },
          { title: "Avg Efficiency", desc: "Production yield", icon: BarChart, count: stats.avgEfficiency.toFixed(1) + "%", color: "text-emerald-500" },
          { title: "Estimated Wastage", desc: "Process loss", icon: TrendingDown, count: stats.totalWastage.toFixed(1), color: "text-amber-500" },
          { title: "Risk Level", desc: "Consumption variance", icon: AlertTriangle, count: "Low", color: "text-slate-500" },
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

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Material Reconciliation</CardTitle>
              <CardDescription>Comparison of material issued to vendors vs actual consumption based on inward goods.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Find material..."
                className="pl-9 w-64 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead>Material Name</TableHead>
                <TableHead className="text-right">Issued Qty</TableHead>
                <TableHead className="text-right">Est. Consumed</TableHead>
                <TableHead className="text-right">Calculated Wastage</TableHead>
                <TableHead className="w-[200px]">Efficiency Index</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? filteredData.map((data) => (
                <TableRow key={data.id}>
                  <TableCell className="font-medium">{data.name}</TableCell>
                  <TableCell className="text-right font-semibold">{data.issued.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-emerald-600">{data.consumed.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-amber-600">{data.wastage.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground">
                        <span>Rate</span>
                        <span>{data.efficiency.toFixed(0)}%</span>
                      </div>
                      <Progress value={data.efficiency} className="h-1.5" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={data.efficiency > 90 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}>
                      {data.efficiency > 90 ? "Optimal" : "In Progress"}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    No consumption data found for the selected criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-purple-500" />
              JW Wastage Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
              <div className="text-3xl font-bold text-purple-700">2.4%</div>
              <div className="text-xs text-purple-600 mt-1">Average Wastage across all JW</div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Standard Allowance</span>
                <span className="font-medium">2.0%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Actual Variance</span>
                <span className="font-medium text-red-500">+0.4%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Scale className="h-4 w-4 text-blue-500" />
              Reconciliation Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <div className="text-sm flex-1">Job Cards Balanced</div>
              <div className="text-sm font-bold">12</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <div className="text-sm flex-1">Pending Inward</div>
              <div className="text-sm font-bold">5</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <div className="text-sm flex-1">Heavy Variance</div>
              <div className="text-sm font-bold">1</div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Yield Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on the last 30 days, your material utilization efficiency has 
              <span className="font-bold text-emerald-600"> increased by 4.2%</span>. 
              Optimization of die-cutting patterns at Classic Die Cutters is the primary driver.
            </p>
            <Button variant="outline" size="sm" className="w-full mt-4 text-xs">View Yield Report</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
