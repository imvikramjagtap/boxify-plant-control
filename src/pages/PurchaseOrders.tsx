import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  addPurchaseOrder, 
  updatePurchaseOrder, 
  submitPurchaseOrder,
  sendPurchaseOrder,
  acknowledgePurchaseOrder,
  approvePurchaseOrder,
  rejectPurchaseOrder,
  deliverPurchaseOrder,
  updateItemDelivery, 
  markPOEmailSent, 
  markPOPrinted 
} from "@/store/slices/purchaseOrdersSlice";
import { updateStock } from "@/store/slices/rawMaterialsSlice";
import { addStockMovement } from "@/store/slices/stockMovementsSlice";
import { POItem, PurchaseOrder } from "@/store/types";
import { generatePOEmailTemplate } from "@/utils/poUtils";
import POFormDialog from "@/components/purchase-orders/POFormDialog";
import POListTable from "@/components/purchase-orders/POListTable";
import POViewDialog from "@/components/purchase-orders/POViewDialog";
import PODashboard from "@/components/purchase-orders/PODashboard";
import POApprovals from "@/components/purchase-orders/POApprovals";

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
  // Status icons are handled in individual components
  return null;
};

export default function PurchaseOrders() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("list");
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingPO, setEditingPO] = useState(null);
  
  // Default company address
  const defaultCompanyAddress = "ABC Packaging Solutions Pvt Ltd\n123 Industrial Area, Sector 45\nGurgaon, Haryana - 122001\nIndia";
  
  // Sorting state
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Get data from Redux store
  const suppliers = useAppSelector((state: any) => state.suppliers.suppliers);
  const rawMaterials = useAppSelector((state: any) => state.rawMaterials.materials);
  const purchaseOrders = useAppSelector((state: any) => state.purchaseOrders.orders);
  
  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let aValue, bValue;
    
    // Handle nested properties
    if (sortField === "supplier.name") {
      aValue = a.supplier.name;
      bValue = b.supplier.name;
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }
    
    // Handle date sorting
    if (sortField === "date" || sortField === "expectedDelivery") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    // Handle string sorting
    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSort = (field: string) => {
    setSortField(field);
    setSortDirection(sortField === field && sortDirection === "asc" ? "desc" : "asc");
  };

  const handleCreatePO = (data: any) => {
    const { newPO, selectedSupplier, calculateTaxes, getTotalAmount } = data;
    
    if (!selectedSupplier || newPO.items.some(item => !item.materialId || item.quantity <= 0)) {
      toast({
        title: "Validation Error",
        description: "Please select supplier and ensure all items have valid quantities.",
        variant: "destructive"
      });
      return;
    }

    // If editing, update existing PO
    if (editingPO) {
      const taxCalculation = calculateTaxes();
      
      dispatch(updatePurchaseOrder({
        id: editingPO.id,
        updates: {
          supplier: selectedSupplier,
          expectedDelivery: new Date(newPO.expectedDelivery).toISOString(),
          terms: newPO.terms,
          notes: newPO.notes,
          items: newPO.items.map((item, index) => {
            const material = rawMaterials.find(m => m.id === item.materialId);
            const gstRate = newPO.gstRate || 0;
            const gstAmount = item.total * (gstRate / 100);
            
            return {
              ...editingPO.items[index],
              materialId: item.materialId,
              materialName: material?.name || "",
              quantity: item.quantity,
              rate: item.rate,
              total: item.total,
              unit: item.unit,
              gstRate,
              gstAmount,
            };
          }),
          totalAmount: taxCalculation.totalAfterTax,
          taxCalculation,
          paymentTerms: {
            paymentMethod: newPO.paymentMethod,
            creditDays: newPO.creditDays,
            advancePercentage: newPO.advancePercentage
          },
          deliveryDetails: {
            deliveryAddress: newPO.deliveryAddress || defaultCompanyAddress,
            contactPerson: newPO.contactPerson || "Purchase Manager",
            contactPhone: newPO.contactPhone || "+91-9876543210",
            partialDeliveryAllowed: newPO.partialDeliveryAllowed
          }
        }
      }));
      
      toast({
        title: "Purchase Order Updated",
        description: "Purchase Order has been updated successfully.",
      });
      
      setEditingPO(null);
      setIsCreateDialogOpen(false);
      return;
    }

    const poItems: POItem[] = newPO.items.map((item, index) => {
      const material = rawMaterials.find(m => m.id === item.materialId);
      const gstRate = newPO.gstRate || 0;
      const gstAmount = item.total * (gstRate / 100);
      
      return {
        id: `POI${String(Date.now() + index)}`,
        materialId: item.materialId,
        materialName: material?.name || "",
        quantity: item.quantity,
        rate: item.rate,
        total: item.total,
        unit: item.unit,
        gstRate,
        gstAmount,
        deliveryStatus: "pending",
        deliveredQuantity: 0,
        qualityAccepted: false,
        specifications: material?.specifications ? {
          gsm: parseFloat(material.specifications.gsm) || undefined,
          bf: parseFloat(material.specifications.bf) || undefined,
          ect: parseFloat(material.specifications.ect) || undefined,
          fluteType: material.specifications.fluteType,
          grade: material.specifications.grade,
          thickness: parseFloat(material.specifications.thickness) || undefined,
          moistureContent: parseFloat(material.specifications.moistureContent) || undefined,
          inspectionCriteria: [
            "Visual inspection for defects",
            "Dimensional accuracy check", 
            "Quality parameter testing"
          ]
        } : undefined
      };
    });

    const taxCalculation = calculateTaxes();

    const newPurchaseOrder: Omit<PurchaseOrder, "id"> = {
      supplier: selectedSupplier,
      date: new Date().toISOString(),
      expectedDelivery: new Date(newPO.expectedDelivery).toISOString(),
      status: "draft",
      totalAmount: taxCalculation.totalAfterTax,
      currency: "INR",
      items: poItems,
      requestedBy: "Current User",
      approvedBy: null,
      terms: newPO.terms,
      notes: newPO.notes,
      taxCalculation,
      paymentTerms: {
        paymentMethod: newPO.paymentMethod,
        creditDays: newPO.creditDays,
        advancePercentage: newPO.advancePercentage
      },
      deliveryDetails: {
        deliveryAddress: newPO.deliveryAddress || defaultCompanyAddress,
        contactPerson: newPO.contactPerson || "Purchase Manager",
        contactPhone: newPO.contactPhone || "+91-9876543210",
        partialDeliveryAllowed: newPO.partialDeliveryAllowed
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dispatch(addPurchaseOrder(newPurchaseOrder));
    
    toast({
      title: "Purchase Order Created",
      description: "Purchase Order has been created successfully.",
    });
    
    setIsCreateDialogOpen(false);
  };

  const handleEditPO = (po: any) => {
    if (po.status !== 'draft') {
      toast({
        title: "Cannot Edit",
        description: "Only draft POs can be edited.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingPO(po);
    setIsCreateDialogOpen(true);
  };

  const handleViewPO = (po: any) => {
    setSelectedPO(po);
    setIsViewDialogOpen(true);
  };

  const handleSubmitPO = (po: any) => {
    dispatch(submitPurchaseOrder(po.id));
    toast({
      title: "PO Submitted",
      description: `Purchase Order ${po.id} has been submitted for approval.`,
    });
  };

  const handleApprovePO = (po: any) => {
    dispatch(approvePurchaseOrder({ id: po.id, approvedBy: "Current User" }));
    toast({
      title: "PO Approved",
      description: `Purchase Order ${po.id} has been approved.`,
    });
  };

  const handleRejectPO = (po: any) => {
    dispatch(rejectPurchaseOrder(po.id));
    toast({
      title: "PO Rejected",
      description: `Purchase Order ${po.id} has been rejected.`,
    });
  };

  const handleSendPO = (po: any) => {
    dispatch(sendPurchaseOrder(po.id));
    dispatch(markPOEmailSent(po.id));
    toast({
      title: "PO Sent",
      description: `Purchase Order ${po.id} has been sent to supplier.`,
    });
  };

  const handleCopyEmailTemplate = (po: any) => {
    const template = generatePOEmailTemplate(po);
    navigator.clipboard.writeText(template);
    toast({
      title: "Email Template Copied",
      description: "PO email template has been copied to clipboard.",
    });
  };

  const handleDownloadPO = (po: any) => {
    dispatch(markPOPrinted(po.id));
    toast({
      title: "PO Downloaded",
      description: `Purchase Order ${po.id} has been downloaded.`,
    });
  };

  const handleAcknowledgePO = (po: any) => {
    dispatch(acknowledgePurchaseOrder(po.id));
    toast({
      title: "PO Acknowledged",
      description: `Purchase Order ${po.id} has been acknowledged by supplier.`,
    });
  };

  const handleMarkDelivered = (po: any) => {
    dispatch(deliverPurchaseOrder(po.id));
    toast({
      title: "PO Delivered",
      description: `Purchase Order ${po.id} marked as delivered.`,
    });
  };

  const handlePartialDelivery = (po: any) => {
    setSelectedPO(po);
    setIsViewDialogOpen(true);
  };

  const handleDeliveryUpdate = (itemId: string, deliveredQuantity: number, qualityAccepted: boolean, grnNumber?: string, inspectionNotes?: string) => {
    dispatch(updateItemDelivery({
      poId: selectedPO.id,
      itemId,
      deliveredQuantity,
      qualityAccepted,
      grnNumber,
      inspectionNotes
    }));

    // Update stock in raw materials if quality is accepted
    const item = selectedPO.items.find(i => i.id === itemId);
    if (item && qualityAccepted) {
      dispatch(updateStock({
        id: item.materialId,
        quantity: deliveredQuantity,
        type: 'IN',
        poId: selectedPO.id
      }));

      // Add stock movement record
      dispatch(addStockMovement({
        materialId: item.materialId,
        type: 'IN',
        quantity: deliveredQuantity,
        reason: 'Purchase Order Delivery',
        poNumber: selectedPO.id,
        date: new Date().toISOString().split('T')[0],
        notes: `GRN: ${grnNumber || 'N/A'}`,
        createdBy: 'System'
      }));
    }
    
    toast({
      title: "Delivery Updated",
      description: `Item delivery recorded successfully.`
    });
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
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create PO
          </Button>
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
              <POListTable
                purchaseOrders={filteredPOs}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onEdit={handleEditPO}
                onSubmit={handleSubmitPO}
                onApprove={handleApprovePO}
                onReject={handleRejectPO}
                onSend={handleSendPO}
                onCopyEmailTemplate={handleCopyEmailTemplate}
                onAcknowledge={handleAcknowledgePO}
                onMarkDelivered={handleMarkDelivered}
                onDownload={handleDownloadPO}
                onView={handleViewPO}
                onPartialDelivery={handlePartialDelivery}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <PODashboard 
            purchaseOrders={purchaseOrders}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <POApprovals
            purchaseOrders={purchaseOrders}
            onView={handleViewPO}
            onApprove={handleApprovePO}
            onReject={handleRejectPO}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Reports functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <POFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingPO(null);
        }}
        onSubmit={handleCreatePO}
        suppliers={suppliers}
        rawMaterials={rawMaterials}
        editingPO={editingPO}
        defaultCompanyAddress={defaultCompanyAddress}
      />

      <POViewDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        selectedPO={selectedPO}
        onDownload={handleDownloadPO}
        onSend={handleSendPO}
        onCopyEmailTemplate={handleCopyEmailTemplate}
        onDeliveryUpdate={handleDeliveryUpdate}
      />
    </div>
  );
}