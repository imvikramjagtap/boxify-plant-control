import VersionCard from "./VersionCard";
import { QuotationVersion } from "@/store/slices/quotationManagementSlice";

interface VersionsGridProps {
  versions: QuotationVersion[];
  onApprove: (versionId: string) => void;
  onReject: (versionId: string) => void;
  onView: (versionId: string) => void;
}

export default function VersionsGrid({ versions, onApprove, onReject, onView }: VersionsGridProps) {
  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No versions created yet. Create your first version to start the approval process.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {versions.map((version) => (
        <VersionCard
          key={version.id}
          version={version}
          onApprove={onApprove}
          onReject={onReject}
          onView={onView}
        />
      ))}
    </div>
  );
}