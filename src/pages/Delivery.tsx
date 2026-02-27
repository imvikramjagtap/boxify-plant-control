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
  Truck, 
  Package, 
  Clock, 
  CheckCircle, 
  Plus, 
  Search, 
  MapPin, 
  Calendar,
  Box,
  ExternalLink,
  ChevronRight,
  Printer,
  History as LucideHistory
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// Redux
import { updateSalesOrderStatus } from "@/store/slices/salesOrderSlice";
import { selectAllClients } from "@/store/slices/clientsSlice";
import { addShipment, updateShipmentStatus, selectAllShipments } from "@/store/slices/shipmentsSlice";
import { RootState } from "@/store";

export default function Delivery() {
  const dispatch = useDispatch();
  const orders = useSelector((state: any) => state.salesOrders.orders);
  const clients = useSelector(selectAllClients);
  const shipments = useSelector(selectAllShipments);

  const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    orderId: "",
    lrNumber: "",
    transporterName: "",
    vehicleNumber: "",
    notes: ""
  });

  const readyOrders = orders.filter((o: any) => o.status === 'ready_to_ship');
  const activeShipments = shipments.filter(s => s.status === 'in_transit');
  const deliveredShipments = shipments.filter(s => s.status === 'delivered').slice(0, 10);

  const stats = {
    ready: readyOrders.length,
    inTransit: activeShipments.length,
    deliveredToday: deliveredShipments.filter(s => s.deliveryDate === new Date().toISOString().split('T')[0]).length,
    pendingDeliveries: orders.filter((o: any) => o.status === 'confirmed' || o.status === 'in_production').length
  };

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || clientId;
  };

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orderId || !formData.lrNumber || !formData.transporterName) {
      toast.error("Please fill all required fields");
      return;
    }

    const order = orders.find((o: any) => o.id === formData.orderId);
    if (!order) return;

    // 1. Add Shipment
    dispatch(addShipment({
      orderId: formData.orderId,
      clientId: order.clientId,
      lrNumber: formData.lrNumber,
      transporterName: formData.transporterName,
      vehicleNumber: formData.vehicleNumber,
      shipDate: new Date().toISOString().split('T')[0],
      status: 'in_transit',
      notes: formData.notes,
      createdBy: "Admin"
    }));

    // 2. Update Order Status
    dispatch(updateSalesOrderStatus({ id: formData.orderId, status: 'shipped' }));

    toast.success(`Shipment created for Order ${formData.orderId}`);
    setIsShipDialogOpen(false);
    setFormData({ orderId: "", lrNumber: "", transporterName: "", vehicleNumber: "", notes: "" });
  };

  const handleMarkDelivered = (shipmentId: string, orderId: string) => {
    dispatch(updateShipmentStatus({ 
      id: shipmentId, 
      status: 'delivered', 
      deliveryDate: new Date().toISOString().split('T')[0] 
    }));
    dispatch(updateSalesOrderStatus({ id: orderId, status: 'delivered' }));
    toast.success("Delivery confirmed!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Delivery & Dispatch</h1>
          <p className="text-muted-foreground mt-1">
            Manage outgoing shipments, track logistics, and confirm client deliveries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isShipDialogOpen} onOpenChange={setIsShipDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                <Truck className="h-4 w-4 mr-2" />
                Dispatch Ready Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Shipment</DialogTitle>
                <DialogDescription>
                  Enter logistics details for the order being dispatched.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateShipment} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Ready Order *</Label>
                  <Select value={formData.orderId} onValueChange={(val) => setFormData({...formData, orderId: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Order" />
                    </SelectTrigger>
                    <SelectContent>
                      {readyOrders.map((o: any) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.id} - {getClientName(o.clientId)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>LR / Bilty Number *</Label>
                    <Input 
                      placeholder="e.g. 12345678"
                      value={formData.lrNumber}
                      onChange={(e) => setFormData({...formData, lrNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Number</Label>
                    <Input 
                      placeholder="e.g. MH 01 AB 1234"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Transporter Name *</Label>
                  <Input 
                    placeholder="e.g. Blue Dart, Delhivery"
                    value={formData.transporterName}
                    onChange={(e) => setFormData({...formData, transporterName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Special Notes</Label>
                  <Input 
                    placeholder="Driver phone or route info"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsShipDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Confirm Dispatch</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Ready for Dispatch", desc: "Packed in warehouse", icon: Box, count: stats.ready, color: "text-purple-500" },
          { title: "In Transit", desc: "Goods moving", icon: Truck, count: stats.inTransit, color: "text-blue-500" },
          { title: "Confirmed Today", desc: "Delivered to clients", icon: CheckCircle, count: stats.deliveredToday, color: "text-emerald-500" },
          { title: "Upcoming Load", desc: "Upcoming deliveries", icon: Clock, count: stats.pendingDeliveries, color: "text-amber-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow cursor-default">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color} opacity-80`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground font-medium">{stat.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/30">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>In-Transit Shipments</CardTitle>
                <CardDescription>Real-time tracking of goods on their way to clients.</CardDescription>
              </div>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search LR..." className="pl-8 h-8 text-xs" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Ship Date</TableHead>
                  <TableHead>Order / Client</TableHead>
                  <TableHead>LR / Logistics</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeShipments.length > 0 ? activeShipments.map((s) => (
                  <TableRow key={s.id} className="hover:bg-blue-50/20 transition-colors">
                    <TableCell className="text-sm font-medium">
                      {format(new Date(s.shipDate), 'dd MMM')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-blue-700">{s.orderId}</span>
                        <span className="text-xs font-semibold">{getClientName(s.clientId).slice(0, 20)}...</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{s.lrNumber}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{s.transporterName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{s.vehicleNumber || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold text-xs"
                        onClick={() => handleMarkDelivered(s.id, s.orderId)}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Mark Delivered
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center opacity-40">
                        <Truck className="h-10 w-10 mb-2" />
                        <p className="text-sm font-medium">No shipments currently in transit.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/30 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <LucideHistory className="h-4 w-4 text-slate-500" />
                Delivery Ledger
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {deliveredShipments.length > 0 ? deliveredShipments.map((s) => (
                  <div key={s.id} className="p-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">DELIVERED</span>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(s.deliveryDate!), 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{getClientName(s.clientId)}</div>
                    <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                      <span>Order: {s.orderId}</span>
                      <span>LR: {s.lrNumber}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-xs text-muted-foreground italic">
                    No delivery history available yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dispatch Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-blue-100 leading-relaxed">
                Consolidating 3 orders for <span className="font-bold underline">Mumbai Central</span> route could save up to ₹4,500 in freight costs today.
              </p>
              <Button size="sm" variant="secondary" className="w-full mt-4 h-8 bg-white/10 border-white/20 hover:bg-white/20 text-white text-xs">
                Plan Combined Route
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
