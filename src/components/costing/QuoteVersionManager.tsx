import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addQuotationVersion, approveQuotationVersion, rejectQuotationVersion } from "@/store/slices/quotationManagementSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import VersionHeader from "./versions/VersionHeader";
import VersionsGrid from "./versions/VersionsGrid";
import CreateVersionDialog from "./versions/CreateVersionDialog";

interface QuoteVersionManagerProps {
  quotationId: string;
  costingProjectId: string;
  currentQuoteStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  onStatusChange: (status: 'draft' | 'pending' | 'approved' | 'rejected') => void;
}

export default function QuoteVersionManager({ 
  quotationId, 
  costingProjectId, 
  currentQuoteStatus, 
  onStatusChange 
}: QuoteVersionManagerProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const versions = useAppSelector(state => 
    state.quotationManagement?.versions?.filter(v => v.quotationId === quotationId) || []
  );

  const handleCreateVersion = (changes: string) => {
    const changesList = changes.split('\n').filter(line => line.trim());
    
    dispatch(addQuotationVersion({
      versionNumber: versions.length + 1,
      quotationId,
      costingProjectId,
      changes: changesList,
      createdBy: "Current User", // In real app, get from auth
      isActive: true,
      approvalStatus: 'draft',
    }));

    toast({
      title: "Version Created",
      description: `Version ${versions.length + 1} has been created successfully.`,
    });

    setShowCreateDialog(false);
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
    dispatch(rejectQuotationVersion({ id: versionId, rejectionReason: "Manual rejection" }));
    onStatusChange('rejected');
    toast({
      title: "Version Rejected",
      description: "Quotation version has been rejected and main quote status updated.",
    });
  };

  const handleView = (versionId: string) => {
    // TODO: Implement version view functionality
    toast({
      title: "Version Details",
      description: "Version details view coming soon.",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <VersionHeader 
              versionsCount={versions.length}
              currentStatus={currentQuoteStatus}
              onCreateVersion={() => setShowCreateDialog(true)}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VersionsGrid 
            versions={versions}
            onApprove={handleApprove}
            onReject={handleReject}
            onView={handleView}
          />
        </CardContent>
      </Card>

      <CreateVersionDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreateVersion={handleCreateVersion}
        currentPrice={0} // Will be passed from parent
        quantity={1} // Will be passed from parent
      />
    </>
  );
}