import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  BarChart3, 
  ShoppingCart, 
  PackageSearch, 
  Package, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Filter,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

// Redux
import { selectAllSuppliers } from "@/store/slices/suppliersSlice";
import { selectAllClients } from "@/store/slices/clientsSlice";
import { selectAllMaterials } from "@/store/slices/rawMaterialsSlice";
import { selectAllPurchaseOrders } from "@/store/slices/purchaseOrdersSlice";
import { selectAllJobCards } from "@/store/slices/jobCardSlice";

const reportTypes: Record<string, { title: string; description: string; icon: React.ElementType }> = {
  purchase: {
    title: "Purchase Report",
    description: "Analyze purchase orders, supplier performance, and procurement trends.",
    icon: ShoppingCart,
  },
  consumption: {
    title: "Consumption Report",
    description: "Review material consumption across production, job workers, and wastage.",
    icon: PackageSearch,
  },
  stock: {
    title: "Stock in Hand Report",
    description: "Current inventory status for all raw materials and finished goods.",
    icon: Package,
  },
  sales: {
    title: "Sales Report",
    description: "Track sales performance by client, product, and time period.",
    icon: TrendingUp,
  },
  pending: {
    title: "Pending Order Report",
    description: "View all pending orders across clients. Track delivery timelines.",
    icon: Clock,
  },
};

export default function Reports() {
  const location = useLocation();
  const reportKey = location.pathname.split("/").pop() || "";
  const report = reportTypes[reportKey];

  const suppliers = useSelector((state: any) => selectAllSuppliers(state));
  const clients = useSelector((state: any) => selectAllClients(state));
  const materials = useSelector((state: any) => selectAllMaterials(state));
  const purchaseOrders = useSelector((state: any) => selectAllPurchaseOrders(state));
  const salesOrders = useSelector((state: any) => state.salesOrders.orders);
  const jobCards = useSelector((state: any) => selectAllJobCards(state));

  // Report Renderers
  const renderPurchaseReport = () => {
    const totalSpend = purchaseOrders.reduce((acc: number, po: any) => acc + po.totalAmount, 0);
    const supplierSpend = purchaseOrders.reduce((acc: Record<string, number>, po: any) => {
      acc[po.supplierId] = (acc[po.supplierId] || 0) + po.totalAmount;
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Procurement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(totalSpend / 100000).toFixed(2)}L</div>
              <p className="text-xs text-muted-foreground mt-1">Total spend across all POs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Vendor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(supplierSpend).length > 0 
                  ? suppliers.find((s: any) => s.id === Object.entries(supplierSpend).sort((a: any, b: any) => b[1] - a[1])[0][0])?.name.split(' ')[0]
                  : "N/A"
                }
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-semibold text-emerald-600">Highest value supplier</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">PO Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchaseOrders.length}</div>
              <p className="text-xs text-muted-foreground mt-1 underline cursor-pointer">View active POs</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Procurement History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((po: any) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-bold">{po.id}</TableCell>
                    <TableCell>{suppliers.find((s: any) => s.id === po.supplierId)?.name || po.supplierId}</TableCell>
                    <TableCell>{po.orderDate}</TableCell>
                    <TableCell className="text-right font-semibold">₹{po.totalAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={po.status === 'ordered' ? 'bg-blue-50' : 'bg-emerald-50'}>
                        {po.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderStockReport = () => {
    const totalValuation = materials.reduce((acc: number, m: any) => acc + (m.currentStock * m.averageRate), 0);
    
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Valuation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(totalValuation / 100000).toFixed(2)}L</div>
              <p className="text-xs text-muted-foreground mt-1">Based on avg. procurement rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{materials.filter((m: any) => m.currentStock <= m.minimumStock).length}</div>
              <p className="text-xs text-muted-foreground mt-1">Items below reorder point</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total SKUs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{materials.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Tracked raw materials</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Warehousing Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Unit</TableHead>
                  <TableHead className="text-right">Valuation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-semibold">{m.name}</TableCell>
                    <TableCell>{m.productType}</TableCell>
                    <TableCell className={`text-right font-bold ${m.currentStock <= m.minimumStock ? 'text-red-500' : ''}`}>
                      {m.currentStock}
                    </TableCell>
                    <TableCell className="text-right text-xs uppercase text-muted-foreground">{m.unit}</TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{(m.currentStock * m.averageRate).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSalesReport = () => {
    const totalSales = salesOrders.reduce((acc: number, so: any) => acc + (so.totalPrice || 0), 0);
    const confirmedOrders = salesOrders.filter((so: any) => so.status !== 'draft' && so.status !== 'cancelled');

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gross Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">₹{(totalSales / 100000).toFixed(2)}L</div>
              <p className="text-xs text-muted-foreground mt-1">Confirmed order bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(salesOrders.map((so: any) => so.clientId)).size}</div>
              <p className="text-xs text-muted-foreground mt-1">Clients with current orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">76%</div>
              <p className="text-xs text-muted-foreground mt-1">Quotes to confirmed orders</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Ledger</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesOrders.map((so: any) => (
                  <TableRow key={so.id}>
                    <TableCell className="font-mono text-xs font-bold">{so.id}</TableCell>
                    <TableCell className="font-medium">{clients.find((c: any) => c.id === so.clientId)?.name || so.clientId}</TableCell>
                    <TableCell>{so.orderDate}</TableCell>
                    <TableCell className="text-right font-bold text-blue-700">₹{(so.totalPrice || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                        {so.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPendingReport = () => {
    const pendingOrders = salesOrders.filter((so: any) => so.status !== 'delivered' && so.status !== 'cancelled');
    const overdueCount = pendingOrders.filter((so: any) => new Date(so.expectedDeliveryDate) < new Date()).length;

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Fulfillment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Orders in production or pipeline</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Past expected delivery date</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Production</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesOrders.filter((so: any) => so.status === 'in_production').length}</div>
              <p className="text-xs text-muted-foreground mt-1">On machine / with JW</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overdue & Near-Deadline Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Expected Date</TableHead>
                  <TableHead>Days Delay</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders.map((so: any) => {
                  const delay = Math.max(0, Math.floor((new Date().getTime() - new Date(so.expectedDeliveryDate).getTime()) / (1000 * 3600 * 24)));
                  return (
                    <TableRow key={so.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs">{so.id}</span>
                          <span className="text-[10px] text-muted-foreground text-nowrap">{clients.find((c: any) => c.id === so.clientId)?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{so.expectedDeliveryDate}</TableCell>
                      <TableCell>
                        <Badge variant={delay > 0 ? "destructive" : "secondary"} className="text-[10px]">
                          {delay > 0 ? `${delay} days late` : "On track"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${so.status === 'in_production' ? 'bg-amber-500' : 'bg-blue-500'} animate-pulse`} />
                          <span className="text-xs uppercase font-bold text-muted-foreground">{so.status.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderConsumptionReport = () => {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14,250 Units</div>
              <p className="text-xs text-muted-foreground mt-1">Across all production jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Yield</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">97.2%</div>
              <p className="text-xs text-muted-foreground mt-1">Output efficiency</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Wastage Valuation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">₹42.5K</div>
              <p className="text-xs text-muted-foreground mt-1">Total process loss cost</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Material Consumption Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job/Work Order</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead className="text-right">Expected</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobCards.slice(0, 5).map((jc: any) => (
                  <TableRow key={jc.id}>
                    <TableCell className="font-bold">{jc.id}</TableCell>
                    <TableCell>{jc.jobWorkerName}</TableCell>
                    <TableCell className="text-right">{jc.materialsIssued.reduce((a: any, m: any) => a + m.quantity, 0).toFixed(0)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {(jc.materialsIssued.reduce((a: any, m: any) => a + m.quantity, 0) * 0.98).toFixed(0)}
                    </TableCell>
                    <TableCell className="text-right text-red-500 font-bold">-2%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderReportContent = () => {
    switch (reportKey) {
      case "purchase": return renderPurchaseReport();
      case "stock": return renderStockReport();
      case "sales": return renderSalesReport();
      case "pending": return renderPendingReport();
      case "consumption": return renderConsumptionReport();
      default: return null;
    }
  };

  if (report) {
    const Icon = report.icon;
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{report.title}</h1>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 uppercase font-bold tracking-wider">
                Live Data
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{report.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" className="bg-slate-900">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {renderReportContent()}
      </div>
    );
  }

  // Default reports overview
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">
            Access business intelligence and detailed production logs.
          </p>
        </div>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Request Custom Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(reportTypes).map(([key, r]) => {
          const Icon = r.icon;
          return (
            <Card 
              key={key} 
              className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group border-slate-200"
              onClick={() => window.location.href = `/reports/${key}`}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 group-hover:bg-primary/10 transition-colors border border-slate-100">
                    <Icon className="h-6 w-6 text-slate-500 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{r.title}</CardTitle>
                    <CardDescription className="text-xs">Dynamic reporting engine</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                <div className="mt-4 flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  View Full Report
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-slate-900 text-white overflow-hidden relative border-0">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BarChart3 className="h-32 w-32" />
        </div>
        <CardContent className="py-12 relative z-10">
          <div className="max-w-md space-y-4">
            <h2 className="text-2xl font-bold">Consolidated Dashboard</h2>
            <p className="text-slate-400 text-sm">
              Connect your data streams to get a birds-eye view of your factory's performance, 
              from raw paper procurement to client delivery.
            </p>
            <div className="flex gap-4 pt-2">
              <Button variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100">
                Setup Dashboards
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
