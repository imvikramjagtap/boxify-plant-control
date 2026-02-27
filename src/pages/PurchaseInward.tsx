import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowDownToLine, 
  Package, 
  ClipboardCheck, 
  Truck, 
  Plus, 
  Search, 
  FileText, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  History
} from "lucide-react";
import { selectAllInwards, addInward } from "@/store/slices/purchaseInwardSlice";
import { selectAllPurchaseOrders, updateItemDelivery } from "@/store/slices/purchaseOrdersSlice";
import { updateStock } from "@/store/slices/rawMaterialsSlice";
import { addStockMovement } from "@/store/slices/stockMovementsSlice";
import { RootState } from "@/store";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PurchaseInward() {
  const dispatch = useDispatch();
  const inwards = useSelector(selectAllInwards);
  const purchaseOrders = useSelector(selectAllPurchaseOrders);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState<string>("");
  const [inwardItems, setInwardItems] = useState<any[]>([]);

  // Filter POs that are ready for inward (Sent, Acknowledged, or already Delivered/Partial)
  const availablePOs = useMemo(() => {
    return purchaseOrders.filter(po => 
      ["sent", "acknowledged", "delivered"].includes(po.status)
    );
  }, [purchaseOrders]);

  const selectedPO = useMemo(() => {
    return purchaseOrders.find(po => po.id === selectedPOId);
  }, [purchaseOrders, selectedPOId]);

  const handlePOChange = (poId: string) => {
    setSelectedPOId(poId);
    const po = purchaseOrders.find(p => p.id === poId);
    if (po) {
      // Pre-fill items from PO
      const items = po.items.map(item => ({
        id: item.id,
        materialId: item.materialId,
        materialName: item.materialName,
        orderedQty: item.quantity,
        deliveredSoFar: item.deliveredQuantity || 0,
        receivedQty: 0,
        acceptedQty: 0,
        rejectedQty: 0,
        rejectionReason: "",
        unit: item.unit,
        rate: item.rate
      }));
      setInwardItems(items);
    }
  };

  const handleItemChange = (itemId: string, field: string, value: any) => {
    setInwardItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        // Auto-calculate rejected if accepted changes and vice versa
        if (field === 'acceptedQty') {
          updated.rejectedQty = Math.max(0, updated.receivedQty - value);
        } else if (field === 'rejectedQty') {
          updated.acceptedQty = Math.max(0, updated.receivedQty - value);
        } else if (field === 'receivedQty') {
          updated.acceptedQty = value;
          updated.rejectedQty = 0;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSubmitInward = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPO) return;

    const formData = new FormData(e.currentTarget);
    const grnNumber = `GRN-${Date.now().toString().slice(-6)}`;
    
    const newInward = {
      poId: selectedPO.id,
      supplierId: selectedPO.supplier.id,
      supplierName: selectedPO.supplier.name,
      receivedDate: new Date().toISOString(),
      items: inwardItems.map(item => ({
        id: item.id,
        materialId: item.materialId,
        materialName: item.materialName,
        orderedQty: item.orderedQty,
        receivedQty: Number(item.receivedQty),
        acceptedQty: Number(item.acceptedQty),
        rejectedQty: Number(item.rejectedQty),
        rejectionReason: item.rejectionReason,
        unit: item.unit,
        rate: item.rate
      })),
      grnNumber,
      vehicleNumber: formData.get("vehicleNumber") as string,
      invoiceNumber: formData.get("invoiceNumber") as string,
      invoiceAmount: Number(formData.get("invoiceAmount")),
      qualityCheckStatus: 'completed' as const,
      receivedBy: "Current User",
      notes: formData.get("notes") as string,
      status: 'submitted' as const,
    };

    // 1. Add Inward Record
    dispatch(addInward(newInward));

    // 2. Update PO delivery status & Raw Material Stock per item
    inwardItems.forEach(item => {
      if (item.receivedQty > 0) {
        // Update PO item delivery stats
        dispatch(updateItemDelivery({
          poId: selectedPO.id,
          itemId: item.id,
          deliveredQuantity: Number(item.receivedQty),
          qualityAccepted: Number(item.acceptedQty) > 0,
          grnNumber,
          inspectionNotes: item.rejectionReason
        }));

        // Update Stock (only accepted qty)
        if (Number(item.acceptedQty) > 0) {
          dispatch(updateStock({
            id: item.materialId,
            quantity: Number(item.acceptedQty),
            type: 'IN',
            poId: selectedPO.id
          }));

          // Add Stock Movement
          dispatch(addStockMovement({
            materialId: item.materialId,
            type: 'IN',
            quantity: Number(item.acceptedQty),
            reason: 'Purchase Inward Entry',
            poNumber: selectedPO.id,
            date: new Date().toISOString().split('T')[0],
            notes: `GRN: ${grnNumber} | Accepted from PO`,
            createdBy: 'System'
          }));
        }
      }
    });

    toast.success(`Inward Entry ${grnNumber} recorded successfully`);
    setIsRecordDialogOpen(false);
    setSelectedPOId("");
    setInwardItems([]);
  };

  const filteredInwards = inwards.filter(inw => 
    inw.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inw.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inw.poId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">Purchase Inward Entry</h1>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              Live
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Record incoming materials and perform quality checks against Purchase Orders.
          </p>
        </div>
        <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Inward Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record New Material Inward (GRN)</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitInward} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="poId">Select Purchase Order</Label>
                    <Select value={selectedPOId} onValueChange={handlePOChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Search PO..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePOs.map(po => (
                          <SelectItem key={po.id} value={po.id}>
                            {po.id} - {po.supplier.name} ({format(new Date(po.date), 'dd MMM')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                      <Input id="vehicleNumber" name="vehicleNumber" placeholder="MH-01-AB-1234" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="invoiceNumber">Invoice/Challan No.</Label>
                      <Input id="invoiceNumber" name="invoiceNumber" placeholder="INV/24-25/001" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="invoiceAmount">Invoice Amount (₹)</Label>
                    <Input id="invoiceAmount" name="invoiceAmount" type="number" placeholder="0.00" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Delivery Notes</Label>
                    <Textarea id="notes" name="notes" placeholder="Any specific notes about delivery condition..." rows={2} />
                  </div>
                </div>
              </div>

              {selectedPO && (
                <Card className="border-blue-100 bg-blue-50/30">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Items in {selectedPO.id}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0">
                    <Table>
                      <TableHeader className="bg-white/50">
                        <TableRow className="text-[10px] uppercase">
                          <TableHead>Material</TableHead>
                          <TableHead className="text-center">Ordered</TableHead>
                          <TableHead className="text-center">Recv. So Far</TableHead>
                          <TableHead className="w-[100px] text-center">Received Now</TableHead>
                          <TableHead className="w-[100px] text-center">Accepted</TableHead>
                          <TableHead className="w-[100px] text-center">Rejected</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inwardItems.map((item) => (
                          <TableRow key={item.id} className="bg-white/80">
                            <TableCell className="py-2">
                              <div className="text-sm font-medium">{item.materialName}</div>
                              <div className="text-[10px] text-muted-foreground">{item.unit}</div>
                            </TableCell>
                            <TableCell className="text-center text-sm">{item.orderedQty}</TableCell>
                            <TableCell className="text-center text-sm text-blue-600 font-semibold">{item.deliveredSoFar}</TableCell>
                            <TableCell className="py-1">
                              <Input 
                                type="number" 
                                className="h-8 text-center" 
                                value={item.receivedQty} 
                                onChange={(e) => handleItemChange(item.id, 'receivedQty', Number(e.target.value))}
                              />
                            </TableCell>
                            <TableCell className="py-1">
                              <Input 
                                type="number" 
                                className="h-8 text-center border-green-200 text-green-700" 
                                value={item.acceptedQty}
                                onChange={(e) => handleItemChange(item.id, 'acceptedQty', Number(e.target.value))}
                              />
                            </TableCell>
                            <TableCell className="py-1">
                              <Input 
                                type="number" 
                                className="h-8 text-center border-red-200 text-red-700" 
                                value={item.rejectedQty}
                                onChange={(e) => handleItemChange(item.id, 'rejectedQty', Number(e.target.value))}
                              />
                            </TableCell>
                            <TableCell className="py-1">
                              <Input 
                                className="h-8 text-xs" 
                                placeholder="Reason..." 
                                value={item.rejectionReason}
                                onChange={(e) => handleItemChange(item.id, 'rejectionReason', e.target.value)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsRecordDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={!selectedPOId || inwardItems.every(i => i.receivedQty === 0)}>
                  Generate GRN & Update Stock
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Pending POs", desc: "Awaiting delivery", icon: Truck, count: purchaseOrders.filter(po => ["sent", "acknowledged"].includes(po.status)).length, color: "text-amber-500" },
          { title: "Received Total", desc: "Lifetime GRNs", icon: ArrowDownToLine, count: inwards.length, color: "text-blue-500" },
          { title: "Rejected Units", desc: "Quality fails", icon: AlertCircle, count: "—", color: "text-red-500" },
          { title: "Inventory Value", desc: "Active stock", icon: Package, count: "₹2.4L", color: "text-green-500" },
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
              <CardTitle>Inward History (GRNs)</CardTitle>
              <CardDescription>Recent Goods Receipt Notes recorded in the system.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search GRN, Supplier..." 
                className="pl-9" 
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
                  <TableHead>GRN No.</TableHead>
                  <TableHead>PO Reference</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInwards.length > 0 ? [...filteredInwards].reverse().map((inw) => (
                  <TableRow key={inw.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs font-bold text-blue-700">{inw.grnNumber}</TableCell>
                    <TableCell className="text-sm font-medium">{inw.poId}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{inw.supplierName}</div>
                      <div className="text-[10px] text-muted-foreground">{inw.vehicleNumber || 'No vehicle info'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs">
                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                        {format(new Date(inw.receivedDate), 'dd MMM yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {inw.items.length} materials
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {inw.items.reduce((acc, curr) => acc + curr.acceptedQty, 0)} {inw.items[0]?.unit}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center w-fit gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {inw.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <History className="h-8 w-8 mb-2 opacity-20" />
                        <p>No inward entries found.</p>
                        <p className="text-xs mt-1">Generate a new GRN by clicking the button above.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
