import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Copy,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Truck,
  DollarSign,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Hash,
  Package,
  Calculator,
  Trash2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  supplierService, 
  materialService, 
  purchaseOrderService, 
  type Supplier, 
  type RawMaterial, 
  type PurchaseOrder, 
  type POItem 
} from "@/lib/dataService";


const getStatusColor = (status: string) => {
  switch (status) {
    case "draft": return "bg-secondary";
    case "pending": return "bg-yellow-500";
    case "approved": return "bg-blue-500";
    case "sent": return "bg-purple-500";
    case "acknowledged": return "bg-cyan-500";
    case "delivered": return "bg-green-500";
    case "rejected": return "bg-destructive";
    case "cancelled": return "bg-red-500";
    default: return "bg-secondary";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "draft": return <FileText className="h-3 w-3" />;
    case "pending": return <Clock className="h-3 w-3" />;
    case "approved": return <CheckCircle className="h-3 w-3" />;
    case "sent": return <Send className="h-3 w-3" />;
    case "acknowledged": return <Eye className="h-3 w-3" />;
    case "delivered": return <Truck className="h-3 w-3" />;
    case "rejected": return <XCircle className="h-3 w-3" />;
    case "cancelled": return <AlertTriangle className="h-3 w-3" />;
    default: return <FileText className="h-3 w-3" />;
  }
};

export default function PurchaseOrders() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);
  
  // Data will be loaded from the shared service
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  
  // New PO form state
  const [newPO, setNewPO] = useState({
    supplierId: "",
    expectedDelivery: "",
    terms: "",
    notes: "",
    items: [{ materialId: "", quantity: 0, rate: 0, total: 0, unit: "" }]
  });

  // Load data on component mount
  useEffect(() => {
    setSuppliers(supplierService.getAll());
    setRawMaterials(materialService.getAll());
    setPurchaseOrders(purchaseOrderService.getAll());
  }, []);

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedSupplier = suppliers.find(s => s.id === newPO.supplierId);
  const availableMaterials = selectedSupplier 
    ? rawMaterials.filter(m => m.supplierId === selectedSupplier.id)
    : [];

  const addNewItem = () => {
    setNewPO(prev => ({
      ...prev,
      items: [...prev.items, { materialId: "", quantity: 0, rate: 0, total: 0, unit: "" }]
    }));
  };

  const removeItem = (index: number) => {
    setNewPO(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setNewPO(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      
      // Auto-calculate total when quantity or rate changes
      if (field === "quantity" || field === "rate") {
        updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].rate;
      }
      
      // Auto-fill rate and unit when material is selected
      if (field === "materialId") {
        const material = rawMaterials.find(m => m.id === value);
        if (material) {
          updatedItems[index].rate = material.unitPrice;
          updatedItems[index].unit = material.unit;
          updatedItems[index].total = updatedItems[index].quantity * material.unitPrice;
        }
      }
      
      return { ...prev, items: updatedItems };
    });
  };

  const getTotalAmount = () => {
    return newPO.items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCreatePO = () => {
    if (!selectedSupplier || newPO.items.some(item => !item.materialId || item.quantity <= 0)) {
      toast({
        title: "Validation Error",
        description: "Please select supplier and ensure all items have valid quantities.",
        variant: "destructive"
      });
      return;
    }

    const poItems: POItem[] = newPO.items.map((item, index) => {
      const material = rawMaterials.find(m => m.id === item.materialId);
      return {
        id: `POI${String(Date.now() + index)}`,
        materialId: item.materialId,
        materialName: material?.name || "",
        quantity: item.quantity,
        rate: item.rate,
        total: item.total,
        unit: item.unit
      };
    });

    const newPurchaseOrder: Omit<PurchaseOrder, "id"> = {
      supplier: selectedSupplier,
      date: new Date(),
      expectedDelivery: new Date(newPO.expectedDelivery),
      status: "draft",
      totalAmount: getTotalAmount(),
      currency: "INR",
      items: poItems,
      requestedBy: "Current User", // In real app, get from auth context
      approvedBy: null,
      terms: newPO.terms,
      notes: newPO.notes
    };

    const createdPO = purchaseOrderService.add(newPurchaseOrder);
    setPurchaseOrders(purchaseOrderService.getAll());
    
    toast({
      title: "Purchase Order Created",
      description: `PO ${createdPO.id} has been created successfully.`,
    });
    
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewPO({
      supplierId: "",
      expectedDelivery: "",
      terms: "",
      notes: "",
      items: [{ materialId: "", quantity: 0, rate: 0, total: 0, unit: "" }]
    });
  };

  const handleApprovePO = (po: PurchaseOrder) => {
    purchaseOrderService.approve(po.id, "Current User");
    setPurchaseOrders(purchaseOrderService.getAll());
    toast({
      title: "PO Approved",
      description: `Purchase Order ${po.id} has been approved.`,
    });
  };

  const handleRejectPO = (po: PurchaseOrder) => {
    purchaseOrderService.reject(po.id);
    setPurchaseOrders(purchaseOrderService.getAll());
    toast({
      title: "PO Rejected",
      description: `Purchase Order ${po.id} has been rejected.`,
    });
  };

  const handleMarkDelivered = (po: PurchaseOrder) => {
    purchaseOrderService.update(po.id, { status: "delivered" });
    setPurchaseOrders(purchaseOrderService.getAll());
    setRawMaterials(materialService.getAll()); // Refresh materials to show updated stock
    toast({
      title: "PO Delivered",
      description: `Purchase Order ${po.id} marked as delivered. Stock has been updated.`,
    });
  };

  const handleViewPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage purchase orders and supplier transactions</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create PO
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Create New Purchase Order
                </DialogTitle>
                <DialogDescription>
                  Create a new purchase order for raw materials
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Header Information */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Supplier Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="supplier">Supplier *</Label>
                          <Popover open={supplierSearchOpen} onOpenChange={setSupplierSearchOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={supplierSearchOpen}
                                className="w-full justify-between"
                              >
                                {selectedSupplier ? selectedSupplier.name : "Select supplier..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search suppliers..." className="h-9" />
                                <CommandEmpty>No supplier found.</CommandEmpty>
                                <CommandGroup>
                                  <CommandList>
                                    {suppliers.map((supplier) => (
                                      <CommandItem
                                        key={supplier.id}
                                        value={supplier.name}
                                        onSelect={() => {
                                          setNewPO(prev => ({ 
                                            ...prev, 
                                            supplierId: supplier.id,
                                            items: [{ materialId: "", quantity: 0, rate: 0, total: 0, unit: "" }]
                                          }));
                                          setSupplierSearchOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            newPO.supplierId === supplier.id ? "opacity-100" : "opacity-0"
                                          }`}
                                        />
                                        <div className="flex flex-col">
                                          <span>{supplier.name}</span>
                                          <span className="text-xs text-muted-foreground">{supplier.productType}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandList>
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label htmlFor="expectedDelivery">Expected Delivery *</Label>
                          <Input
                            type="date"
                            value={newPO.expectedDelivery}
                            onChange={(e) => setNewPO(prev => ({ ...prev, expectedDelivery: e.target.value }))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Line Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {newPO.items.map((item, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">Item {index + 1}</h4>
                              {newPO.items.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <Label>Material *</Label>
                                <Select
                                  value={item.materialId}
                                  onValueChange={(value) => updateItem(index, "materialId", value)}
                                  disabled={!selectedSupplier}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={selectedSupplier ? "Select material" : "Select supplier first"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableMaterials.map((material) => (
                                      <SelectItem key={material.id} value={material.id}>
                                        <div className="flex flex-col">
                                          <span>{material.name}</span>
                                          <span className="text-xs text-muted-foreground">
                                            Stock: {material.currentStock} {material.unit} • ₹{material.unitPrice}/{material.unit}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Quantity *</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.quantity || ""}
                                  onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              <div>
                                <Label>Rate (₹)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.rate || ""}
                                  onChange={(e) => updateItem(index, "rate", parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              <div>
                                <Label>Total (₹)</Label>
                                <Input
                                  type="number"
                                  value={item.total.toFixed(2)}
                                  readOnly
                                  className="bg-muted"
                                />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Unit: {item.unit || "N/A"}
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={addNewItem}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="terms">Terms & Conditions</Label>
                        <Textarea
                          id="terms"
                          placeholder="Payment terms, delivery conditions, etc."
                          value={newPO.terms}
                          onChange={(e) => setNewPO(prev => ({ ...prev, terms: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Internal Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Internal notes for reference"
                          value={newPO.notes}
                          onChange={(e) => setNewPO(prev => ({ ...prev, notes: e.target.value }))}
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary Panel */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Order Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Items:</span>
                          <span>{newPO.items.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>₹{getTotalAmount().toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total Amount:</span>
                          <span>₹{getTotalAmount().toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Save as Draft
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="secondary">
                  Save Draft
                </Button>
                <Button onClick={handleCreatePO}>
                  Create PO
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list">PO List</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search POs by number or supplier..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* PO List */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders ({filteredPOs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPOs.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.id}</TableCell>
                      <TableCell>{po.supplier.name}</TableCell>
                      <TableCell>{format(po.date, "dd MMM yyyy")}</TableCell>
                      <TableCell>{format(po.expectedDelivery, "dd MMM yyyy")}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(po.status)} text-white`}>
                          {getStatusIcon(po.status)}
                          <span className="ml-1 capitalize">{po.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>₹{po.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>{po.items.length} items</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewPO(po)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {po.status === "approved" && (
                            <Button variant="ghost" size="sm" onClick={() => handleMarkDelivered(po)}>
                              <Truck className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total POs</p>
                    <p className="text-2xl font-bold">45</p>
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
                    <p className="text-2xl font-bold">8</p>
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
                    <p className="text-2xl font-bold">₹2.4L</p>
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
                    { status: "approved", count: 15, percentage: 33 },
                    { status: "pending", count: 8, percentage: 18 },
                    { status: "delivered", count: 12, percentage: 27 },
                    { status: "draft", count: 6, percentage: 13 },
                    { status: "rejected", count: 4, percentage: 9 },
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
                            style={{ width: `${item.percentage}%` }}
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
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <p className="text-sm text-muted-foreground">Purchase orders requiring your approval</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchaseOrders.filter(po => po.status === "pending").map((po) => (
                  <div key={po.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium">{po.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {po.supplier.name} • ₹{po.totalAmount.toLocaleString()} • {po.items.length} items
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested by {po.requestedBy} on {format(po.date, "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewPO(po)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleRejectPO(po)}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => handleApprovePO(po)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Purchase Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* PO View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Purchase Order Details - {selectedPO?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPO && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Supplier Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Name:</strong> {selectedPO.supplier.name}</div>
                    <div><strong>Email:</strong> {selectedPO.supplier.email}</div>
                    <div><strong>Phone:</strong> {selectedPO.supplier.phone}</div>
                    <div><strong>GST:</strong> {selectedPO.supplier.gstNumber}</div>
                    <div><strong>Address:</strong> {selectedPO.supplier.address}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>PO Number:</strong> {selectedPO.id}</div>
                    <div><strong>Date:</strong> {format(selectedPO.date, "dd MMM yyyy")}</div>
                    <div><strong>Expected Delivery:</strong> {format(selectedPO.expectedDelivery, "dd MMM yyyy")}</div>
                    <div><strong>Status:</strong> 
                      <Badge className={`ml-2 ${getStatusColor(selectedPO.status)} text-white`}>
                        {getStatusIcon(selectedPO.status)}
                        <span className="ml-1 capitalize">{selectedPO.status}</span>
                      </Badge>
                    </div>
                    <div><strong>Requested By:</strong> {selectedPO.requestedBy}</div>
                    {selectedPO.approvedBy && <div><strong>Approved By:</strong> {selectedPO.approvedBy}</div>}
                  </CardContent>
                </Card>
              </div>

              {/* Items Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Rate (₹)</TableHead>
                        <TableHead>Total (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPO.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.materialName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>₹{item.rate.toFixed(2)}</TableCell>
                          <TableCell>₹{item.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Separator className="my-4" />
                  <div className="flex justify-end">
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        Total Amount: ₹{selectedPO.totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Notes */}
              {(selectedPO.terms || selectedPO.notes) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPO.terms && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Terms & Conditions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{selectedPO.terms}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {selectedPO.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{selectedPO.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedPO?.status === "pending" && (
              <>
                <Button variant="destructive" onClick={() => {
                  handleRejectPO(selectedPO);
                  setIsViewDialogOpen(false);
                }}>
                  Reject
                </Button>
                <Button onClick={() => {
                  handleApprovePO(selectedPO);
                  setIsViewDialogOpen(false);
                }}>
                  Approve
                </Button>
              </>
            )}
            {selectedPO?.status === "approved" && (
              <Button onClick={() => {
                handleMarkDelivered(selectedPO);
                setIsViewDialogOpen(false);
              }}>
                Mark as Delivered
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}