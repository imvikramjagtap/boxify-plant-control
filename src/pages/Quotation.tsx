import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  FileSpreadsheet, 
  Send, 
  CheckCircle, 
  Clock, 
  Search, 
  Plus, 
  Eye, 
  Download, 
  History, 
  ArrowRight,
  Printer,
  Ban,
  Filter
} from "lucide-react";
import { selectAllCostingProjects, updateCostingProject } from "@/store/slices/costingSlice";
import { 
  addQuotationVersion, 
  approveQuotationVersion, 
  rejectQuotationVersion,
  selectQuotationVersionsByQuotationId 
} from "@/store/slices/quotationManagementSlice";
import { createSalesOrderFromQuote } from "@/store/slices/salesOrderSlice";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Quotation() {
  const dispatch = useDispatch();
  const costingProjects = useSelector(selectAllCostingProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Derive "Quotations" from Costing Projects that have a quotationId
  const quotes = useMemo(() => {
    return costingProjects.filter(p => !!p.quotationId);
  }, [costingProjects]);

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.quotationId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         q.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (quote: any) => {
    dispatch(updateCostingProject({ id: quote.id, updates: { status: 'approved' } }));
    toast.success(`Quotation ${quote.quotationId} approved`);
  };

  const handleConvertToSO = (quote: any) => {
    dispatch(createSalesOrderFromQuote({
      quotationId: quote.quotationId,
      costingProjectId: quote.id,
      clientId: quote.clientId,
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: "Current User"
    }));
    dispatch(updateCostingProject({ id: quote.id, updates: { status: 'converted' } }));
    toast.success(`Sales Order created from ${quote.quotationId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'quoted': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Sent</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
      case 'converted': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Converted to SO</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quotation Management</h1>
          <p className="text-muted-foreground mt-1">
            Track client offers, manage approvals, and convert quotes to orders.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Bulk Print
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Active Quotes", desc: "Awaiting approval", icon: Clock, count: quotes.filter(q => q.status === 'quoted').length, color: "text-blue-500" },
          { title: "Converted", desc: "Successfully closed", icon: CheckCircle, count: quotes.filter(q => q.status === 'converted').length, color: "text-green-500" },
          { title: "Avg. Turnaround", desc: "Quote to Order", icon: History, count: "4.2 Days", color: "text-purple-500" },
          { title: "Potential Revenue", desc: "Total quoted value", icon: FileSpreadsheet, count: "₹2.4M", color: "text-amber-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
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
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Sent Quotations</CardTitle>
              <CardDescription>View status and history of all sent offers.</CardDescription>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search quote or client..." 
                  className="pl-9 bg-slate-50 border-slate-200" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Quote No.</TableHead>
                  <TableHead>Costing Project</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.length > 0 ? filteredQuotes.map((quote) => (
                  <TableRow key={quote.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs font-bold text-blue-700">
                      {quote.quotationId}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-900">{quote.name}</div>
                      <div className="text-xs text-muted-foreground">{quote.boxName} | {quote.quantity} units</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(quote.quotationDetails.quotationDate), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-sm font-semibold">
                      ₹{quote.calculations.totalPrice.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(quote.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setSelectedQuote(quote);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {quote.status === 'quoted' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(quote)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {quote.status === 'approved' && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 h-8 px-2 text-xs"
                            onClick={() => handleConvertToSO(quote)}
                          >
                            Convert to SO
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <FileSpreadsheet className="h-8 w-8 mb-2 opacity-20" />
                        <p>No quotations found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quote Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quotation Details: {selectedQuote?.quotationId}</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-8 text-sm border-b pb-6">
                <div>
                  <h4 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider mb-2">Client Details</h4>
                  <p className="font-medium text-base text-blue-900">{selectedQuote.name}</p>
                  <p className="text-muted-foreground mt-1">CID: {selectedQuote.clientId}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider mb-2">Quote Info</h4>
                  <p>Date: {format(new Date(selectedQuote.quotationDetails.quotationDate), 'PPP')}</p>
                  <p>Validity: {selectedQuote.quotationDetails.validityDays} Days</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 border-l-2 border-blue-600 pl-3">Corrugation & Box Specs</h4>
                <div className="bg-slate-50 p-4 rounded-lg grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Box Type:</span>
                    <p className="font-medium">{selectedQuote.boxName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <p className="font-medium">{selectedQuote.quantity} Units</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Weight:</span>
                    <p className="font-medium">{selectedQuote.totalBoxWeight} Kg</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cost per Unit:</span>
                    <p className="font-medium text-blue-700">₹{selectedQuote.calculations.totalCostPerBox.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 border-l-2 border-green-600 pl-3">Commercial Terms</h4>
                <div className="bg-green-50/30 p-4 rounded-lg grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Payment:</span>
                    <p className="font-medium">{selectedQuote.quotationDetails.paymentTerms}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Delivery:</span>
                    <p className="font-medium">{selectedQuote.quotationDetails.deliveryTerms}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-2xl font-bold text-slate-900">
                  Total: ₹{selectedQuote.calculations.totalPrice.toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    Revisions
                  </Button>
                  <Button size="sm" className="bg-blue-600">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
