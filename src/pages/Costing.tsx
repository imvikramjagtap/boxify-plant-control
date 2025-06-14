import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addCostingProject, updateCostingProject } from "@/store/slices/costingSlice";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Search, Settings, Calculator, FileText, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuoteVersionManager from "@/components/costing/QuoteVersionManager";
import MaterialCostCalculator from "@/components/costing/MaterialCostCalculator";
import PricingTierManager from "@/components/costing/PricingTierManager";

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

// Get boxes from Redux store - no longer using mock data

export default function Costing() {
  const { costingId } = useParams<{ costingId: string }>();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  // Get data from Redux store
  const costings = useAppSelector((state: any) => state.costing.projects);
  const clients = useAppSelector((state: any) => state.clients.clients);
  const boxes = useAppSelector((state: any) => state.boxMaster.boxes);

  const existingCosting = costingId ? costings.find(cost => cost.id === costingId) : null;

  const getDefaultValues = (): FormValues => {
    if (existingCosting) {
      return {
        quotationId: existingCosting.quotationId || "",
        boxId: existingCosting.boxId || "",
        clientId: existingCosting.clientId || "",
        quantity: existingCosting.quantity || 1000,
        jwRate: existingCosting.jwRate || 50,
        sheetInwardRate: existingCosting.sheetInwardRate || 2,
        boxMakingRate: existingCosting.boxMakingRate || 1.5,
        printingCostRate: existingCosting.printingCostRate || 3,
        accessoriesRate: existingCosting.accessoriesRate || 0.5,
        roiPercentage: existingCosting.roiPercentage || 15,
        carriageOutward: existingCosting.carriageOutward || 2,
        quotationDate: existingCosting.quotationDetails?.quotationDate || new Date().toISOString().split('T')[0],
        finalSalePrice: existingCosting.quotationDetails?.finalSalePrice,
        rateFinalisedDate: existingCosting.quotationDetails?.rateFinalisedDate || "",
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
    totalBoxWeightKg: 0,
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

  // Advanced pricing states
  const [materialCostAdjustment, setMaterialCostAdjustment] = useState(0);
  const [materialCostData, setMaterialCostData] = useState([]);
  const [pricingAdjustments, setPricingAdjustments] = useState([]);

  const boxId = watch("boxId");
  const quantity = watch("quantity");
  const jwRate = watch("jwRate");
  const sheetInwardRate = watch("sheetInwardRate");
  const boxMakingRate = watch("boxMakingRate");
  const printingCostRate = watch("printingCostRate");
  const accessoriesRate = watch("accessoriesRate");
  const roiPercentage = watch("roiPercentage");
  const carriageOutward = watch("carriageOutward");

  const selectedBox = boxes.find(box => box.id === boxId);

  useEffect(() => {
    if (selectedBox) {
      // Calculate estimated weight from box dimensions (L x W x H) in cm and assume cardboard density
      const volume = selectedBox.dimensions.length * selectedBox.dimensions.width * selectedBox.dimensions.height; // cm³
      const estimatedWeightGrams = volume * 0.5; // Approximate cardboard density (0.5 g/cm³)
      const totalBoxWeightKg = estimatedWeightGrams / 1000; // Convert grams to kg
      
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
        totalBoxWeightKg,
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
    const selectedClient = clients.find(client => client.id === data.clientId);
    const selectedBoxData = boxes.find(box => box.id === data.boxId);
    
    const costingData = {
      quotationId: data.quotationId,
      name: `${selectedClient?.name || 'Unknown'} - ${selectedBoxData?.name || 'Unknown Box'}`,
      clientId: data.clientId,
      boxId: data.boxId,
      quantity: data.quantity,
      jwRate: data.jwRate,
      sheetInwardRate: data.sheetInwardRate,
      boxMakingRate: data.boxMakingRate,
      printingCostRate: data.printingCostRate,
      accessoriesRate: data.accessoriesRate,
      roiPercentage: data.roiPercentage,
      carriageOutward: data.carriageOutward,
      boxName: selectedBoxData?.name || 'Unknown Box',
      totalBoxWeight: selectedBoxData?.estimatedCost || 0, // Using estimatedCost as placeholder since totalBoxWeight doesn't exist
      calculations,
      quotationDetails: {
        quotationId: data.quotationId,
        quotationDate: data.quotationDate,
        finalSalePrice: data.finalSalePrice,
        rateFinalisedDate: data.rateFinalisedDate,
        validityDays: 30,
        paymentTerms: "30 days from delivery",
        deliveryTerms: "Ex-works"
      },
      status: "draft" as const
    };

    if (costingId) {
      dispatch(updateCostingProject({ id: costingId, updates: costingData }));
      toast({
        title: "Costing Updated",
        description: "Costing record has been successfully updated.",
      });
    } else {
      dispatch(addCostingProject(costingData));
      toast({
        title: "Costing Added", 
        description: "New costing record has been successfully added.",
      });
    }

    setShowForm(false);
  };

  const handleMaterialCostUpdate = (adjustment, materials) => {
    setMaterialCostAdjustment(adjustment);
    setMaterialCostData(materials);
  };

  const handlePricingUpdate = (adjustments) => {
    setPricingAdjustments(adjustments);
  };

  // Calculate final price with all adjustments
  const finalCalculatedPrice = calculations.totalPrice + materialCostAdjustment + 
    pricingAdjustments.reduce((sum, adj) => {
      if (adj.type === 'seasonal_adjustment') return sum + adj.amount;
      return sum - adj.amount; // Discounts are negative
    }, 0);

  const filteredCostings = costings.filter(costing =>
    costing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    costing.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm || costingId) {
    return (
      <div className="p-4 w-full max-w-none">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => {setShowForm(false); navigate('/costing');}} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl md:text-2xl font-bold">{costingId ? 'Edit Costing' : 'Add New Costing'}</h1>
        </div>
        
        <div className="w-full space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                BOX COSTING & QUOTATION
                <Badge variant="outline" className="ml-auto">
                  Final: ₹{finalCalculatedPrice.toFixed(2)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="versions">Versions</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

                    {/* Box and Client Selection */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                                {boxes.map((box) => (
                                  <SelectItem key={box.id} value={box.id}>
                                    {box.name} - {box.category}
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
                                {clients.map((client) => (
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
                      <Card className="bg-muted/50 animate-fade-in">
                        <CardContent className="pt-4">
                          <h4 className="font-semibold mb-2">Box Details</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="col-span-1">
                              <span className="font-medium">Name:</span> {selectedBox.name}
                            </div>
                            <div>
                              <span className="font-medium">Dimensions:</span> {selectedBox.dimensions.length}×{selectedBox.dimensions.width}×{selectedBox.dimensions.height} cm
                            </div>
                            <div>
                              <span className="font-medium">Category:</span> {selectedBox.category}
                            </div>
                            <div>
                              <span className="font-medium">Est. Cost:</span> ₹{selectedBox.estimatedCost.toFixed(2)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Rate Configuration */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Rate Configuration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                      </CardContent>
                    </Card>

                    {/* Cost Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Cost Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
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
                                <TableCell colSpan={2} className="font-semibold">Base Cost Per Box</TableCell>
                                <TableCell className="text-right font-semibold">₹{calculations.totalCostPerBox.toFixed(2)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={2} className="font-semibold">Material Cost Adjustment</TableCell>
                                <TableCell className={`text-right font-semibold ${materialCostAdjustment >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {materialCostAdjustment >= 0 ? '+' : ''}₹{materialCostAdjustment.toFixed(2)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={2} className="font-bold text-lg">FINAL PRICE ({quantity} boxes)</TableCell>
                                <TableCell className="text-right font-bold text-lg">₹{finalCalculatedPrice.toFixed(2)}</TableCell>
                              </TableRow>
                            </TableFooter>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button type="submit" className="w-full sm:w-auto">{costingId ? 'Update' : 'Save'}</Button>
                      <Button type="button" variant="outline" onClick={() => {setShowForm(false); navigate('/costing');}} className="w-full sm:w-auto">Cancel</Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="materials">
                  <MaterialCostCalculator 
                    boxId={boxId} 
                    quantity={quantity} 
                    onCostUpdate={handleMaterialCostUpdate}
                  />
                </TabsContent>

                <TabsContent value="pricing">
                  <PricingTierManager 
                    clientId={watch("clientId")} 
                    quantity={quantity} 
                    basePrice={calculations.totalPrice} 
                    onPricingUpdate={handlePricingUpdate}
                  />
                </TabsContent>

                <TabsContent value="versions">
                  {watch("quotationId") && (
                    <QuoteVersionManager 
                      quotationId={watch("quotationId")} 
                      costingProjectId={costingId || ""} 
                      currentQuoteStatus="draft"
                      onStatusChange={() => {}}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
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
                  <CardTitle className="text-lg">{costing.id}</CardTitle>
                  <p className="text-sm text-muted-foreground">{costing.name}</p>
                </div>
                <Badge variant="outline">₹{costing.calculations?.totalCostPerBox?.toFixed(2) || '0.00'}/box</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Client</p>
                <p className="text-sm text-muted-foreground">{clients.find(c => c.id === costing.clientId)?.name || 'Unknown'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Quantity & Total</p>
                <p className="text-sm text-muted-foreground">{costing.quantity.toLocaleString()} boxes • ₹{(costing.calculations?.totalPrice || 0).toLocaleString()}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant="outline">{costing.status}</Badge>
              </div>
              
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