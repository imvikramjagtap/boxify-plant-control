import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Receipt, 
  Clock, 
  CheckCircle, 
  IndianRupee, 
  Search, 
  Eye, 
  Truck, 
  AlertCircle,
  MoreVertical,
  Calendar,
  Settings2,
  PackageCheck
} from "lucide-react";
import { updateSalesOrderStatus, approveSalesOrder } from "@/store/slices/salesOrderSlice";
import { selectAllClients } from "@/store/slices/clientsSlice";
import { format } from "date-fns";
import { toast } from "sonner";

export default function SalesOrders() {
  const dispatch = useDispatch();
  const orders = useSelector((state: any) => state.salesOrders.orders);
  const clients = useSelector(selectAllClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || clientId;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o: any) => 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(o.clientId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm, clients]);

  const handleStatusUpdate = (orderId: string, status: any) => {
    dispatch(updateSalesOrderStatus({ id: orderId, status }));
    toast.success(`Order ${orderId} moved to ${status.replace('_', ' ')}`);
  };

  const handleApprove = (orderId: string) => {
    dispatch(approveSalesOrder({ id: orderId, approvedBy: "Current User" }));
    toast.success(`Order ${orderId} confirmed and sent to production`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'confirmed': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Confirmed</Badge>;
      case 'in_production': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">In Production</Badge>;
      case 'ready_to_ship': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Ready to Ship</Badge>;
      case 'shipped': return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">Shipped</Badge>;
      case 'delivered': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Delivered</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Order Acceptance</h1>
          <p className="text-muted-foreground mt-1">
            Manage incoming orders and track their progress from acceptance to delivery.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Production Schedule
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "New Orders", desc: "Awaiting confirmation", icon: Receipt, count: orders.filter((o: any) => o.status === 'draft').length, color: "text-blue-500" },
          { title: "In Production", desc: "On factory floor", icon: Clock, count: orders.filter((o: any) => o.status === 'in_production').length, color: "text-amber-500" },
          { title: "Ready for Ship", desc: "Waiting for dispatch", icon: PackageCheck, count: orders.filter((o: any) => o.status === 'ready_to_ship').length, color: "text-purple-500" },
          { title: "Revenue", desc: "Total order value", icon: IndianRupee, count: "₹4.8M", color: "text-green-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
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
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Active Orders</CardTitle>
              <CardDescription>Track the lifecycle of your sales orders.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                placeholder="Search orders, clients..." 
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? filteredOrders.map((order: any) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs font-bold text-blue-700">
                      {order.id}
                      <div className="text-[10px] text-muted-foreground font-normal">Ref: {order.quotationId || 'No Quote'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-900">{getClientName(order.clientId)}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(order.orderDate), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-amber-600">
                      {format(new Date(order.expectedDeliveryDate), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setSelectedOrderId(order.id);
                          setIsViewDialogOpen(true);
                        }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === 'draft' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleApprove(order.id)}
                            title="Confirm Order"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {order.status === 'confirmed' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => handleStatusUpdate(order.id, 'in_production')}
                            title="Start Production"
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        )}
                        {order.status === 'in_production' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            onClick={() => handleStatusUpdate(order.id, 'ready_to_ship')}
                            title="Mark Ready"
                          >
                            <PackageCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Receipt className="h-8 w-8 mb-2 opacity-20" />
                        <p>No active orders found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Summary: {selectedOrderId}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">Detailed View Coming Soon</h3>
            <p className="text-sm text-muted-foreground/70 max-w-sm mt-1">
              Currently, you can manage statuses from the list view. A detailed order breakdown is under development.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
