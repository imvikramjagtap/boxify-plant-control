import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { RawMaterial, SupplierMaterial } from "@/store/types";

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

const unitsByProductType = {
  "Corrugated Sheets": ["KG", "Nos.", "Liters"],
  "Adhesive & Glue": ["KG", "Liters"], 
  "Stitching Wire": ["KG", "Nos."],
  "Printing Ink": ["KG", "Liters"],
  "Packaging Material": ["Nos.", "KG"],
  "Lamination Material": ["Nos.", "KG"],
  "Die Cutting Tools": ["Nos."],
  "Quality Control Equipment": ["Nos."]
};

// Box manufacturing specific specifications
const corrugatedSpecifications = {
  fluteTypes: ["A", "B", "C", "E", "F", "BC", "EB", "AB"],
  paperGrades: ["Kraft", "Test Liner", "White Top", "Duplex", "Recycled"],
  colors: ["Brown", "White", "Natural", "Colored"]
};

interface MaterialFormProps {
  mode: "add" | "edit";
  initialData?: Partial<RawMaterial>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function MaterialForm({ mode, initialData, onSubmit, onCancel }: MaterialFormProps) {
  const suppliers = useAppSelector((state: any) => state.suppliers.suppliers);
  const materials = useAppSelector((state: any) => state.rawMaterials.materials);
  
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);
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
    receivedDate: "",
    hsnCode: "",
    gstRate: 0,
    qualityParams: {} as Record<string, string>,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && initialData) {
      // Extract primary supplier info for form
      const primarySupplier = initialData.suppliers?.find(s => s.isPrimary);
      setFormData(prev => ({ 
        ...prev, 
        ...initialData,
        supplierId: primarySupplier?.supplierId || "",
        supplierName: primarySupplier?.supplierName || "",
        unitPrice: initialData.unitPrice || primarySupplier?.unitPrice || 0
      }));
    }
  }, [mode, initialData]);

  // Filter suppliers based on selected product type
  const filteredSuppliers = suppliers.filter(supplier => 
    !formData.productType || supplier.productType === formData.productType
  );

  const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Material name is required";
    if (!formData.productType) newErrors.productType = "Product type is required";
    if (!formData.unit) newErrors.unit = "Unit is required";
    if (!formData.supplierId) newErrors.supplierId = "Supplier is required";
    if (!formData.batchNumber.trim()) newErrors.batchNumber = "Batch number is required";
    if (!formData.manufacturingDate) newErrors.manufacturingDate = "Manufacturing date is required";
    if (!formData.receivedDate) newErrors.receivedDate = "Received date is required";
    if (formData.unitPrice <= 0) newErrors.unitPrice = "Unit price must be greater than 0";
    if (formData.currentStock < 0) newErrors.currentStock = "Current stock cannot be negative";
    if (formData.minimumStock < 0) newErrors.minimumStock = "Minimum stock cannot be negative";

    // Check for duplicate names (except when editing same material)
    if (mode === "add" || (mode === "edit" && formData.name !== initialData?.name)) {
      const isDuplicate = materials.some(m => 
        m.name.toLowerCase() === formData.name.toLowerCase() &&
        (mode === "add" || m.id !== initialData?.id)
      );
      if (isDuplicate) newErrors.name = "Material name already exists";
    }

    // Box manufacturing specific validations
    if (formData.productType === "Corrugated Sheets") {
      if (!formData.specifications.gsm) newErrors.gsm = "GSM is required for corrugated sheets";
      if (!formData.specifications.fluteType) newErrors.fluteType = "Flute type is required";
      if (!formData.specifications.paperGrade) newErrors.paperGrade = "Paper grade is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Calculate status based on stock levels
    let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
    if (formData.currentStock === 0) {
      status = "Out of Stock";
    } else if (formData.currentStock <= formData.minimumStock) {
      status = "Low Stock";
    }

    // Calculate risk level based on number of suppliers
    let riskLevel: "Low" | "Medium" | "High" = "High"; // Single supplier = High risk
    
    // Create supplier array
    const suppliers: SupplierMaterial[] = [{
      supplierId: formData.supplierId,
      supplierName: formData.supplierName || selectedSupplier?.name || "",
      isPrimary: true,
      unitPrice: formData.unitPrice,
      leadTimeDays: 7, // Default lead time
      minimumOrderQuantity: 100, // Default MOQ
      qualityScore: 85, // Default quality score
      deliveryPerformance: 90, // Default delivery performance
      priceStability: 80, // Default price stability
      isActive: true
    }];

    const { supplierId, supplierName, qualityParams, ...materialData } = formData;

    onSubmit({
      ...materialData,
      suppliers,
      riskLevel,
      status
    });
  };

  const renderSpecificationFields = () => {
    if (formData.productType === "Corrugated Sheets") {
      return (
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Corrugated Sheet Specifications</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gsm">GSM (grams/sq.meter) *</Label>
              <Input
                id="gsm"
                type="number"
                value={formData.specifications.gsm || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  specifications: { ...formData.specifications, gsm: e.target.value }
                })}
                placeholder="e.g., 125"
                className={errors.gsm ? "border-red-500" : ""}
              />
              {errors.gsm && <p className="text-sm text-red-500">{errors.gsm}</p>}
            </div>
            <div>
              <Label htmlFor="bf">BF (Burst Factor)</Label>
              <Input
                id="bf"
                type="number"
                step="0.1"
                value={formData.specifications.bf || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  specifications: { ...formData.specifications, bf: e.target.value }
                })}
                placeholder="e.g., 14.5"
              />
            </div>
            <div>
              <Label htmlFor="ect">ECT (Edge Crush Test)</Label>
              <Input
                id="ect"
                type="number"
                step="0.1"
                value={formData.specifications.ect || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  specifications: { ...formData.specifications, ect: e.target.value }
                })}
                placeholder="e.g., 4.6"
              />
            </div>
            <div>
              <Label htmlFor="fluteType">Flute Type *</Label>
              <Select
                value={formData.specifications.fluteType || ""}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  specifications: { ...formData.specifications, fluteType: value }
                })}
              >
                <SelectTrigger className={errors.fluteType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select flute type" />
                </SelectTrigger>
                <SelectContent>
                  {corrugatedSpecifications.fluteTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fluteType && <p className="text-sm text-red-500">{errors.fluteType}</p>}
            </div>
            <div>
              <Label htmlFor="paperGrade">Paper Grade *</Label>
              <Select
                value={formData.specifications.paperGrade || ""}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  specifications: { ...formData.specifications, paperGrade: value }
                })}
              >
                <SelectTrigger className={errors.paperGrade ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select paper grade" />
                </SelectTrigger>
                <SelectContent>
                  {corrugatedSpecifications.paperGrades.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paperGrade && <p className="text-sm text-red-500">{errors.paperGrade}</p>}
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Select
                value={formData.specifications.color || ""}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  specifications: { ...formData.specifications, color: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {corrugatedSpecifications.colors.map((color) => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="thickness">Thickness (mm)</Label>
              <Input
                id="thickness"
                type="number"
                step="0.1"
                value={formData.specifications.thickness || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  specifications: { ...formData.specifications, thickness: e.target.value }
                })}
                placeholder="e.g., 5.0"
              />
            </div>
            <div>
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.specifications.dimensions || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  specifications: { ...formData.specifications, dimensions: e.target.value }
                })}
                placeholder="e.g., 48x36 inches"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Quality Parameters</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="moistureContent">Moisture Content (%)</Label>
                <Input
                  id="moistureContent"
                  type="number"
                  step="0.1"
                  value={formData.qualityParams?.moistureContent || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    qualityParams: { ...formData.qualityParams, moistureContent: e.target.value }
                  })}
                  placeholder="e.g., 8.5"
                />
              </div>
              <div>
                <Label htmlFor="qualityGrade">Quality Grade</Label>
                <Select
                  value={formData.qualityParams?.qualityGrade || ""}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    qualityParams: { ...formData.qualityParams, qualityGrade: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A Grade</SelectItem>
                    <SelectItem value="B">B Grade</SelectItem>
                    <SelectItem value="C">C Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="grade">Grade</Label>
          <Input
            id="grade"
            value={formData.specifications.grade || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              specifications: { ...formData.specifications, grade: e.target.value }
            })}
            placeholder="Enter grade"
          />
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={formData.specifications.color || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              specifications: { ...formData.specifications, color: e.target.value }
            })}
            placeholder="Enter color"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Material Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter material name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor="productType">Product Type *</Label>
          <Select
            value={formData.productType}
            onValueChange={(value) => setFormData({ ...formData, productType: value, unit: "", specifications: {} })}
          >
            <SelectTrigger className={errors.productType ? "border-red-500" : ""}>
              <SelectValue placeholder="Select product type" />
            </SelectTrigger>
            <SelectContent>
              {productTypes.map((product) => (
                <SelectItem key={product} value={product}>
                  {product}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.productType && <p className="text-sm text-red-500">{errors.productType}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hsnCode">HSN Code</Label>
          <Input
            id="hsnCode"
            value={formData.hsnCode}
            onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
            placeholder="e.g., 4819"
          />
        </div>
        <div>
          <Label htmlFor="gstRate">GST Rate (%)</Label>
          <Select
            value={formData.gstRate?.toString()}
            onValueChange={(value) => setFormData({ ...formData, gstRate: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select GST Rate" />
            </SelectTrigger>
            <SelectContent>
              {[0, 5, 12, 18, 28].map((rate) => (
                <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.productType && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="unit">Unit *</Label>
            <Select
              value={formData.unit}
              onValueChange={(value) => setFormData({ ...formData, unit: value })}
            >
              <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {unitsByProductType[formData.productType as keyof typeof unitsByProductType]?.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unit && <p className="text-sm text-red-500">{errors.unit}</p>}
          </div>
          <div>
            <Label htmlFor="unitPrice">Unit Price (₹) *</Label>
            <Input
              id="unitPrice"
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              placeholder="Enter unit price"
              className={errors.unitPrice ? "border-red-500" : ""}
            />
            {errors.unitPrice && <p className="text-sm text-red-500">{errors.unitPrice}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currentStock">Current Stock *</Label>
          <Input
            id="currentStock"
            type="number"
            value={formData.currentStock}
            onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
            placeholder="Enter current stock"
            className={errors.currentStock ? "border-red-500" : ""}
          />
          {errors.currentStock && <p className="text-sm text-red-500">{errors.currentStock}</p>}
        </div>
        <div>
          <Label htmlFor="minimumStock">Minimum Stock Level *</Label>
          <Input
            id="minimumStock"
            type="number"
            value={formData.minimumStock}
            onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value) || 0 })}
            placeholder="Enter minimum stock"
            className={errors.minimumStock ? "border-red-500" : ""}
          />
          {errors.minimumStock && <p className="text-sm text-red-500">{errors.minimumStock}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="batchNumber">Batch Number *</Label>
          <Input
            id="batchNumber"
            value={formData.batchNumber}
            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
            placeholder="Enter batch number"
            className={errors.batchNumber ? "border-red-500" : ""}
          />
          {errors.batchNumber && <p className="text-sm text-red-500">{errors.batchNumber}</p>}
        </div>
        <div>
          <Label htmlFor="supplier">Supplier *</Label>
          <Popover open={supplierSearchOpen} onOpenChange={setSupplierSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={supplierSearchOpen}
                className={`w-full justify-between ${errors.supplierId ? "border-red-500" : ""}`}
                disabled={!formData.productType}
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
                    {filteredSuppliers.map((supplier) => (
                      <CommandItem
                        key={supplier.id}
                        value={supplier.name}
                        onSelect={() => {
                          setFormData({ 
                            ...formData, 
                            supplierId: supplier.id, 
                            supplierName: supplier.name 
                          });
                          setSupplierSearchOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            formData.supplierId === supplier.id ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        {supplier.name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {!formData.productType && (
            <p className="text-xs text-muted-foreground mt-1">
              Please select a product type first
            </p>
          )}
          {errors.supplierId && <p className="text-sm text-red-500">{errors.supplierId}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="manufacturingDate">Manufacturing Date *</Label>
          <Input
            id="manufacturingDate"
            type="date"
            value={formData.manufacturingDate}
            onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
            className={errors.manufacturingDate ? "border-red-500" : ""}
          />
          {errors.manufacturingDate && <p className="text-sm text-red-500">{errors.manufacturingDate}</p>}
        </div>
        <div>
          <Label htmlFor="receivedDate">Received Date *</Label>
          <Input
            id="receivedDate"
            type="date"
            value={formData.receivedDate}
            onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
            className={errors.receivedDate ? "border-red-500" : ""}
          />
          {errors.receivedDate && <p className="text-sm text-red-500">{errors.receivedDate}</p>}
        </div>
      </div>

      {formData.productType && renderSpecificationFields()}

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {mode === "add" ? "Add Material" : "Update Material"}
        </Button>
      </div>
    </div>
  );
}