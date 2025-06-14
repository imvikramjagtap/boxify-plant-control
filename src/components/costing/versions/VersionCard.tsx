import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { QuotationVersion } from "@/store/slices/quotationManagementSlice";

interface VersionCardProps {
  version: QuotationVersion;
  onApprove: (versionId: string) => void;
  onReject: (versionId: string) => void;
  onView: (versionId: string) => void;
}

export default function VersionCard({ version, onApprove, onReject, onView }: VersionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className={version.isActive ? 'ring-2 ring-blue-500' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <span>Version {version.versionNumber}</span>
            {version.isActive && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Current
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon(version.approvalStatus)}
            <Badge className={getStatusColor(version.approvalStatus)}>
              {version.approvalStatus}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Created: {new Date(version.createdAt).toLocaleString()}
          {version.approvedAt && (
            <><br />Approved: {new Date(version.approvedAt).toLocaleString()}</>
          )}
          {version.approvedBy && (
            <><br />By: {version.approvedBy}</>
          )}
        </div>

        <div className="text-sm">
          <div className="font-medium mb-1">Changes:</div>
          <div className="space-y-1">
            {version.changes.map((change, index) => (
              <div key={index} className="text-muted-foreground">• {change}</div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onView(version.id)}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          {version.approvalStatus === 'draft' && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onApprove(version.id)}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onReject(version.id)}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}