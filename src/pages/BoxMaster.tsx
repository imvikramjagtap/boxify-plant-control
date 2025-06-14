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
import { ArrowLeft, Plus, Search, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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

// Mock clients data (will be replaced with actual client data later)
const mockClients = [
  { id: "CLI001", name: "ABC Industries Pvt Ltd" },
  { id: "CLI002", name: "XYZ Corp" },
  { id: "CLI003", name: "DEF Ltd" }
];

export default function BoxMaster() {
  const { boxId } = useParams<{ boxId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  // Mock boxes data (in real app, this would come from state management)
  const [boxes, setBoxes] = useState<Box[]>([
    {
      id: "BOX001",
      boxName: "Monitor Packaging Box",
      itemCode: "MPB-001",
      clientId: "CLI001",
      clientName: "ABC Industries Pvt Ltd",
      length: "520",
      width: "380",
      height: "400",
      ply: "5 Ply",
      boxType: "RSC",
      fluteType: "BC",
      mfgJoint: "Stitching Pin",
      numberOfPins: 8,
      printing: true,
      numberOfColors: "2",
      printingType: "Flexo",
      colorCode: ["Black", "Red"],
      contentWeight: 15,
      stackHeight: 6,
      safetyFactor: 4,
      paperSpecs: [
        { gsm: "150", bf: "16" },
        { gsm: "120", bf: "14" },
        { gsm: "150", bf: "16" },
        { gsm: "120", bf: "14" },
        { gsm: "150", bf: "16" }
      ],
      totalBoxWeight: 485.2,
      compressionStrength: 300,
      createdAt: "2024-06-15"
    }
  ]);

  const existingBox = boxId ? boxes.find(box => box.id === boxId) : null;

  const getDefaultValues = (): FormValues => {
    if (existingBox) {
      return {
        boxName: existingBox.boxName,
        itemCode: existingBox.itemCode,
        clientId: existingBox.clientId,
        length: existingBox.length,
        width: existingBox.width,
        height: existingBox.height,
        ply: existingBox.ply,
        boxType: existingBox.boxType,
        fluteType: existingBox.fluteType,
        mfgJoint: existingBox.mfgJoint,
        numberOfPins: existingBox.numberOfPins,
        printing: existingBox.printing,
        numberOfColors: existingBox.numberOfColors,
        printingType: existingBox.printingType,
        colorCode: existingBox.colorCode || [""],
        contentWeight: existingBox.contentWeight,
        stackHeight: existingBox.stackHeight,
        safetyFactor: existingBox.safetyFactor,
        paperSpecs: existingBox.paperSpecs
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
    const selectedClient = mockClients.find(client => client.id === data.clientId);
    const box: Box = {
      id: boxId || uuidv4(),
      boxName: data.boxName,
      itemCode: data.itemCode,
      clientId: data.clientId,
      clientName: selectedClient ? selectedClient.name : '',
      length: data.length,
      width: data.width,
      height: data.height,
      ply: data.ply,
      boxType: data.boxType,
      fluteType: data.fluteType,
      mfgJoint: data.mfgJoint,
      numberOfPins: data.numberOfPins,
      printing: data.printing,
      numberOfColors: data.numberOfColors,
      printingType: data.printingType,
      colorCode: data.colorCode,
      contentWeight: data.contentWeight,
      stackHeight: data.stackHeight,
      safetyFactor: data.safetyFactor,
      paperSpecs: getVisiblePaperSpecs().map(spec => ({
        gsm: spec.gsm.toString(),
        bf: spec.bf.toString()
      })),
      totalBoxWeight,
      compressionStrength,
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (boxId) {
      setBoxes(boxes.map(b => b.id === boxId ? box : b));
      toast({
        title: "Box Updated",
        description: "Box specifications have been successfully updated.",
      });
    } else {
      setBoxes([...boxes, box]);
      toast({
        title: "Box Added",
        description: "New box has been successfully added to the system.",
      });
    }

    setShowForm(false);
    console.log(JSON.stringify(box, null, 2));
  };

  const filteredBoxes = boxes.filter(box =>
    box.boxName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    box.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    box.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm || boxId) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => {setShowForm(false); navigate('/boxes');}} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{boxId ? 'Edit Box' : 'Add New Box'}</h1>
        </div>
        
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>BOX MASTER CARD</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <SelectItem value="Stitching Pin">Stitching Pin</SelectItem>
                          <SelectItem value="Glue">Glue</SelectItem>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              {["1", "2", "3", "4", "5", "6"].map((num) => (
                                <SelectItem key={num} value={num}>
                                  {num}
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
                              <SelectItem value="Flexo">Flexo</SelectItem>
                              <SelectItem value="Offset">Offset</SelectItem>
                              <SelectItem value="Screen">Screen</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="col-span-full">
                      <Label>Colour Code:</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                <div className="overflow-x-auto">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="flex justify-end space-x-2">
                <Button type="submit">{boxId ? 'Update' : 'Save'}</Button>
                <Button type="button" variant="outline" onClick={() => {setShowForm(false); navigate('/boxes');}}>Cancel</Button>
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

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search boxes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Boxes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBoxes.map((box) => (
          <Card key={box.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{box.boxName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{box.itemCode}</p>
                </div>
                <Badge variant="outline">{box.ply}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Client</p>
                <p className="text-sm text-muted-foreground">{box.clientName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Dimensions (L×W×H)</p>
                <p className="text-sm text-muted-foreground">{box.length} × {box.width} × {box.height} mm</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Box Type & Flute</p>
                <p className="text-sm text-muted-foreground">{box.boxType} • {box.fluteType}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Manufacturing</p>
                <p className="text-sm text-muted-foreground">
                  {box.mfgJoint}
                  {box.numberOfPins && ` (${box.numberOfPins} pins)`}
                </p>
              </div>

              {box.printing && (
                <div>
                  <p className="text-sm font-medium">Printing</p>
                  <p className="text-sm text-muted-foreground">
                    {box.printingType} • {box.numberOfColors} colors
                  </p>
                </div>
              )}

              {box.totalBoxWeight && (
                <div>
                  <p className="text-sm font-medium">Box Weight</p>
                  <p className="text-sm text-muted-foreground">{box.totalBoxWeight.toFixed(2)} gm</p>
                </div>
              )}
              
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
    </div>
  );
}