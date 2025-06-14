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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Search, Settings, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  addBox, 
  updateBox, 
  selectAllBoxes 
} from "@/store/slices/boxMasterSlice";
import { selectAllClients } from "@/store/slices/clientsSlice";

const schema = z.object({
  boxName: z.string().min(1, "Box name is required"),
  itemCode: z.string().min(1, "Item code is required"),
  clientId: z.string().min(1, "Client is required"),
  length: z.string().regex(/^\d{1,3}$/, "Length must be 1-3 digits"),
  width: z.string().regex(/^\d{1,3}$/, "Width must be 1-3 digits"),
  height: z.string().regex(/^\d{1,3}$/, "Height must be 1-3 digits"),
  ply: z.enum(["3 Ply", "5 Ply", "7 Ply"]),
  boxType: z.string().min(1, "Box type is required"),
  fluteType: z.string().min(1, "Flute type is required"),
  mfgJoint: z.enum(["Stitching Pin", "Glue"]),
  numberOfPins: z.number().optional(),
  printing: z.boolean(),
  numberOfColors: z.string().optional(),
  printingType: z.string().optional(),
  colorCode: z.array(z.string()).optional(),
  contentWeight: z.number().min(0, "Content weight must be positive"),
  stackHeight: z.number().min(1, "Stack height must be at least 1"),
  safetyFactor: z.number().min(1, "Safety factor must be at least 1"),
  paperSpecs: z.array(z.object({
    gsm: z.string().regex(/^\d{1,3}$/, "GSM must be 1-3 digits"),
    bf: z.string().regex(/^\d{1,2}$/, "BF must be 1-2 digits"),
  }))
});

type FormValues = z.infer<typeof schema>;

type PaperSpec = {
  layer: string;
  gsm: string | number;
  bf: string | number;
  fluteType: string;
  flutePercent: number;
  plyWt: number;
  plyBS: number;
};

interface Box {
  id: string;
  boxName: string;
  itemCode: string;
  clientId: string;
  clientName: string;
  length: string;
  width: string;
  height: string;
  ply: "3 Ply" | "5 Ply" | "7 Ply";
  boxType: string;
  fluteType: string;
  mfgJoint: "Stitching Pin" | "Glue";
  numberOfPins?: number;
  printing: boolean;
  numberOfColors?: string;
  printingType?: string;
  colorCode?: string[];
  contentWeight: number;
  stackHeight: number;
  safetyFactor: number;
  paperSpecs: Array<{ gsm: string; bf: string }>;
  totalBoxWeight?: number;
  compressionStrength?: number;
  createdAt: string;
}

// Constants
const manufacturingJointOptions = ["Stitching Pin", "Glue"];
const printingTypeOptions = ["Flexo", "Offset", "Digital"];
const colorOptions = ["1", "2", "3", "4", "5", "6"];

export default function BoxMaster() {
  const { boxId } = useParams<{ boxId: string }>();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  
  // Get data from Redux store
  const boxes = useAppSelector((state: any) => state.boxMaster.boxes);
  const clients = useAppSelector((state: any) => state.clients.clients);

  const existingBox = boxId ? boxes.find((box: any) => box.id === boxId) : null;

  const getDefaultValues = (): FormValues => {
    if (existingBox) {
      return {
        boxName: existingBox.name || "",
        itemCode: existingBox.description || "",
        clientId: existingBox.clientId || "",
        length: existingBox.dimensions?.length?.toString() || "0",
        width: existingBox.dimensions?.width?.toString() || "0", 
        height: existingBox.dimensions?.height?.toString() || "0",
        ply: "3 Ply",
        boxType: existingBox.category || "RSC",
        fluteType: "A",
        mfgJoint: "Stitching Pin",
        numberOfPins: 0,
        printing: false,
        numberOfColors: "1",
        printingType: "Flexo",
        colorCode: [""],
        contentWeight: 20,
        stackHeight: 8,
        safetyFactor: 5,
        paperSpecs: [
          { gsm: "0", bf: "0" },
          { gsm: "0", bf: "0" },
          { gsm: "0", bf: "0" }
        ]
      };
    }
    return {
      boxName: "",
      itemCode: "",
      clientId: "",
      length: "0",
      width: "0",
      height: "300",
      ply: "3 Ply",
      boxType: "RSC",
      fluteType: "A",
      mfgJoint: "Stitching Pin",
      numberOfPins: 0,
      printing: false,
      numberOfColors: "1",
      printingType: "Flexo",
      colorCode: [""],
      contentWeight: 20,
      stackHeight: 8,
      safetyFactor: 5,
      paperSpecs: [
        { gsm: "0", bf: "0" },
        { gsm: "0", bf: "0" },
        { gsm: "0", bf: "0" },
        { gsm: "0", bf: "0" },
        { gsm: "0", bf: "0" },
        { gsm: "0", bf: "0" },
        { gsm: "0", bf: "0" },
      ]
    };
  };

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues()
  });

  const [paperSpecs, setPaperSpecs] = useState<PaperSpec[]>([
    { layer: "Top", gsm: "0", bf: "0", fluteType: "", flutePercent: 0, plyWt: 0, plyBS: 0 },
    { layer: "Flute 1", gsm: "0", bf: "0", fluteType: "", flutePercent: 60, plyWt: 0, plyBS: 0 },
    { layer: "Base 1", gsm: "0", bf: "0", fluteType: "", flutePercent: 0, plyWt: 0, plyBS: 0 },
    { layer: "Flute 2", gsm: "0", bf: "0", fluteType: "", flutePercent: 60, plyWt: 0, plyBS: 0 },
    { layer: "Base 2", gsm: "0", bf: "0", fluteType: "", flutePercent: 0, plyWt: 0, plyBS: 0 },
    { layer: "Flute 3", gsm: "0", bf: "0", fluteType: "", flutePercent: 60, plyWt: 0, plyBS: 0 },
    { layer: "Base 3", gsm: "0", bf: "0", fluteType: "", flutePercent: 0, plyWt: 0, plyBS: 0 },
  ]);

  const [outerDim, setOuterDim] = useState({ length: 0, width: 0, height: 0 });
  const [sheetSize, setSheetSize] = useState({ deckle: 0, cutting: 0 });
  const [loadOnBottomBox, setLoadOnBottomBox] = useState(0);
  const [compressionStrength, setCompressionStrength] = useState(0);
  const [totalBoxWeight, setTotalBoxWeight] = useState(0);
  const [bsOfBox, setBsOfBox] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const length = watch("length");
  const width = watch("width");
  const height = watch("height");
  const ply = watch("ply");
  const fluteType = watch("fluteType");
  const contentWeight = watch("contentWeight");
  const stackHeight = watch("stackHeight");
  const printing = watch("printing");
  const numberOfColors = watch("numberOfColors");
  const mfgJoint = watch("mfgJoint");
  const safetyFactor = watch("safetyFactor");

  useEffect(() => {
    const l = parseInt(length) || 0;
    const w = parseInt(width) || 0;
    const h = parseInt(height) || 0;

    // Calculate Outer Dimensions
    setOuterDim({
      length: l + 5,
      width: w + 5,
      height: h + 5,
    });

    // Calculate Sheet Size
    const newSheetSize = {
      deckle: h + w + 25,
      cutting: (l + w) * 2 + 60,
    };
    setSheetSize(newSheetSize);

    // Calculate Load on Bottom Box
    const newLoadOnBottomBox = contentWeight * (stackHeight - 1);
    setLoadOnBottomBox(newLoadOnBottomBox);

    // Calculate Compression Strength
    setCompressionStrength(newLoadOnBottomBox * safetyFactor);

    // Update Ply Wt. for non-flute layers
    const updatedSpecs = paperSpecs.map(spec => {
      if (!spec.layer.includes("Flute")) {
        const gsm = parseInt(spec.gsm as string) || 0;
        spec.plyWt = (newSheetSize.deckle * newSheetSize.cutting * gsm) / 100000;
      }
      return spec;
    });
    setPaperSpecs(updatedSpecs);

  }, [length, width, height, contentWeight, stackHeight, paperSpecs, safetyFactor]);

  useEffect(() => {
    updatePaperSpecsFlutes();
  }, [ply, fluteType]);

  useEffect(() => {
    setValue("colorCode", Array(Number(numberOfColors)).fill(""));
  }, [numberOfColors, setValue]);

  const getFlutePercent = (fluteType: string) => {
    switch (fluteType) {
      case "A":
        return 60;
      case "C":
        return 50;
      case "B":
        return 40;
      case "E":
        return 30;
      default:
        return 40;
    }
  };

  const handlePaperSpecChange = <T extends keyof PaperSpec>(index: number, field: T, value: PaperSpec[T]) => {
    const updatedSpecs = [...paperSpecs];
    updatedSpecs[index][field] = value as PaperSpec[T];
    const gsm = typeof updatedSpecs[index].gsm === 'string' ? parseInt(updatedSpecs[index].gsm) : updatedSpecs[index].gsm || 0;
    const bf = typeof updatedSpecs[index].bf === 'string' ? parseInt(updatedSpecs[index].bf) : updatedSpecs[index].bf || 0;

    if (updatedSpecs[index].layer.includes("Flute")) {
      updatedSpecs[index].plyWt = (gsm + (gsm * updatedSpecs[index].flutePercent) / 100);
      updatedSpecs[index].plyBS = (bf * 50) / 1000;
    } else {
      updatedSpecs[index].plyWt = (sheetSize.deckle * sheetSize.cutting * gsm) / 100000;
      updatedSpecs[index].plyBS = (gsm * bf) / 1000;
    }
    setPaperSpecs(updatedSpecs);

    // Calculate total box weight and bursting strength
    const totalWeight = updatedSpecs.reduce((sum, spec) => sum + spec.plyWt, 0);
    setTotalBoxWeight(totalWeight);
    const totalBS = updatedSpecs.reduce((sum, spec) => sum + spec.plyBS, 0);
    setBsOfBox(totalBS);

    // Update form values
    setValue(`paperSpecs.${index}.gsm`, updatedSpecs[index].gsm.toString());
    setValue(`paperSpecs.${index}.bf`, updatedSpecs[index].bf.toString());
  };

  const getFluteTypeOptions = () => {
    switch (ply) {
      case "3 Ply":
        return ["A", "B", "C", "E"];
      case "5 Ply":
        return ["AB", "BC", "BB", "EB"];
      case "7 Ply":
        return ["BAB", "BAA", "BBB", "ABB"];
      default:
        return [];
    }
  };

  const getVisiblePaperSpecs = () => {
    switch (ply) {
      case "3 Ply":
        return paperSpecs.slice(0, 3);
      case "5 Ply":
        return paperSpecs.slice(0, 5);
      case "7 Ply":
        return paperSpecs;
      default:
        return [];
    }
  };

  const updatePaperSpecsFlutes = () => {
    const updatedSpecs = [...paperSpecs];
    switch (ply) {
      case "3 Ply":
        updatedSpecs[1].fluteType = fluteType;
        updatedSpecs[1].flutePercent = getFlutePercent(fluteType);
        break;
      case "5 Ply":
        if (fluteType === "AB" || fluteType === "EB") {
          updatedSpecs[1].fluteType = fluteType[0];
          updatedSpecs[3].fluteType = fluteType[1];
        } else {
          updatedSpecs[1].fluteType = fluteType[0];
          updatedSpecs[3].fluteType = fluteType[1];
        }
        updatedSpecs[1].flutePercent = getFlutePercent(updatedSpecs[1].fluteType);
        updatedSpecs[3].flutePercent = getFlutePercent(updatedSpecs[3].fluteType);
        break;
      case "7 Ply":
        updatedSpecs[1].fluteType = fluteType[0];
        updatedSpecs[3].fluteType = fluteType[1];
        updatedSpecs[5].fluteType = fluteType[2];
        updatedSpecs[1].flutePercent = getFlutePercent(updatedSpecs[1].fluteType);
        updatedSpecs[3].flutePercent = getFlutePercent(updatedSpecs[3].fluteType);
        updatedSpecs[5].flutePercent = getFlutePercent(updatedSpecs[5].fluteType);
        break;
    }
    setPaperSpecs(updatedSpecs);
  };

  const onSubmit = (data: FormValues) => {
    const selectedClient = clients.find(client => client.id === data.clientId);
    const box: any = {
      id: boxId || uuidv4(),
      name: data.boxName,
      clientId: data.clientId,
      clientName: selectedClient ? selectedClient.name : '',
      dimensions: {
        length: parseInt(data.length),
        width: parseInt(data.width),
        height: parseInt(data.height)
      },
      materials: [], // Will be populated based on paper specs
      estimatedCost: totalBoxWeight * 2.5, // Simple calculation
      category: data.boxType,
      description: `${data.ply} ${data.boxType} box for ${selectedClient?.name || 'client'}`
    };

    if (boxId) {
      dispatch(updateBox({ id: boxId, updates: box }));
      toast({
        title: "Box Updated",
        description: "Box specifications have been successfully updated.",
      });
    } else {
      dispatch(addBox(box));
      toast({
        title: "Box Added",
        description: "New box has been successfully added to the system.",
      });
    }

    setShowForm(false);
    console.log(JSON.stringify(box, null, 2));
  };

  const filteredBoxes = boxes.filter((box: any) => {
    const matchesSearch = box.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         box.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         box.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = clientFilter === "all" || box.clientId === clientFilter;
    return matchesSearch && matchesClient;
  });

  if (showForm || boxId) {
    return (
      <div className="p-4 w-full max-w-none">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => {setShowForm(false); navigate('/boxes');}} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl md:text-2xl font-bold">{boxId ? 'Edit Box' : 'Add New Box'}</h1>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>BOX MASTER CARD</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="boxName">Box Name:</Label>
                  <Controller
                    name="boxName"
                    control={control}
                    render={({ field }) => (
                      <Input id="boxName" {...field} className="bg-background" />
                    )}
                  />
                  {errors.boxName && <p className="text-destructive text-sm">{errors.boxName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="itemCode">Item Code:</Label>
                  <Controller
                    name="itemCode"
                    control={control}
                    render={({ field }) => (
                      <Input id="itemCode" {...field} className="bg-background" />
                    )}
                  />
                  {errors.itemCode && <p className="text-destructive text-sm">{errors.itemCode.message}</p>}
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
                          {clients.map((client: any) => (
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

              <Separator />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ply">Ply:</Label>
                  <Controller
                    name="ply"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select Ply" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3 Ply">3 Ply</SelectItem>
                          <SelectItem value="5 Ply">5 Ply</SelectItem>
                          <SelectItem value="7 Ply">7 Ply</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.ply && <p className="text-destructive text-sm">{errors.ply.message}</p>}
                </div>
                <div>
                  <Label htmlFor="boxType">Box Type:</Label>
                  <Controller
                    name="boxType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select Box Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RSC">RSC</SelectItem>
                          <SelectItem value="RSC with Vent Holes">RSC with Vent Holes</SelectItem>
                          <SelectItem value="Top n Bottom">Top n Bottom</SelectItem>
                          <SelectItem value="Export Tray">Export Tray</SelectItem>
                          <SelectItem value="Telescopic">Telescopic</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.boxType && <p className="text-destructive text-sm">{errors.boxType.message}</p>}
                </div>
                <div>
                  <Label htmlFor="mfgJoint">Manufacturing Joint:</Label>
                  <Controller
                    name="mfgJoint"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select Mfg Joint" />
                        </SelectTrigger>
                         <SelectContent>
                           {manufacturingJointOptions.map((option) => (
                             <SelectItem key={option} value={option}>
                               {option}
                             </SelectItem>
                           ))}
                         </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.mfgJoint && <p className="text-destructive text-sm">{errors.mfgJoint.message}</p>}
                </div>
              </div>

              {mfgJoint === "Stitching Pin" && (
                <div>
                  <Label htmlFor="numberOfPins">Number of Pins:</Label>
                  <Controller
                    name="numberOfPins"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="numberOfPins"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-background"
                      />
                    )}
                  />
                  {errors.numberOfPins && <p className="text-destructive text-sm">{errors.numberOfPins.message}</p>}
                </div>
              )}

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Dimensions:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="length">Length:</Label>
                    <Controller
                      name="length"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="length"
                          {...field}
                          className="bg-background"
                          maxLength={3}
                          onKeyPress={(e) => {
                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      )}
                    />
                    {errors.length && <p className="text-destructive text-sm">{errors.length.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="width">Width:</Label>
                    <Controller
                      name="width"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="width"
                          {...field}
                          className="bg-background"
                          maxLength={3}
                          onKeyPress={(e) => {
                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      )}
                    />
                    {errors.width && <p className="text-destructive text-sm">{errors.width.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="height">Height:</Label>
                    <Controller
                      name="height"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="height"
                          {...field}
                          className="bg-background"
                          maxLength={3}
                          onKeyPress={(e) => {
                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      )}
                    />
                    {errors.height && <p className="text-destructive text-sm">{errors.height.message}</p>}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Calculated Dimensions:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Outer Length:</Label>
                    <Input value={outerDim.length} readOnly className="bg-muted" />
                  </div>
                  <div>
                    <Label>Outer Width:</Label>
                    <Input value={outerDim.width} readOnly className="bg-muted" />
                  </div>
                  <div>
                    <Label>Outer Height:</Label>
                    <Input value={outerDim.height} readOnly className="bg-muted" />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Sheet Size:</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sheet Size</TableHead>
                        <TableHead>Deckle</TableHead>
                        <TableHead>Cutting</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>1 Up</TableCell>
                        <TableCell>{sheetSize.deckle}</TableCell>
                        <TableCell>{sheetSize.cutting}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2 Up</TableCell>
                        <TableCell>{sheetSize.deckle * 2}</TableCell>
                        <TableCell>{sheetSize.cutting}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>3 Up</TableCell>
                        <TableCell>{sheetSize.deckle * 3}</TableCell>
                        <TableCell>{sheetSize.cutting}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>4 Up</TableCell>
                        <TableCell>{sheetSize.deckle * 4}</TableCell>
                        <TableCell>{sheetSize.cutting}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Flute Type:</h3>
                <Controller
                  name="fluteType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select Flute Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {getFluteTypeOptions().map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.fluteType && <p className="text-destructive text-sm">{errors.fluteType.message}</p>}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Printing:</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <Controller
                    name="printing"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="printing">Enable Printing</Label>
                </div>
                {printing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="numberOfColors">No. of Colours:</Label>
                      <Controller
                        name="numberOfColors"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select No. of Colours" />
                            </SelectTrigger>
                           <SelectContent>
                             {colorOptions.map((option) => (
                               <SelectItem key={option} value={option}>
                                 {option}
                               </SelectItem>
                             ))}
                           </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor="printingType">Printing Type:</Label>
                      <Controller
                        name="printingType"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select Printing Type" />
                            </SelectTrigger>
                           <SelectContent>
                             {printingTypeOptions.map((option) => (
                               <SelectItem key={option} value={option}>
                                 {option}
                               </SelectItem>
                             ))}
                           </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="col-span-full">
                      <Label>Colour Code:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {watch("colorCode")?.map((color, index) => (
                          <Controller
                            key={index}
                            name={`colorCode.${index}`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder={`Color ${index + 1}`}
                                className="bg-background"
                                value={color}
                              />
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="col-span-full">
                      <Label htmlFor="printingFile">Upload Printing Design:</Label>
                      <Input
                        id="printingFile"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf,.svg,.bmp,.tiff"
                        className="bg-background"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile(file);
                            
                            // Create preview URL for images
                            if (file.type.startsWith('image/')) {
                              const url = URL.createObjectURL(file);
                              setPreviewUrl(url);
                            } else {
                              setPreviewUrl(null);
                            }
                            
                            console.log("Uploaded file:", file.name, file.type);
                          }
                        }}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Supported formats: JPG, PNG, PDF, SVG, BMP, TIFF
                      </p>
                      
                      {/* File Preview */}
                      {uploadedFile && (
                        <div className="mt-4 p-3 border rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            {previewUrl ? (
                              <img 
                                src={previewUrl} 
                                alt="Preview" 
                                className="w-16 h-16 object-cover rounded border"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-muted border rounded flex items-center justify-center text-muted-foreground text-xs">
                                {uploadedFile.name.split('.').pop()?.toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{uploadedFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(uploadedFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUploadedFile(null);
                                setPreviewUrl(null);
                                const input = document.getElementById('printingFile') as HTMLInputElement;
                                if (input) input.value = '';
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Paper Specifications:</h3>
                <div className="overflow-x-auto -mx-4 px-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Layer</TableHead>
                        <TableHead>GSM</TableHead>
                        <TableHead>BF</TableHead>
                        <TableHead>Flute Type</TableHead>
                        <TableHead>Flute %</TableHead>
                        <TableHead>Ply Wt. (in gm)</TableHead>
                        <TableHead>Ply B.S.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getVisiblePaperSpecs().map((spec, index) => (
                        <TableRow key={index}>
                          <TableCell>{spec.layer}</TableCell>
                          <TableCell>
                            <Controller
                              name={`paperSpecs.${index}.gsm`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  className="bg-background w-20"
                                  maxLength={3}
                                  onKeyPress={(e) => {
                                    if (!/[0-9]/.test(e.key)) {
                                      e.preventDefault();
                                    }
                                  }}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handlePaperSpecChange(index, "gsm", e.target.value as never);
                                  }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`paperSpecs.${index}.bf`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  className="bg-background w-16"
                                  maxLength={2}
                                  onKeyPress={(e) => {
                                    if (!/[0-9]/.test(e.key)) {
                                      e.preventDefault();
                                    }
                                  }}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handlePaperSpecChange(index, "bf", e.target.value as never);
                                  }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>{spec.fluteType}</TableCell>
                          <TableCell>{spec.flutePercent}</TableCell>
                          <TableCell>{spec.plyWt.toFixed(2)}</TableCell>
                          <TableCell>{spec.plyBS.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={5}>Total</TableCell>
                        <TableCell>{totalBoxWeight.toFixed(2)}</TableCell>
                        <TableCell>{bsOfBox.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Other Details:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contentWeight">Content Weight (kg):</Label>
                    <Controller
                      name="contentWeight"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="contentWeight"
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-background"
                        />
                      )}
                    />
                    {errors.contentWeight && <p className="text-destructive text-sm">{errors.contentWeight.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="stackHeight">Stack Height (Nos.):</Label>
                    <Controller
                      name="stackHeight"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="stackHeight"
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-background"
                        />
                      )}
                    />
                    {errors.stackHeight && <p className="text-destructive text-sm">{errors.stackHeight.message}</p>}
                  </div>
                  <div>
                    <Label>Load on Bottom Box (kg):</Label>
                    <Input value={loadOnBottomBox} readOnly className="bg-muted" />
                  </div>
                  <div>
                    <Label htmlFor="safetyFactor">Safety Factor:</Label>
                    <Controller
                      name="safetyFactor"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="safetyFactor"
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-background"
                        />
                      )}
                    />
                    {errors.safetyFactor && <p className="text-destructive text-sm">{errors.safetyFactor.message}</p>}
                  </div>
                  <div>
                    <Label>Compression Strength:</Label>
                    <Input value={compressionStrength} readOnly className="bg-muted" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <Button type="submit" className="w-full sm:w-auto">{boxId ? 'Update' : 'Save'}</Button>
                <Button type="button" variant="outline" onClick={() => {setShowForm(false); navigate('/boxes');}} className="w-full sm:w-auto">Cancel</Button>
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
          <h1 className="text-3xl font-bold text-foreground">Box Master</h1>
          <p className="text-muted-foreground">
            Manage box designs, specifications, and configurations
          </p>
        </div>
        
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Box
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search boxes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by client" />
          </SelectTrigger>
          <SelectContent className="bg-background border z-50">
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map((client: any) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Boxes Grid */}
      {filteredBoxes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Package className="h-16 w-16 text-muted-foreground" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">No boxes found</h3>
            <p className="text-muted-foreground">
              {searchTerm || clientFilter !== "all" 
                ? "Try adjusting your search criteria or filters"
                : "Get started by creating your first box design"
              }
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Box
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBoxes.map((box: any) => (
            <Card key={box.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{box.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{box.description}</p>
                  </div>
                  <Badge variant="outline">{box.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <p className="text-sm text-muted-foreground">
                    {clients.find((c: any) => c.id === box.clientId)?.name || "Unknown Client"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Dimensions (L×W×H)</p>
                  <p className="text-sm text-muted-foreground">
                    {box.dimensions?.length} × {box.dimensions?.width} × {box.dimensions?.height} mm
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">{box.category}</p>
                </div>

                <div>
                  <p className="text-sm font-medium">Estimated Cost</p>
                  <p className="text-sm text-muted-foreground">₹{box.estimatedCost?.toFixed(2) || "0.00"}</p>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/boxes/${box.id}`)}>
                    <Settings className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}