import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Users, 
  FileText, 
  Factory,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";

export default function Dashboard() {
  // Get real data from Redux store
  const clients = useAppSelector((state: any) => state.clients?.clients || []);
  const boxDesigns = useAppSelector((state: any) => state.boxMaster?.boxes || []);
  const rawMaterials = useAppSelector((state: any) => state.rawMaterials?.materials || []);
  const purchaseOrders = useAppSelector((state: any) => state.purchaseOrders?.orders || []);

  // Calculate real statistics
  const activeClients = clients.filter(c => c.status === "Active").length;
  const totalBoxDesigns = boxDesigns.length;
  const totalRawMaterials = rawMaterials.length;
  const lowStockMaterials = rawMaterials.filter(m => m.currentStock <= m.minimumStock);
  const pendingPOs = purchaseOrders.filter(po => po.status === "pending").length;

  const stats = [
    {
      title: "Active Clients",
      value: activeClients.toString(),
      icon: Users,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Box Designs", 
      value: totalBoxDesigns.toString(),
      icon: Package,
      change: "+5%",
      changeType: "positive" as const,
    },
    {
      title: "Pending POs",
      value: pendingPOs.toString(),
      icon: FileText,
      change: "-2%",
      changeType: "negative" as const,
    },
    {
      title: "Raw Materials",
      value: totalRawMaterials.toString(),
      icon: Package,
      change: "+8%",
      changeType: "positive" as const,
    },
  ];

  const recentJobs = [
      {
        id: "JOB001",
        client: "ABC Industries",
        boxType: "Top-Bottom",
        quantity: 5000,
        status: "In Progress",
        dueDate: "2024-06-20",
      },
    {
      id: "JOB002", 
      client: "XYZ Corp",
      boxType: "RCS",
      quantity: 3000,
      status: "Pending",
      dueDate: "2024-06-22",
    },
    {
      id: "JOB003",
      client: "DEF Ltd",
      boxType: "Top-Bottom", 
      quantity: 8000,
      status: "Completed",
      dueDate: "2024-06-18",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your box manufacturing operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span
                    className={
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-muted-foreground"
                    }
                  >
                    {stat.change}
                  </span>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Jobs */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Job Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{job.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {job.client} • {job.boxType}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Qty: {job.quantity.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Due: {job.dueDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Production Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Show real low stock alerts */}
              {lowStockMaterials.length > 0 ? (
                lowStockMaterials.slice(0, 3).map((material, index) => (
                  <div key={material.id} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Low Stock Alert</div>
                      <div className="text-xs text-muted-foreground">
                        {material.name} running low ({material.currentStock} {material.unit} remaining, min: {material.minimumStock} {material.unit})
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-sm font-medium">All Stock Levels Good</div>
                    <div className="text-xs text-muted-foreground">
                      No materials are currently below minimum stock levels
                    </div>
                  </div>
                </div>
              )}
              
              {/* Mock alerts for other systems */}
              <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-medium">System Status</div>
                  <div className="text-xs text-muted-foreground">
                    All production systems running normally
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}