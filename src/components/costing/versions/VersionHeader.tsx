import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus } from "lucide-react";

interface VersionHeaderProps {
  versionsCount: number;
  currentStatus: string;
  onCreateVersion: () => void;
}

export default function VersionHeader({ versionsCount, currentStatus, onCreateVersion }: VersionHeaderProps) {
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

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5" />
        <span>Quote Versions ({versionsCount})</span>
        <Badge className={getStatusColor(currentStatus)}>
          Current: {currentStatus}
        </Badge>
      </div>
      <Button onClick={onCreateVersion} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Create Version
      </Button>
    </div>
  );
}