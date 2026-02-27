import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Printer,
  ChevronRight,
  Calculator,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// Redux
import { 
  selectAllJobCards, 
  addJobCard, 
  deleteJobCard,
  updateJobCardStatus 
} from "@/store/slices/jobCardSlice";
import { selectAllJobWorkers } from "@/store/slices/godownJobWorkerSlice";
import { selectAllBoxes } from "@/store/slices/boxMasterSlice";
import { selectAllMaterials } from "@/store/slices/rawMaterialsSlice";
import { selectAllSalesOrders } from "@/store/slices/salesOrderSlice";
import { selectAllClients } from "@/store/slices/clientsSlice";
import { RootState } from "@/store";
import { JobCard } from "@/store/types";

export default function JobCards() {
  const dispatch = useDispatch();
  const jobCards = useSelector((state: any) => selectAllJobCards(state));
  const jobWorkers = useSelector((state: any) => selectAllJobWorkers(state));
  const boxes = useSelector((state: any) => selectAllBoxes(state));
  const materials = useSelector((state: any) => selectAllMaterials(state));
  const salesOrders = useSelector((state: any) => selectAllSalesOrders(state));
  const clients = useSelector((state: any) => selectAllClients(state));

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedJC, setSelectedJC] = useState<JobCard | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    jobWorkerId: "",
    orderId: "",
    expectedReturnDate: "",
    items: [{ boxId: "", quantity: 0 }],
    notes: ""
  });

  const filteredJobCards = jobCards.filter(jc => {
    const matchesSearch = jc.jobWorkerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          jc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || jc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const metrics = {
    open: jobCards.filter(jc => jc.status === 'issued').length,
    inProgress: jobCards.filter(jc => jc.status === 'partially_received').length,
    completed: jobCards.filter(jc => jc.status === 'received' || jc.status === 'closed').length,
    overdue: jobCards.filter(jc => jc.status === 'issued' && new Date(jc.expectedReturnDate) < new Date()).length
  };

  const calculateRequiredMaterials = () => {
    const requirements: Record<string, { name: string, quantity: number, unit: string }> = {};
    
    formData.items.forEach(item => {
      const box = boxes.find(b => b.id === item.boxId);
      if (box && item.quantity > 0) {
        box.materials.forEach(mat => {
          if (!requirements[mat.materialId]) {
            const materialInfo = materials.find(m => m.id === mat.materialId);
            requirements[mat.materialId] = {
              name: materialInfo?.name || "Unknown",
              quantity: 0,
              unit: mat.unit
            };
          }
          requirements[mat.materialId].quantity += mat.quantity * item.quantity;
        });
      }
    });

    return Object.entries(requirements).map(([id, info]) => ({
      materialId: id,
      materialName: info.name,
      quantity: info.quantity,
      unit: info.unit
    }));
  };

  const handleCreateJobCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jobWorkerId || formData.items.some(i => !i.boxId || i.quantity <= 0)) {
      toast.error("Please fill all required fields");
      return;
    }

    const worker = jobWorkers.find(w => w.id === formData.jobWorkerId);
    if (!worker) return;

    const materialsIssued = calculateRequiredMaterials();
    
    const jcItems = formData.items.map(item => {
      const box = boxes.find(b => b.id === item.boxId);
      return {
        id: Math.random().toString(36).substr(2, 9),
        boxId: item.boxId,
        boxName: box?.name || "Unknown",
        quantity: item.quantity,
        receivedQuantity: 0,
        unitPrice: worker.ratePerUnit, // Default to worker's base rate
        totalPrice: worker.ratePerUnit * item.quantity
      };
    });

    const newJC: Omit<JobCard, 'id' | 'createdAt' | 'updatedAt'> = {
      jobWorkerId: worker.id,
      jobWorkerName: worker.name,
      orderId: formData.orderId || undefined,
      issueDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: formData.expectedReturnDate,
      status: 'issued',
      items: jcItems,
      materialsIssued,
      notes: formData.notes
    };

    dispatch(addJobCard(newJC));
    toast.success("Job Card generated successfully");
    setIsCreateDialogOpen(false);
    setFormData({
      jobWorkerId: "",
      orderId: "",
      expectedReturnDate: "",
      items: [{ boxId: "", quantity: 0 }],
      notes: ""
    });
  };

  const getStatusBadge = (status: JobCard['status']) => {
    switch (status) {
      case 'issued': return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Issued</Badge>;
      case 'received': return <Badge variant="secondary" className="bg-green-100 text-green-700">Received</Badge>;
      case 'partially_received': return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Partial</Badge>;
      case 'closed': return <Badge variant="secondary" className="bg-slate-100 text-slate-700">Closed</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Cards (WIP)</h1>
          <p className="text-muted-foreground mt-1">
            Generate and track job worker assignments and production progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Generate Job Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Job Card Generation</DialogTitle>
                <DialogDescription>
                  Create a new job card for a job worker and calculate material requirements.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateJobCard} className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="worker">Job Worker *</Label>
                    <Select 
                      value={formData.jobWorkerId} 
                      onValueChange={(val) => setFormData({...formData, jobWorkerId: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Worker" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobWorkers.map(w => (
                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Link to Sales Order (Optional)</Label>
                    <Select 
                      value={formData.orderId} 
                      onValueChange={(val) => setFormData({...formData, orderId: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Order" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesOrders.map(so => {
                          const client = clients.find(c => c.id === so.clientId);
                          return (
                            <SelectItem key={so.id} value={so.id}>{so.id} - {client?.name || "Unknown Client"}</SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Expected Return Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="dueDate" 
                      type="date" 
                      className="pl-9"
                      value={formData.expectedReturnDate}
                      onChange={(e) => setFormData({...formData, expectedReturnDate: e.target.value})}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Items to Manufacture</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData({...formData, items: [...formData.items, { boxId: "", quantity: 0 }]})}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Product
                    </Button>
                  </div>
                  
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end border p-3 rounded-lg bg-slate-50/50">
                      <div className="col-span-12 md:col-span-7 space-y-2">
                        <Label>Select Box/Product</Label>
                        <Select 
                          value={item.boxId} 
                          onValueChange={(val) => {
                            const newItems = [...formData.items];
                            newItems[index].boxId = val;
                            setFormData({...formData, items: newItems});
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Box" />
                          </SelectTrigger>
                          <SelectContent>
                            {boxes.map(b => (
                              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-12 md:col-span-4 space-y-2">
                        <Label>Quantity</Label>
                        <Input 
                          type="number" 
                          value={item.quantity || ""} 
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].quantity = parseInt(e.target.value) || 0;
                            setFormData({...formData, items: newItems});
                          }}
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-1 flex justify-end">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700"
                          disabled={formData.items.length === 1}
                          onClick={() => {
                            const newItems = formData.items.filter((_, i) => i !== index);
                            setFormData({...formData, items: newItems});
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.items.some(i => i.boxId && i.quantity > 0) && (
                  <div className="mt-6 p-4 border rounded-lg bg-blue-50/30">
                    <div className="flex items-center gap-2 mb-3 text-blue-900 font-semibold">
                      <Calculator className="h-4 w-4" />
                      <h4>Estimated Raw Material Consumption</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {calculateRequiredMaterials().map(mat => (
                        <div key={mat.materialId} className="flex items-center justify-between text-sm py-1 border-b border-blue-100 last:border-0">
                          <span className="text-muted-foreground">{mat.materialName}</span>
                          <span className="font-medium">{mat.quantity} {mat.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions / Notes</Label>
                  <Input 
                    id="notes" 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="e.g. Urgent delivery needed, Handle with care" 
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8">Generate Job Card</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Active Job Cards", desc: "Production in flow", icon: FileText, count: metrics.open + metrics.inProgress, color: "text-blue-500" },
          { title: "Pending Receipt", desc: "Awaiting material", icon: Clock, count: metrics.open, color: "text-amber-500" },
          { title: "Completed Today", desc: "Received job items", icon: CheckCircle, count: metrics.completed, color: "text-green-500" },
          { title: "Overdue Delivery", desc: "Past return date", icon: AlertTriangle, count: metrics.overdue, color: "text-red-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
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
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Production Queue</CardTitle>
              <CardDescription>Monitor and manage all active job cards assigned to workers.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Job Cards..."
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="partially_received">Partial</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead>Job Card ID</TableHead>
                <TableHead>Job Worker</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Exp. Return</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobCards.length > 0 ? filteredJobCards.map((jc) => (
                <TableRow key={jc.id} className="cursor-pointer hover:bg-slate-50/50" onClick={() => {
                  setSelectedJC(jc);
                  setIsDetailDialogOpen(true);
                }}>
                  <TableCell className="font-bold text-blue-700">{jc.id}</TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{jc.jobWorkerName}</div>
                    <div className="text-xs text-muted-foreground">JW ID: {jc.jobWorkerId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {jc.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="text-xs">
                          {item.boxName} <span className="text-muted-foreground">({item.quantity} units)</span>
                        </div>
                      ))}
                      {jc.items.length > 2 && (
                        <div className="text-[10px] text-blue-600 font-medium">+ {jc.items.length - 2} more items</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{new Date(jc.issueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm">
                    <span className={new Date(jc.expectedReturnDate) < new Date() && jc.status !== 'received' ? "text-red-500 font-medium" : ""}>
                      {new Date(jc.expectedReturnDate).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(jc.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" title="View Details" onClick={() => {
                        setSelectedJC(jc);
                        setIsDetailDialogOpen(true);
                      }}>
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => {
                        if (confirm("Delete this Job Card?")) dispatch(deleteJobCard(jc.id));
                      }}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    No Job Cards found. Start by generating one for a worker.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed View Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="border-b pb-4">
            <div className="flex justify-between items-start pr-8">
              <div>
                <DialogTitle>Job Card Details: {selectedJC?.id}</DialogTitle>
                <DialogDescription>
                  Full breakdown of production requirements and status for {selectedJC?.jobWorkerName}.
                </DialogDescription>
              </div>
              <div>{selectedJC && getStatusBadge(selectedJC.status)}</div>
            </div>
          </DialogHeader>

          {selectedJC && (
            <div className="py-6 space-y-8">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label className="text-xs uppercase text-muted-foreground mb-1 block tracking-wider">Worker Details</Label>
                  <div className="font-semibold text-slate-900">{selectedJC.jobWorkerName}</div>
                  <div className="text-xs text-muted-foreground">ID: {selectedJC.jobWorkerId}</div>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground mb-1 block tracking-wider">Critical Dates</Label>
                  <div className="text-sm"><span className="text-muted-foreground">Issued:</span> {new Date(selectedJC.issueDate).toLocaleDateString()}</div>
                  <div className="text-sm font-medium"><span className="text-muted-foreground">Target:</span> {new Date(selectedJC.expectedReturnDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground mb-1 block tracking-wider">Linked Order</Label>
                  <div className="text-sm font-medium">{selectedJC.orderId || "Direct Job"}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-500" />
                  Production Items
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow>
                        <TableHead className="py-2">Box/Product</TableHead>
                        <TableHead className="py-2 text-right">Target Qty</TableHead>
                        <TableHead className="py-2 text-right">Received</TableHead>
                        <TableHead className="py-2 text-right">Pending</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedJC.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="py-2 font-medium">{item.boxName}</TableCell>
                          <TableCell className="py-2 text-right">{item.quantity}</TableCell>
                          <TableCell className="py-2 text-right">{item.receivedQuantity}</TableCell>
                          <TableCell className="py-2 text-right text-blue-600 font-semibold">
                            {item.quantity - item.receivedQuantity}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Printer className="h-4 w-4 text-amber-500" />
                  Material Issued to Worker
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedJC.materialsIssued.map((mat, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="text-sm font-medium">{mat.materialName}</div>
                      <div className="text-sm bg-white px-2 py-1 rounded border font-bold text-slate-700">
                        {mat.quantity} {mat.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedJC.notes && (
                <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                  <Label className="text-[10px] uppercase font-bold text-amber-800 mb-1 block">Notes / Instructions</Label>
                  <p className="text-sm italic text-amber-900">{selectedJC.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
            <Button className="bg-slate-800 text-white hover:bg-slate-900">
              <Printer className="h-4 w-4 mr-2" />
              Print Job Card
            </Button>
            {selectedJC?.status === 'issued' && (
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  dispatch(updateJobCardStatus({ id: selectedJC.id, status: 'partially_received' }));
                  setSelectedJC({...selectedJC, status: 'partially_received'});
                  toast.success("Job marked as started");
                }}
              >
                Start Production
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
