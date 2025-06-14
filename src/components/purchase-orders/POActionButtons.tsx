import { Button } from "@/components/ui/button";
import {
  Edit,
  Send,
  Check,
  XCircle,
  Copy,
  CheckCircle,
  Package,
  Truck,
  Download,
  Eye,
} from "lucide-react";

interface POActionButtonsProps {
  po: any;
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

export default function POActionButtons({
  po,
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
}: POActionButtonsProps) {
  const buttons = [];
  
  switch (po.status) {
    case 'draft':
      buttons.push(
        <Button
          key="edit"
          size="sm"
          variant="outline"
          onClick={() => onEdit(po)}
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>,
        <Button
          key="submit"
          size="sm"
          onClick={() => onSubmit(po)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-3 w-3 mr-1" />
          Submit
        </Button>
      );
      break;
    
    case 'pending':
      buttons.push(
        <Button
          key="approve"
          size="sm"
          onClick={() => onApprove(po)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="h-3 w-3 mr-1" />
          Approve
        </Button>,
        <Button
          key="reject"
          size="sm"
          variant="destructive"
          onClick={() => onReject(po)}
        >
          <XCircle className="h-3 w-3 mr-1" />
          Reject
        </Button>
      );
      break;
    
    case 'approved':
      buttons.push(
        <Button
          key="copy-template"
          size="sm"
          variant="outline"
          onClick={() => onCopyEmailTemplate(po)}
        >
          <Copy className="h-3 w-3 mr-1" />
          Copy Email
        </Button>,
        <Button
          key="send"
          size="sm"
          onClick={() => onSend(po)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Send className="h-3 w-3 mr-1" />
          Send to Supplier
        </Button>
      );
      break;
    
    case 'sent':
      buttons.push(
        <Button
          key="acknowledge"
          size="sm"
          onClick={() => onAcknowledge(po)}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Mark Acknowledged
        </Button>
      );
      break;
    
    case 'acknowledged':
      buttons.push(
        <Button
          key="partial-delivery"
          size="sm"
          variant="outline"
          onClick={() => onPartialDelivery(po)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Package className="h-3 w-3 mr-1" />
          Partial Delivery
        </Button>,
        <Button
          key="deliver"
          size="sm"
          onClick={() => onMarkDelivered(po)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Truck className="h-3 w-3 mr-1" />
          Mark Delivered
        </Button>
      );
      break;
  }

  // Always available actions
  buttons.push(
    <Button
      key="download"
      size="sm"
      variant="outline"
      onClick={() => onDownload(po)}
    >
      <Download className="h-3 w-3 mr-1" />
      Download
    </Button>,
    <Button
      key="view"
      size="sm"
      variant="outline"
      onClick={() => onView(po)}
    >
      <Eye className="h-3 w-3 mr-1" />
      View
    </Button>
  );

  return <>{buttons}</>;
}