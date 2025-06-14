import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Search, Settings, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  quotationId: z.string().min(1, "Quotation ID is required"),
  boxId: z.string().min(1, "Box selection is required"),
  clientId: z.string().min(1, "Client is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  // RM Kraft Paper Req.
  jwRate: z.number().min(0, "JW Rate must be positive"),
  sheetInwardRate: z.number().min(0, "Sheet Inward rate must be positive"),
  boxMakingRate: z.number().min(0, "Box Making rate must be positive"),
  printingCostRate: z.number().min(0, "Printing cost rate must be positive"),
  accessoriesRate: z.number().min(0, "Accessories rate must be positive"),
  roiPercentage: z.number().min(0, "ROI percentage must be positive"),
  carriageOutward: z.number().min(0, "Carriage Outward must be positive"),
  // Additional fields for quotation
  quotationDate: z.string().min(1, "Quotation date is required"),
  finalSalePrice: z.number().optional(),
  rateFinalisedDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CostingRecord {
  id: string;
  quotationId: string;
  boxId: string;
  boxName: string;
  clientId: string;
  clientName: string;
  quantity: number;
  // Paper specifications from box
  totalBoxWeight: number;
  // Rates
  jwRate: number;
  sheetInwardRate: number;
  boxMakingRate: number;
  printingCostRate: number;
  accessoriesRate: number;
  roiPercentage: number;
  carriageOutward: number;
  // Calculated costs
  jwCharges: number;
  sheetInwardCost: number;
  boxMakingCost: number;
  printingCost: number;
  accessoriesCost: number;
  mfgCostPerBox: number;
  roiAmount: number;
  totalCostPerBox: number;
  totalPrice: number;
  quotationDate: string;
  finalSalePrice?: number;
  rateFinalisedDate?: string;
  createdAt: string;
}

// Mock data for boxes and clients
const mockBoxes = [
  { 
    id: "BOX001", 
    name: "Monitor Packaging Box", 
    itemCode: "MPB-001",
    totalBoxWeight: 485.2,
    dimensions: "520×380×400",
    ply: "5 Ply"
  },
  { 
    id: "BOX002", 
    name: "Laptop Box", 
    itemCode: "LB-002",
    totalBoxWeight: 320.5,
    dimensions: "400×300×50",
    ply: "3 Ply"
  }
];

const mockClients = [
  { id: "CLI001", name: "ABC Industries Pvt Ltd" },
  { id: "CLI002", name: "XYZ Corp" },
  { id: "CLI003", name: "DEF Ltd" }
];

export default function Costing() {
  const { costingId } = useParams<{ costingId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  // Mock costing data
  const [costings, setCostings] = useState<CostingRecord[]>([
    {
      id: "COST001",
      quotationId: "QUO001",
      boxId: "BOX001",
      boxName: "Monitor Packaging Box",
      clientId: "CLI001",
      clientName: "ABC Industries Pvt Ltd",
      quantity: 1000,
      totalBoxWeight: 485.2,
      jwRate: 50,
      sheetInwardRate: 2,
      boxMakingRate: 1.5,
      printingCostRate: 3,
      accessoriesRate: 0.5,
      roiPercentage: 15,
      carriageOutward: 2,
      jwCharges: 24.26,
      sheetInwardCost: 0.97,
      boxMakingCost: 0.73,
      printingCost: 1.46,
      accessoriesCost: 0.24,
      mfgCostPerBox: 27.66,
      roiAmount: 4.15,
      totalCostPerBox: 33.81,
      totalPrice: 33810,
      quotationDate: "2024-06-15",
      createdAt: "2024-06-15"
    }
  ]);

  const existingCosting = costingId ? costings.find(cost => cost.id === costingId) : null;

  const getDefaultValues = (): FormValues => {
    if (existingCosting) {
      return {
        quotationId: existingCosting.quotationId,
        boxId: existingCosting.boxId,
        clientId: existingCosting.clientId,
        quantity: existingCosting.quantity,
        jwRate: existingCosting.jwRate,
        sheetInwardRate: existingCosting.sheetInwardRate,
        boxMakingRate: existingCosting.boxMakingRate,
        printingCostRate: existingCosting.printingCostRate,
        accessoriesRate: existingCosting.accessoriesRate,
        roiPercentage: existingCosting.roiPercentage,
        carriageOutward: existingCosting.carriageOutward,
        quotationDate: existingCosting.quotationDate,
        finalSalePrice: existingCosting.finalSalePrice,
        rateFinalisedDate: existingCosting.rateFinalisedDate || "",
      };
    }
    return {
      quotationId: "",
      boxId: "",
      clientId: "",
      quantity: 1000,
      jwRate: 50,
      sheetInwardRate: 2,
      boxMakingRate: 1.5,
      printingCostRate: 3,
      accessoriesRate: 0.5,
      roiPercentage: 15,
      carriageOutward: 2,
      quotationDate: new Date().toISOString().split('T')[0],
      rateFinalisedDate: "",
    };
  };

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues()
  });

  // Calculations state
  const [calculations, setCalculations] = useState({
    jwCharges: 0,
    sheetInwardCost: 0,
    boxMakingCost: 0,
    printingCost: 0,
    accessoriesCost: 0,
    mfgCostPerBox: 0,
    roiAmount: 0,
    totalCostPerBox: 0,
    totalPrice: 0
  });

  const boxId = watch("boxId");
  const quantity = watch("quantity");
  const jwRate = watch("jwRate");
  const sheetInwardRate = watch("sheetInwardRate");
  const boxMakingRate = watch("boxMakingRate");
  const printingCostRate = watch("printingCostRate");
  const accessoriesRate = watch("accessoriesRate");
  const roiPercentage = watch("roiPercentage");
  const carriageOutward = watch("carriageOutward");

  const selectedBox = mockBoxes.find(box => box.id === boxId);

  useEffect(() => {
    if (selectedBox) {
      const totalBoxWeightKg = selectedBox.totalBoxWeight / 1000; // Convert grams to kg
      
      // Calculate costs based on formulas from the image
      const jwCharges = (totalBoxWeightKg * jwRate) / 1000; // JW Rate per kg
      const sheetInwardCost = totalBoxWeightKg * sheetInwardRate; // Sheet Inward per kg
      const boxMakingCost = boxMakingRate; // Rate per box
      const printingCost = printingCostRate; // Printing cost per color/box
      const accessoriesCost = totalBoxWeightKg * accessoriesRate; // Set cost for 1 box
      
      // Manufacturing cost per box
      const mfgCostPerBox = jwCharges + sheetInwardCost + boxMakingCost + printingCost + accessoriesCost;
      
      // ROI calculation
      const roiAmount = (mfgCostPerBox * roiPercentage) / 100;
      
      // Total cost per box including carriage outward
      const totalCostPerBox = mfgCostPerBox + roiAmount + carriageOutward;
      
      // Total price for quantity
      const totalPrice = totalCostPerBox * quantity;

      setCalculations({
        jwCharges,
        sheetInwardCost,
        boxMakingCost,
        printingCost,
        accessoriesCost,
        mfgCostPerBox,
        roiAmount,
        totalCostPerBox,
        totalPrice
      });
    }
  }, [selectedBox, quantity, jwRate, sheetInwardRate, boxMakingRate, printingCostRate, accessoriesRate, roiPercentage, carriageOutward]);

  const onSubmit = (data: FormValues) => {
    const selectedClient = mockClients.find(client => client.id === data.clientId);
    const selectedBoxData = mockBoxes.find(box => box.id === data.boxId);
    
    const costing: CostingRecord = {
      id: costingId || uuidv4(),
      quotationId: data.quotationId,
      boxId: data.boxId,
      boxName: selectedBoxData?.name || '',
      clientId: data.clientId,
      clientName: selectedClient?.name || '',
      quantity: data.quantity,
      totalBoxWeight: selectedBoxData?.totalBoxWeight || 0,
      jwRate: data.jwRate,
      sheetInwardRate: data.sheetInwardRate,
      boxMakingRate: data.boxMakingRate,
      printingCostRate: data.printingCostRate,
      accessoriesRate: data.accessoriesRate,
      roiPercentage: data.roiPercentage,
      carriageOutward: data.carriageOutward,
      jwCharges: calculations.jwCharges,
      sheetInwardCost: calculations.sheetInwardCost,
      boxMakingCost: calculations.boxMakingCost,
      printingCost: calculations.printingCost,
      accessoriesCost: calculations.accessoriesCost,
      mfgCostPerBox: calculations.mfgCostPerBox,
      roiAmount: calculations.roiAmount,
      totalCostPerBox: calculations.totalCostPerBox,
      totalPrice: calculations.totalPrice,
      quotationDate: data.quotationDate,
      finalSalePrice: data.finalSalePrice,
      rateFinalisedDate: data.rateFinalisedDate,
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (costingId) {
      setCostings(costings.map(c => c.id === costingId ? costing : c));
      toast({
        title: "Costing Updated",
        description: "Costing record has been successfully updated.",
      });
    } else {
      setCostings([...costings, costing]);
      toast({
        title: "Costing Added",
        description: "New costing record has been successfully added.",
      });
    }

    setShowForm(false);
    console.log(JSON.stringify(costing, null, 2));
  };

  const filteredCostings = costings.filter(costing =>
    costing.quotationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    costing.boxName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    costing.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm || costingId) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => {setShowForm(false); navigate('/costing');}} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{costingId ? 'Edit Costing' : 'Add New Costing'}</h1>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              BOX COSTING & QUOTATION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quotationId">Quotation ID:</Label>
                  <Controller
                    name="quotationId"
                    control={control}
                    render={({ field }) => (
                      <Input id="quotationId" {...field} className="bg-background" />
                    )}
                  />
                  {errors.quotationId && <p className="text-destructive text-sm">{errors.quotationId.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="quotationDate">Quotation Date:</Label>
                  <Controller
                    name="quotationDate"
                    control={control}
                    render={({ field }) => (
                      <Input id="quotationDate" type="date" {...field} className="bg-background" />
                    )}
                  />
                  {errors.quotationDate && <p className="text-destructive text-sm">{errors.quotationDate.message}</p>}
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity:</Label>
                  <Controller
                    name="quantity"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="quantity"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-background"
                      />
                    )}
                  />
                  {errors.quantity && <p className="text-destructive text-sm">{errors.quantity.message}</p>}
                </div>
              </div>

              <Separator />

              {/* Box and Client Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="boxId">Select Box:</Label>
                  <Controller
                    name="boxId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select Box" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockBoxes.map((box) => (
                            <SelectItem key={box.id} value={box.id}>
                              {box.name} ({box.itemCode}) - {box.ply}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.boxId && <p className="text-destructive text-sm">{errors.boxId.message}</p>}
                </div>

                <div>
                  <Label htmlFor="clientId">Client:</Label>
                  <Controller
                    name="clientId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select Client" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockClients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.clientId && <p className="text-destructive text-sm">{errors.clientId.message}</p>}
                </div>
              </div>

              {selectedBox && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2">Box Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {selectedBox.name}
                      </div>
                      <div>
                        <span className="font-medium">Dimensions:</span> {selectedBox.dimensions} mm
                      </div>
                      <div>
                        <span className="font-medium">Ply:</span> {selectedBox.ply}
                      </div>
                      <div>
                        <span className="font-medium">Weight:</span> {selectedBox.totalBoxWeight.toFixed(2)} gm
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Rate Configuration */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Rate Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="jwRate">JW Rate (₹/kg):</Label>
                    <Controller
                      name="jwRate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="jwRate"
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-background"
                        />
                      )}
                    />
                    {errors.jwRate && <p className="text-destructive text-sm">{errors.jwRate.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="sheetInwardRate">Sheet Inward (₹/kg):</Label>
                    <Controller
                      name="sheetInwardRate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="sheetInwardRate"
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-background"
                        />
                      )}
                    />
                    {errors.sheetInwardRate && <p className="text-destructive text-sm">{errors.sheetInwardRate.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="boxMakingRate">Box Making (₹/box):</Label>
                    <Controller
                      name="boxMakingRate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="boxMakingRate"
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-background"
                        />
                      )}
                    />
                    {errors.boxMakingRate && <p className="text-destructive text-sm">{errors.boxMakingRate.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="printingCostRate">Printing Cost (₹/box):</Label>
                    <Controller
                      name="printingCostRate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="printingCostRate"
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-background"
                        />
                      )}
                    />
                    {errors.printingCostRate && <p className="text-destructive text-sm">{errors.printingCostRate.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="accessoriesRate">Accessories (₹/kg):</Label>
                    <Controller
                      name="accessoriesRate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="accessoriesRate"
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-background"
                        />
                      )}
                    />
                    {errors.accessoriesRate && <p className="text-destructive text-sm">{errors.accessoriesRate.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="roiPercentage">ROI (%):</Label>
                    <Controller
                      name="roiPercentage"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="roiPercentage"
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-background"
                        />
                      )}
                    />
                    {errors.roiPercentage && <p className="text-destructive text-sm">{errors.roiPercentage.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="carriageOutward">Carriage Outward (₹/box):</Label>
                    <Controller
                      name="carriageOutward"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="carriageOutward"
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-background"
                        />
                      )}
                    />
                    {errors.carriageOutward && <p className="text-destructive text-sm">{errors.carriageOutward.message}</p>}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Cost Calculation Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cost Component</TableHead>
                        <TableHead>Rate/Formula</TableHead>
                        <TableHead className="text-right">Amount (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>JW Charges</TableCell>
                        <TableCell>Weight × JW Rate / 1000</TableCell>
                        <TableCell className="text-right">₹{calculations.jwCharges.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Sheet Inward</TableCell>
                        <TableCell>Weight × Sheet Rate</TableCell>
                        <TableCell className="text-right">₹{calculations.sheetInwardCost.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Box Making</TableCell>
                        <TableCell>Rate per box</TableCell>
                        <TableCell className="text-right">₹{calculations.boxMakingCost.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Printing Cost</TableCell>
                        <TableCell>Rate per box</TableCell>
                        <TableCell className="text-right">₹{calculations.printingCost.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Accessories</TableCell>
                        <TableCell>Weight × Accessories Rate</TableCell>
                        <TableCell className="text-right">₹{calculations.accessoriesCost.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={2} className="font-semibold">Mfg. Cost of Box</TableCell>
                        <TableCell className="text-right font-semibold">₹{calculations.mfgCostPerBox.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ROI ({roiPercentage}%)</TableCell>
                        <TableCell>Mfg Cost × ROI%</TableCell>
                        <TableCell className="text-right">₹{calculations.roiAmount.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Carriage Outward</TableCell>
                        <TableCell>Per box</TableCell>
                        <TableCell className="text-right">₹{carriageOutward.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} className="font-bold">TOTAL COST PER BOX</TableCell>
                        <TableCell className="text-right font-bold">₹{calculations.totalCostPerBox.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} className="font-bold text-lg">TOTAL PRICE ({quantity} boxes)</TableCell>
                        <TableCell className="text-right font-bold text-lg">₹{calculations.totalPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </div>

              <Separator />

              {/* Final Quotation Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Final Quotation Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="finalSalePrice">Final Sale Price Negotiated (₹):</Label>
                    <Controller
                      name="finalSalePrice"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="finalSalePrice"
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          className="bg-background"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="rateFinalisedDate">Rate Finalised on Date:</Label>
                    <Controller
                      name="rateFinalisedDate"
                      control={control}
                      render={({ field }) => (
                        <Input id="rateFinalisedDate" type="date" {...field} className="bg-background" />
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="submit">{costingId ? 'Update' : 'Save'}</Button>
                <Button type="button" variant="outline" onClick={() => {setShowForm(false); navigate('/costing');}}>Cancel</Button>
              </div>
            </form> 
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Costing & Quotations</h1>
          <p className="text-muted-foreground">
            Manage box costing calculations and quotations
          </p>
        </div>
        
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Costing
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Costing Records Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCostings.map((costing) => (
          <Card key={costing.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{costing.quotationId}</CardTitle>
                  <p className="text-sm text-muted-foreground">{costing.boxName}</p>
                </div>
                <Badge variant="outline">₹{costing.totalCostPerBox.toFixed(2)}/box</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Client</p>
                <p className="text-sm text-muted-foreground">{costing.clientName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Quantity & Total</p>
                <p className="text-sm text-muted-foreground">{costing.quantity.toLocaleString()} boxes • ₹{costing.totalPrice.toLocaleString()}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Quotation Date</p>
                <p className="text-sm text-muted-foreground">{new Date(costing.quotationDate).toLocaleDateString()}</p>
              </div>

              {costing.finalSalePrice && (
                <div>
                  <p className="text-sm font-medium">Final Sale Price</p>
                  <p className="text-sm text-green-600 font-semibold">₹{costing.finalSalePrice.toLocaleString()}</p>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => navigate(`/costing/${costing.id}`)}>
                  <Settings className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}