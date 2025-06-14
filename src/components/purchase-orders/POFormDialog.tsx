import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  FileText,
  Truck,
  DollarSign,
  Package,
  Calculator,
  Trash2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { POItem, PurchaseOrder } from "@/store/types";

interface POFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (poData: any) => void;
  suppliers: any[];
  rawMaterials: any[];
  editingPO?: any;
  defaultCompanyAddress: string;
}

interface NewPOState {
  supplierId: string;
  expectedDelivery: string;
  terms: string;
  notes: string;
  items: Array<{ materialId: string; quantity: number; rate: number; total: number; unit: string }>;
  paymentMethod: "cash" | "cheque" | "neft" | "rtgs" | "online";
  creditDays: number;
  advancePercentage: number;
  deliveryAddress: string;
  contactPerson: string;
  contactPhone: string;
  partialDeliveryAllowed: boolean;
  tdsRate: number;
  gstRate: number;
}

export default function POFormDialog({
  isOpen,
  onClose,
  onSubmit,
  suppliers,
  rawMaterials,
  editingPO,
  defaultCompanyAddress
}: POFormDialogProps) {
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);
  const [newPO, setNewPO] = useState<NewPOState>({
    supplierId: "",
    expectedDelivery: "",
    terms: "",
    notes: "",
    items: [{ materialId: "", quantity: 0, rate: 0, total: 0, unit: "" }],
    paymentMethod: "neft" as const,
    creditDays: 30,
    advancePercentage: 0,
    deliveryAddress: defaultCompanyAddress,
    contactPerson: "",
    contactPhone: "",
    partialDeliveryAllowed: true,
    tdsRate: 2,
    gstRate: 0
  });

  const selectedSupplier = suppliers.find(s => s.id === newPO.supplierId);
  const availableMaterials = selectedSupplier 
    ? rawMaterials.filter(m => 
        m.suppliers && m.suppliers.some(supplier => supplier.supplierId === selectedSupplier.id)
      )
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

  const calculateTaxes = () => {
    const subtotal = getTotalAmount();
    const gstAmount = subtotal * ((newPO.gstRate || 0) / 100);
    const tdsAmount = subtotal * (newPO.tdsRate / 100);
    const totalAfterTax = subtotal + gstAmount - tdsAmount;
    
    return {
      subtotal,
      gstAmount,
      tdsAmount,
      tdsRate: newPO.tdsRate,
      totalAfterTax
    };
  };

  const resetForm = () => {
    setNewPO({
      supplierId: "",
      expectedDelivery: "",
      terms: "",
      notes: "",
      items: [{ materialId: "", quantity: 0, rate: 0, total: 0, unit: "" }],
      paymentMethod: "neft" as const,
      creditDays: 30,
      advancePercentage: 0,
      deliveryAddress: defaultCompanyAddress,
      contactPerson: "",
      contactPhone: "",
      partialDeliveryAllowed: true,
      tdsRate: 2,
      gstRate: 0
    });
  };

  const handleSubmit = () => {
    onSubmit({ newPO, selectedSupplier, calculateTaxes, getTotalAmount });
    if (!editingPO) {
      resetForm();
    }
  };

  const handleClose = () => {
    onClose();
    if (!editingPO) {
      resetForm();
    }
  };

  // Set form data when editing
  React.useEffect(() => {
    if (editingPO && isOpen) {
      setNewPO({
        supplierId: editingPO.supplier.id,
        expectedDelivery: editingPO.expectedDelivery.split('T')[0],
        terms: editingPO.terms || "",
        notes: editingPO.notes || "",
        items: editingPO.items.map(item => ({
          materialId: item.materialId,
          quantity: item.quantity,
          rate: item.rate,
          total: item.total,
          unit: item.unit
        })),
        paymentMethod: editingPO.paymentTerms?.paymentMethod || "neft",
        creditDays: editingPO.paymentTerms?.creditDays || 30,
        advancePercentage: editingPO.paymentTerms?.advancePercentage || 0,
        deliveryAddress: editingPO.deliveryDetails?.deliveryAddress || defaultCompanyAddress,
        contactPerson: editingPO.deliveryDetails?.contactPerson || "",
        contactPhone: editingPO.deliveryDetails?.contactPhone || "",
        partialDeliveryAllowed: editingPO.deliveryDetails?.partialDeliveryAllowed ?? true,
        tdsRate: editingPO.taxCalculation?.tdsRate || 2,
        gstRate: editingPO.items[0]?.gstRate || 0
      });
    }
  }, [editingPO, isOpen, defaultCompanyAddress]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {editingPO ? `Edit Purchase Order - ${editingPO.id}` : "Create New Purchase Order"}
          </DialogTitle>
          <DialogDescription>
            {editingPO ? "Update the details below to modify the purchase order." : "Create a new purchase order for raw materials"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Header Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Basic Information
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
                          <CommandInput placeholder="Search suppliers..." />
                          <CommandEmpty>No supplier found.</CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {suppliers.map((supplier) => (
                                <CommandItem
                                  key={supplier.id}
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
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Financial & Payment Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={newPO.paymentMethod}
                      onValueChange={(value: any) => setNewPO(prev => ({ ...prev, paymentMethod: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="neft">NEFT</SelectItem>
                        <SelectItem value="rtgs">RTGS</SelectItem>
                        <SelectItem value="online">Online Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="creditDays">Credit Days</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newPO.creditDays}
                      onChange={(e) => setNewPO(prev => ({ ...prev, creditDays: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="advancePercentage">Advance Payment (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={newPO.advancePercentage}
                      onChange={(e) => setNewPO(prev => ({ ...prev, advancePercentage: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstRate">GST Rate (%)</Label>
                    <Select
                      value={newPO.gstRate.toString()}
                      onValueChange={(value) => setNewPO(prev => ({ ...prev, gstRate: parseFloat(value) || 0 }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select GST rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0% (Exempt)</SelectItem>
                        <SelectItem value="5">5% (Essential goods)</SelectItem>
                        <SelectItem value="12">12% (Standard rate)</SelectItem>
                        <SelectItem value="18">18% (Standard rate)</SelectItem>
                        <SelectItem value="28">28% (Luxury goods)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tdsRate">TDS Rate (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      step="0.1"
                      value={newPO.tdsRate}
                      onChange={(e) => setNewPO(prev => ({ ...prev, tdsRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deliveryAddress">Delivery Address</Label>
                  <Textarea
                    id="deliveryAddress"
                    placeholder="Delivery address (default: company address)"
                    value={newPO.deliveryAddress}
                    onChange={(e) => setNewPO(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      placeholder="Contact person name"
                      value={newPO.contactPerson}
                      onChange={(e) => setNewPO(prev => ({ ...prev, contactPerson: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      placeholder="Contact phone number"
                      value={newPO.contactPhone}
                      onChange={(e) => setNewPO(prev => ({ ...prev, contactPhone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="partialDelivery"
                    checked={newPO.partialDeliveryAllowed}
                    onChange={(e) => setNewPO(prev => ({ ...prev, partialDeliveryAllowed: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="partialDelivery">Allow Partial Delivery</Label>
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
                  <div className="flex justify-between text-sm">
                    <span>GST ({newPO.gstRate || 0}%):</span>
                    <span>₹{calculateTaxes().gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600">
                    <span>TDS ({newPO.tdsRate}%):</span>
                    <span>-₹{calculateTaxes().tdsAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Amount:</span>
                    <span>₹{calculateTaxes().totalAfterTax.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="secondary">
            Save Draft
          </Button>
          <Button onClick={handleSubmit}>
            {editingPO ? "Update PO" : "Create PO"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}