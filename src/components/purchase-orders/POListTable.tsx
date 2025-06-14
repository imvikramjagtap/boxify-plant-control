import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import POActionButtons from "./POActionButtons";
import { FileText, Clock, CheckCircle, Send, Eye, Truck, XCircle, AlertTriangle } from "lucide-react";

interface POListTableProps {
  purchaseOrders: any[];
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  onEdit: (po: any) => void;
  onSubmit: (po: any) => void;
  onApprove: (po: any) => void;
  onReject: (po: any) => void;
  onSend: (po: any) => void;
  onCopyEmailTemplate: (po: any) => void;
  onAcknowledge: (po: any) => void;
  onMarkDelivered: (po: any) => void;
  onDownload: (po: any) => void;
  onView: (po: any) => void;
  onPartialDelivery: (po: any) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "draft": return "bg-secondary";
    case "pending": return "bg-yellow-500";
    case "approved": return "bg-blue-500";
    case "sent": return "bg-purple-500";
    case "acknowledged": return "bg-cyan-500";
    case "delivered": return "bg-green-500";
    case "rejected": return "bg-destructive";
    case "cancelled": return "bg-red-500";
    default: return "bg-secondary";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "draft": return <FileText className="h-3 w-3" />;
    case "pending": return <Clock className="h-3 w-3" />;
    case "approved": return <CheckCircle className="h-3 w-3" />;
    case "sent": return <Send className="h-3 w-3" />;
    case "acknowledged": return <Eye className="h-3 w-3" />;
    case "delivered": return <Truck className="h-3 w-3" />;
    case "rejected": return <XCircle className="h-3 w-3" />;
    case "cancelled": return <AlertTriangle className="h-3 w-3" />;
    default: return <FileText className="h-3 w-3" />;
  }
};

export default function POListTable({
  purchaseOrders,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onSubmit,
  onApprove,
  onReject,
  onSend,
  onCopyEmailTemplate,
  onAcknowledge,
  onMarkDelivered,
  onDownload,
  onView,
  onPartialDelivery
}: POListTableProps) {
  const handleSort = (field: string) => {
    onSort(field);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleSort("id")}
          >
            PO Number {sortField === "id" && (sortDirection === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleSort("supplier.name")}
          >
            Supplier {sortField === "supplier.name" && (sortDirection === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleSort("date")}
          >
            Date {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleSort("expectedDelivery")}
          >
            Expected Delivery {sortField === "expectedDelivery" && (sortDirection === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleSort("status")}
          >
            Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleSort("totalAmount")}
          >
            Amount {sortField === "totalAmount" && (sortDirection === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchaseOrders.map((po) => (
          <TableRow key={po.id}>
            <TableCell className="font-medium">{po.id}</TableCell>
            <TableCell>{po.supplier.name}</TableCell>
            <TableCell>{format(po.date, "dd MMM yyyy")}</TableCell>
            <TableCell>{format(po.expectedDelivery, "dd MMM yyyy")}</TableCell>
            <TableCell>
              <Badge className={`${getStatusColor(po.status)} text-white`}>
                {getStatusIcon(po.status)}
                <span className="ml-1 capitalize">{po.status}</span>
              </Badge>
            </TableCell>
            <TableCell>₹{po.totalAmount.toLocaleString()}</TableCell>
            <TableCell>{po.items.length} items</TableCell>
            <TableCell>
              <div className="flex gap-1 flex-wrap">
                <POActionButtons
                  po={po}
                  onEdit={onEdit}
                  onSubmit={onSubmit}
                  onApprove={onApprove}
                  onReject={onReject}
                  onSend={onSend}
                  onCopyEmailTemplate={onCopyEmailTemplate}
                  onAcknowledge={onAcknowledge}
                  onMarkDelivered={onMarkDelivered}
                  onDownload={onDownload}
                  onView={onView}
                  onPartialDelivery={onPartialDelivery}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}