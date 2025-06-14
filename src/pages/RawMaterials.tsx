import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Search, Package, AlertTriangle, TrendingDown, Eye, Settings, Check, ChevronsUpDown, ArrowUpDown, Filter, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  addMaterial, 
  updateMaterial,
  deleteMaterial
} from "@/store/slices/rawMaterialsSlice";
import MaterialForm from "@/components/forms/MaterialForm";
import { RawMaterial, StockMovement } from "@/store/types";

const productTypes = [
  "Corrugated Sheets",
  "Adhesive & Glue", 
  "Stitching Wire",
  "Printing Ink",
  "Packaging Material",
  "Lamination Material",
  "Die Cutting Tools",
  "Quality Control Equipment"
];

// Remove mock suppliers - we'll use Redux store

const unitsByProductType = {
  "Corrugated Sheets": ["Pieces", "Sq.Ft"],
  "Adhesive & Glue": ["KG", "Liters"], 
  "Stitching Wire": ["KG", "Rolls"],
  "Printing Ink": ["KG", "Liters"],
  "Packaging Material": ["Pieces", "KG"],
  "Lamination Material": ["Rolls", "Sq.Ft"],
  "Die Cutting Tools": ["Pieces"],
  "Quality Control Equipment": ["Pieces"]
};


export default function RawMaterials() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [activeTab, setActiveTab] = useState("materials");
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [movementSort, setMovementSort] = useState<"date" | "material" | "type">("date");
  const [movementSortOrder, setMovementSortOrder] = useState<"asc" | "desc">("desc");
  const [materialFilter, setMaterialFilter] = useState<string>("all");

  // Get data from Redux store with safe defaults
  const materials = useAppSelector((state: any) => state.rawMaterials?.materials || []);
  const suppliers = useAppSelector((state: any) => state.suppliers?.suppliers || []);
  const stockMovements = useAppSelector((state: any) => state.stockMovements?.movements || []);

  const [formData, setFormData] = useState({
    name: "",
    productType: "",
    specifications: {} as Record<string, string>,
    unit: "",
    currentStock: 0,
    minimumStock: 0,
    unitPrice: 0,
    supplierId: "",
    supplierName: "",
    batchNumber: "",
    manufacturingDate: "",
    receivedDate: ""
  });

  const [stockMovementData, setStockMovementData] = useState({
    type: "IN" as "IN" | "OUT",
    quantity: 0,
    reason: "",
    jobId: "",
    poNumber: "",
    notes: ""
  });

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.productType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = productFilter === "all" || material.productType === productFilter;
    const matchesStatus = statusFilter === "all" || material.status === statusFilter;
    return matchesSearch && matchesProduct && matchesStatus;
  });

  const lowStockMaterials = materials.filter(m => m.currentStock <= m.minimumStock);
  const totalInventoryValue = materials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0);

  // Filter suppliers based on selected product type
  const filteredSuppliers = suppliers.filter(supplier => 
    !formData.productType || supplier.productType === formData.productType
  );

  const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Out of Stock":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleAddMaterial = (data: any) => {
    dispatch(addMaterial(data));
    
    toast({
      title: "Raw Material Added", 
      description: "New raw material has been successfully added to inventory.",
    });
    
    setIsDialogOpen(false);
  };

  const handleEditMaterial = (data: any) => {
    if (!selectedMaterial) return;
    
    dispatch(updateMaterial({
      id: selectedMaterial.id,
      updates: data
    }));
    
    toast({
      title: "Material Updated", 
      description: "Raw material has been successfully updated.",
    });
    
    setIsEditDialogOpen(false);
    setSelectedMaterial(null);
  };

  const handleDeleteMaterial = (materialId: string) => {
    if (confirm("Are you sure you want to delete this material? This action cannot be undone.")) {
      dispatch(deleteMaterial(materialId));
      
      toast({
        title: "Material Deleted", 
        description: "Raw material has been successfully deleted.",
        variant: "destructive"
      });
    }
  };

  const handleStockMovement = () => {
    const movement = {
      materialId: selectedMaterial!.id,
      type: stockMovementData.type,
      quantity: stockMovementData.quantity,
      reason: stockMovementData.reason,
      jobId: stockMovementData.jobId,
      poNumber: stockMovementData.poNumber,
      notes: stockMovementData.notes,
      date: new Date().toISOString().split('T')[0],
      createdBy: "System"
    };

    // Add stock movement to Redux
    dispatch({ type: 'stockMovements/addStockMovement', payload: movement });

    // Update material stock in Redux
    dispatch({ 
      type: 'rawMaterials/updateStock', 
      payload: { 
        id: selectedMaterial!.id, 
        quantity: stockMovementData.quantity, 
        type: stockMovementData.type 
      } 
    });
    
    toast({
      title: "Stock Updated",
      description: `Stock ${stockMovementData.type === "IN" ? "increased" : "decreased"} successfully.`,
    });
    
    setIsStockDialogOpen(false);
    setSelectedMaterial(null);
    setStockMovementData({
      type: "IN",
      quantity: 0,
      reason: "",
      jobId: "",
      poNumber: "",
      notes: ""
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      productType: "",
      specifications: {},
      unit: "",
      currentStock: 0,
      minimumStock: 0,
      unitPrice: 0,
      supplierId: "",
      supplierName: "",
      batchNumber: "",
      manufacturingDate: "",
      receivedDate: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Raw Materials Inventory</h1>
          <p className="text-muted-foreground">
            Manage your raw material stock and track inventory movements
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Raw Material</DialogTitle>
            </DialogHeader>
            <MaterialForm
              mode="add"
              onSubmit={handleAddMaterial}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Material Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Raw Material</DialogTitle>
            </DialogHeader>
            <MaterialForm
              mode="edit"
              initialData={selectedMaterial}
              onSubmit={handleEditMaterial}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedMaterial(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockMaterials.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalInventoryValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Movements</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockMovements.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {productTypes.map((product) => (
                  <SelectItem key={product} value={product}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Materials Grid */}
          {filteredMaterials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Package className="h-16 w-16 text-muted-foreground" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">No materials found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || productFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search criteria or filters"
                    : "Get started by adding your first raw material"
                  }
                </p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{material.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{material.id}</p>
                      </div>
                      <Badge className={getStatusColor(material.status)}>
                        {material.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Product Type</p>
                      <p className="text-sm text-muted-foreground">{material.productType}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Stock Level</p>
                      <p className="text-sm text-muted-foreground">
                        {material.currentStock} {material.unit} 
                        <span className="text-xs ml-2">(Min: {material.minimumStock})</span>
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Primary Supplier</p>
                      <p className="text-sm text-muted-foreground">
                        {material.suppliers?.find(s => s.isPrimary)?.supplierName || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Batch & Date</p>
                      <p className="text-sm text-muted-foreground">
                        {material.batchNumber} - {material.receivedDate}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Unit Price</p>
                      <p className="text-sm text-muted-foreground">₹{material.unitPrice}</p>
                    </div>
                    
                    <div className="flex justify-between pt-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedMaterial(material);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedMaterial(material);
                          setIsStockDialogOpen(true);
                        }}
                      >
                        <Package className="h-3 w-3 mr-1" />
                        Stock
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedMaterial(material);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          {/* Sort and Filter Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (movementSort === "date") {
                    setMovementSortOrder(movementSortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setMovementSort("date");
                    setMovementSortOrder("desc");
                  }
                }}
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                Sort by Date {movementSort === "date" && (movementSortOrder === "asc" ? "↑" : "↓")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (movementSort === "material") {
                    setMovementSortOrder(movementSortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setMovementSort("material");
                    setMovementSortOrder("asc");
                  }
                }}
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                Sort by Material {movementSort === "material" && (movementSortOrder === "asc" ? "↑" : "↓")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (movementSort === "type") {
                    setMovementSortOrder(movementSortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setMovementSort("type");
                    setMovementSortOrder("asc");
                  }
                }}
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                Sort by Type {movementSort === "type" && (movementSortOrder === "asc" ? "↑" : "↓")}
              </Button>
            </div>
            <Select value={materialFilter} onValueChange={setMaterialFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Materials</SelectItem>
                {materials.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {stockMovements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Package className="h-16 w-16 text-muted-foreground" />
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">No stock movements recorded</h3>
                  <p className="text-muted-foreground">
                    Stock movements will appear here when materials are added or consumed
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {stockMovements
                  .filter(movement => materialFilter === "all" || movement.materialId === materialFilter)
                  .sort((a, b) => {
                    if (movementSort === "date") {
                      const comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                      return movementSortOrder === "asc" ? comparison : -comparison;
                    } else if (movementSort === "material") {
                      const materialA = materials.find(m => m.id === a.materialId)?.name || "";
                      const materialB = materials.find(m => m.id === b.materialId)?.name || "";
                      const comparison = materialA.localeCompare(materialB);
                      return movementSortOrder === "asc" ? comparison : -comparison;
                    } else if (movementSort === "type") {
                      const comparison = a.type.localeCompare(b.type);
                      return movementSortOrder === "asc" ? comparison : -comparison;
                    }
                    return 0;
                  })
                  .map((movement) => {
                    const material = materials.find(m => m.id === movement.materialId);
                    return (
                    <Card key={movement.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant={movement.type === "IN" ? "default" : "secondary"}>
                                {movement.type}
                              </Badge>
                              <span className="font-medium">{material?.name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {movement.quantity} {material?.unit} - {movement.reason}
                            </p>
                            {movement.notes && (
                              <p className="text-xs text-muted-foreground">{movement.notes}</p>
                            )}
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>{movement.date}</p>
                            {movement.poNumber && <p>PO: {movement.poNumber}</p>}
                            {movement.jobId && <p>Job: {movement.jobId}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Stock Movement Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock - {selectedMaterial?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Movement Type</Label>
              <Select
                value={stockMovementData.type}
                onValueChange={(value: "IN" | "OUT") => setStockMovementData({ ...stockMovementData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">Stock IN (Purchase/Receive)</SelectItem>
                  <SelectItem value="OUT">Stock OUT (Consumption/Issue)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="quantity">Quantity ({selectedMaterial?.unit})</Label>
              <Input
                id="quantity"
                type="number"
                value={stockMovementData.quantity}
                onChange={(e) => setStockMovementData({ ...stockMovementData, quantity: parseInt(e.target.value) || 0 })}
                placeholder="Enter quantity"
              />
            </div>
            
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={stockMovementData.reason}
                onChange={(e) => setStockMovementData({ ...stockMovementData, reason: e.target.value })}
                placeholder="Enter reason for stock movement"
              />
            </div>
            
            {stockMovementData.type === "IN" && (
              <div>
                <Label htmlFor="poNumber">PO Number (Optional)</Label>
                <Input
                  id="poNumber"
                  value={stockMovementData.poNumber}
                  onChange={(e) => setStockMovementData({ ...stockMovementData, poNumber: e.target.value })}
                  placeholder="Enter purchase order number"
                />
              </div>
            )}
            
            {stockMovementData.type === "OUT" && (
              <div>
                <Label htmlFor="jobId">Job ID (Optional)</Label>
                <Input
                  id="jobId"
                  value={stockMovementData.jobId}
                  onChange={(e) => setStockMovementData({ ...stockMovementData, jobId: e.target.value })}
                  placeholder="Enter job card ID"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={stockMovementData.notes}
                onChange={(e) => setStockMovementData({ ...stockMovementData, notes: e.target.value })}
                placeholder="Additional notes"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStockMovement}>
              Update Stock
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Material Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Material Details - {selectedMaterial?.name}</DialogTitle>
          </DialogHeader>
          {selectedMaterial && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Material ID</Label>
                  <p className="text-sm text-muted-foreground">{selectedMaterial.id}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedMaterial.status)}>
                    {selectedMaterial.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Product Type</Label>
                  <p className="text-sm text-muted-foreground">{selectedMaterial.productType}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Unit</Label>
                  <p className="text-sm text-muted-foreground">{selectedMaterial.unit}</p>
                </div>
              </div>

              {selectedMaterial.specifications && Object.keys(selectedMaterial.specifications).length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Specifications</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedMaterial.specifications || {}).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-muted-foreground capitalize">{key}:</span>
                          <span className="text-sm">{String(value)}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Current Stock</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedMaterial.currentStock} {selectedMaterial.unit}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Minimum Stock</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedMaterial.minimumStock} {selectedMaterial.unit}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Unit Price</Label>
                  <p className="text-sm text-muted-foreground">₹{selectedMaterial.unitPrice}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Total Value</Label>
                  <p className="text-sm text-muted-foreground">
                    ₹{(selectedMaterial.currentStock * selectedMaterial.unitPrice).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Primary Supplier</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedMaterial.suppliers?.find(s => s.isPrimary)?.supplierName || 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Batch Number</Label>
                  <p className="text-sm text-muted-foreground">{selectedMaterial.batchNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Manufacturing Date</Label>
                  <p className="text-sm text-muted-foreground">{selectedMaterial.manufacturingDate}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Received Date</Label>
                  <p className="text-sm text-muted-foreground">{selectedMaterial.receivedDate}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Material
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    handleDeleteMaterial(selectedMaterial.id);
                    setSelectedMaterial(null);
                  }}
                >
                  Delete Material
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}