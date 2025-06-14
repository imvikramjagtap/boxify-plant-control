import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, DollarSign, Truck } from "lucide-react";
import { format } from "date-fns";

interface PODashboardProps {
  purchaseOrders: any[];
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element;
}

export default function PODashboard({ purchaseOrders, getStatusColor, getStatusIcon }: PODashboardProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total POs</p>
                <p className="text-2xl font-bold">{purchaseOrders.length}</p>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{purchaseOrders.filter(po => po.status === "pending").length}</p>
                <p className="text-xs text-red-500">Requires attention</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹{(purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0) / 100000).toFixed(1)}L</p>
                <p className="text-xs text-green-500">+8% from last month</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Delivery Time</p>
                <p className="text-2xl font-bold">7 days</p>
                <p className="text-xs text-muted-foreground">Within target</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {purchaseOrders.slice(0, 5).map((po) => (
                <div key={po.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(po.status)}
                      <div>
                        <p className="font-medium">{po.id}</p>
                        <p className="text-sm text-muted-foreground">{po.supplier.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{po.totalAmount.toLocaleString()}</p>
                    <Badge variant="outline" className={getStatusColor(po.status)}>
                      {po.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: "approved", count: purchaseOrders.filter(po => po.status === "approved").length },
                { status: "pending", count: purchaseOrders.filter(po => po.status === "pending").length },
                { status: "delivered", count: purchaseOrders.filter(po => po.status === "delivered").length },
                { status: "draft", count: purchaseOrders.filter(po => po.status === "draft").length },
                { status: "rejected", count: purchaseOrders.filter(po => po.status === "rejected").length },
              ].map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(item.status)} text-white`}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1 capitalize">{item.status}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getStatusColor(item.status)}`}
                        style={{ width: `${Math.max((item.count / purchaseOrders.length) * 100, 5)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}