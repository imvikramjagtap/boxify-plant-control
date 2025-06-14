import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addQuotationVersion, approveQuotationVersion, rejectQuotationVersion, selectQuotationVersionsByQuotationId } from "@/store/slices/quotationManagementSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Clock, Check, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuoteVersionManagerProps {
  quotationId: string;
  costingProjectId: string;
  currentQuoteStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  onStatusChange: (status: 'draft' | 'pending' | 'approved' | 'rejected') => void;
}

export default function QuoteVersionManager({ quotationId, costingProjectId, currentQuoteStatus, onStatusChange }: QuoteVersionManagerProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [isNewVersionOpen, setIsNewVersionOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [changes, setChanges] = useState("");

  const versions = useAppSelector(state => 
    state.quotationManagement?.versions?.filter(v => v.quotationId === quotationId) || []
  );

  const handleCreateVersion = () => {
    if (!changes.trim()) {
      toast({
        title: "Error",
        description: "Please describe the changes made in this version.",
        variant: "destructive",
      });
      return;
    }

    dispatch(addQuotationVersion({
      versionNumber: versions.length + 1,
      quotationId,
      costingProjectId,
      changes: changes.split('\n').filter(line => line.trim()),
      createdBy: "Current User", // In real app, get from auth
      isActive: true,
      approvalStatus: 'draft',
    }));

    toast({
      title: "Version Created",
      description: `Version ${versions.length + 1} has been created successfully.`,
    });

    setChanges("");
    setIsNewVersionOpen(false);
  };

  const handleApprove = (versionId: string) => {
    dispatch(approveQuotationVersion({ id: versionId, approvedBy: "Current User" }));
    onStatusChange('approved');
    toast({
      title: "Version Approved",
      description: "Quotation version has been approved and main quote status updated.",
    });
  };

  const handleReject = (versionId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason.",
        variant: "destructive",
      });
      return;
    }

    dispatch(rejectQuotationVersion({ id: versionId, rejectionReason }));
    onStatusChange('rejected');
    toast({
      title: "Version Rejected",
      description: "Quotation version has been rejected and main quote status updated.",
    });
    setRejectionReason("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quote Versions
            <Badge 
              className={`ml-2 ${
                currentQuoteStatus === 'approved' ? 'bg-green-500' :
                currentQuoteStatus === 'rejected' ? 'bg-red-500' :
                currentQuoteStatus === 'pending' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`}
            >
              {currentQuoteStatus.toUpperCase()}
            </Badge>
          </CardTitle>
          <Dialog open={isNewVersionOpen} onOpenChange={setIsNewVersionOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Version
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Quote Version</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="changes">Changes Made (one per line):</Label>
                  <Textarea
                    id="changes"
                    value={changes}
                    onChange={(e) => setChanges(e.target.value)}
                    placeholder="Updated pricing based on material cost changes&#10;Adjusted delivery timeline&#10;Modified specifications"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsNewVersionOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateVersion}>
                    Create Version
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No versions created yet. Create the first version to track changes.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">v{version.versionNumber}</span>
                      {version.isActive && <Badge variant="outline">Active</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(version.approvalStatus)}>
                      {version.approvalStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {version.changes.map((change, index) => (
                        <div key={index} className="text-sm">• {change}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(version.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {version.approvalStatus === 'draft' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(version.id)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Version {version.versionNumber}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="rejection-reason">Rejection Reason:</Label>
                                <Textarea
                                  id="rejection-reason"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Please provide the reason for rejection..."
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline">Cancel</Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleReject(version.id)}
                                >
                                  Reject Version
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                    {version.approvalStatus === 'pending' && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Awaiting Approval
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}