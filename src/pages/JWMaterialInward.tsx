import { useState } from "react";
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
  PackageCheck, 
  Truck, 
  ClipboardCheck, 
  Package, 
  Plus, 
  Search, 
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  History,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// Redux
import { 
  selectAllJobCards, 
  addReceivedItem,
  updateJobCardStatus 
} from "@/store/slices/jobCardSlice";
import { selectAllJobWorkers } from "@/store/slices/godownJobWorkerSlice";
import { RootState } from "@/store";
import { JobCard } from "@/store/types";

export default function JWMaterialInward() {
  const dispatch = useDispatch();
  const jobCards = useSelector((state: any) => selectAllJobCards(state));
  const jobWorkers = useSelector((state: any) => selectAllJobWorkers(state));

  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [selectedJCId, setSelectedJCId] = useState("");
  const [receivingItems, setReceivingItems] = useState<Record<string, number>>({});
  
  const activeJobCards = jobCards.filter(jc => jc.status === 'issued' || jc.status === 'partially_received');
  const finishedJobCards = jobCards.filter(jc => jc.status === 'received' || jc.status === 'closed').slice(0, 10);

  const stats = {
    pending: activeJobCards.length,
    receivedToday: finishedJobCards.filter(jc => new Date(jc.actualReturnDate || "").toDateString() === new Date().toDateString()).length,
    totalItemsAtJW: activeJobCards.reduce((acc, jc) => acc + jc.items.reduce((iAcc, item) => iAcc + (item.quantity - item.receivedQuantity), 0), 0)
  };

  const handleJCSelect = (jcId: string) => {
    setSelectedJCId(jcId);
    const jc = activeJobCards.find(j => j.id === jcId);
    if (jc) {
      const initial: Record<string, number> = {};
      jc.items.forEach(item => {
        initial[item.id] = (item.quantity - item.receivedQuantity);
      });
      setReceivingItems(initial);
    }
  };

  const handleRecordInward = () => {
    const jc = activeJobCards.find(j => j.id === selectedJCId);
    if (!jc) return;

    let hasReceived = false;
    Object.entries(receivingItems).forEach(([itemId, qty]) => {
      if (qty > 0) {
        dispatch(addReceivedItem({
          jcId: selectedJCId,
          itemId,
          quantity: qty
        }));
        hasReceived = true;
      }
    });

    if (hasReceived) {
      toast.success(`Inward recorded for ${selectedJCId}`);
      setIsRecordDialogOpen(false);
      setSelectedJCId("");
      setReceivingItems({});
    } else {
      toast.error("Please enter a valid quantity for at least one item.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">JW Material Inward</h1>
          <p className="text-muted-foreground mt-1">
            Track and record processed materials received back from Job Workers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <ArrowDownLeft className="h-4 w-4 mr-2" />
                Record Inward Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Record Inward from Job Worker</DialogTitle>
                <DialogDescription>
                  Select an active Job Card and enter the quantities received.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Job Card / Work Order *</Label>
                  <Select value={selectedJCId} onValueChange={handleJCSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Active Job Card" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeJobCards.map(jc => (
                        <SelectItem key={jc.id} value={jc.id}>
                          {jc.id} - {jc.jobWorkerName} ({jc.items.length} items)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedJCId && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Items Scheduled for Return</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead className="py-2 text-xs">Box Type</TableHead>
                            <TableHead className="py-2 text-xs text-center">Issued</TableHead>
                            <TableHead className="py-2 text-xs text-center">Prev. Rec.</TableHead>
                            <TableHead className="py-2 text-xs text-right w-32">Receiving Now</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeJobCards.find(j => j.id === selectedJCId)?.items.map(item => (
                            <TableRow key={item.id}>
                              <TableCell className="py-2 font-medium">{item.boxName}</TableCell>
                              <TableCell className="py-2 text-center text-slate-500">{item.quantity}</TableCell>
                              <TableCell className="py-2 text-center text-emerald-600">{item.receivedQuantity}</TableCell>
                              <TableCell className="py-2 text-right">
                                <Input 
                                  type="number"
                                  className="h-8 text-right font-bold border-emerald-200 focus-visible:ring-emerald-500"
                                  value={receivingItems[item.id] || ""}
                                  onChange={(e) => setReceivingItems({
                                    ...receivingItems,
                                    [item.id]: Math.min(parseInt(e.target.value) || 0, (item.quantity - item.receivedQuantity))
                                  })}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 p-3 rounded-lg flex items-start gap-3 border border-amber-100 italic text-sm text-amber-800">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p>Inward entries will automatically update the Job Card status and replenish stock for finished goods.</p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRecordDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleRecordInward} 
                  disabled={!selectedJCId}
                  className="bg-emerald-600 hover:bg-emerald-700 px-8"
                >
                  Confirm Receipt
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Pending Job Cards", desc: "Out at Job Workers", icon: Truck, count: stats.pending, color: "text-amber-500" },
          { title: "Received Today", desc: "Entries completed", icon: PackageCheck, count: stats.receivedToday, color: "text-emerald-500" },
          { title: "Items in Pipeline", desc: "Total qty pending return", icon: Package, count: stats.totalItemsAtJW, color: "text-blue-500" },
          { title: "QC Status", desc: "Inspection pass rate", icon: ClipboardCheck, count: "98%", color: "text-purple-500" },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Active Assignments
            </CardTitle>
            <CardDescription>Job cards currently being processed by outside vendors.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>JW Name</TableHead>
                  <TableHead>JC ID</TableHead>
                  <TableHead className="text-right">Issued</TableHead>
                  <TableHead className="text-right">Return Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeJobCards.length > 0 ? activeJobCards.map((jc) => (
                  <TableRow key={jc.id} className="text-sm">
                    <TableCell className="font-medium">{jc.jobWorkerName}</TableCell>
                    <TableCell className="text-blue-600 font-bold">{jc.id}</TableCell>
                    <TableCell className="text-right">{jc.items.reduce((a, i) => a + i.quantity, 0)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-emerald-600">
                          {jc.items.reduce((a, i) => a + i.receivedQuantity, 0)}
                        </span>
                        <div className="w-16 h-1 mt-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${(jc.items.reduce((a, i) => a + i.receivedQuantity, 0) / jc.items.reduce((a, i) => a + i.quantity, 0)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">No active assignments</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-500" />
              Recent Inwards
            </CardTitle>
            <CardDescription>Recently returned job cards fully received.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Job Card</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finishedJobCards.length > 0 ? finishedJobCards.map((jc) => (
                  <TableRow key={jc.id} className="text-sm">
                    <TableCell>{new Date(jc.actualReturnDate || jc.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-bold">{jc.id}</TableCell>
                    <TableCell>{jc.jobWorkerName}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                        Received
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">No recent returns</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
