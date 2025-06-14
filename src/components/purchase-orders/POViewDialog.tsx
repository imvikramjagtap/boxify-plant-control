import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Send,
  Building,
  Phone,
  Mail,
  MapPin,
  Hash,
  DollarSign,
  Truck,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  Eye,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import DeliveryTrackingTable from "@/components/forms/DeliveryTrackingTable";

interface POViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPO: any;
  onDownload: (po: any) => void;
  onSend: (po: any) => void;
  onCopyEmailTemplate: (po: any) => void;
  onDeliveryUpdate: (itemId: string, deliveredQuantity: number, qualityAccepted: boolean, grnNumber?: string, inspectionNotes?: string) => void;
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

export default function POViewDialog({
  isOpen,
  onClose,
  selectedPO,
  onDownload,
  onSend,
  onCopyEmailTemplate,
  onDeliveryUpdate
}: POViewDialogProps) {
  if (!selectedPO) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Purchase Order - {selectedPO.id}
          </DialogTitle>
        </DialogHeader>

        {selectedPO && (
          <div className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <strong>Status:</strong>
                    <Badge className={`${getStatusColor(selectedPO.status)} text-white`}>
                      {getStatusIcon(selectedPO.status)}
                      <span className="ml-1 capitalize">{selectedPO.status}</span>
                    </Badge>
                  </div>
                  <div><strong>Date:</strong> {format(selectedPO.date, "dd MMM yyyy")}</div>
                  <div><strong>Expected Delivery:</strong> {format(selectedPO.expectedDelivery, "dd MMM yyyy")}</div>
                  <div><strong>Requested By:</strong> {selectedPO.requestedBy}</div>
                  {selectedPO.approvedBy && (
                    <div><strong>Approved By:</strong> {selectedPO.approvedBy}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Supplier Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Name:</strong> {selectedPO.supplier.name}</div>
                  <div><strong>Product Type:</strong> {selectedPO.supplier.productType}</div>
                  <div><strong>Phone:</strong> {selectedPO.supplier.phone}</div>
                  <div><strong>Email:</strong> {selectedPO.supplier.email}</div>
                  <div><strong>GST:</strong> {selectedPO.supplier.gstNumber}</div>
                  <div><strong>Address:</strong> {selectedPO.supplier.address}</div>
                </CardContent>
              </Card>
            </div>

            {/* Delivery Tracking for acknowledged orders */}
            {(selectedPO.status === 'acknowledged' || selectedPO.status === 'delivered') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Delivery Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <DeliveryTrackingTable
                    purchaseOrder={selectedPO}
                    onDeliveryUpdate={onDeliveryUpdate}
                  />
                </CardContent>
              </Card>
            )}

            {/* Items Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Specifications</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Rate (₹)</TableHead>
                      <TableHead>GST (₹)</TableHead>
                      <TableHead>Total (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPO.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.materialName}</div>
                            {item.specifications && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.specifications.gsm && `GSM: ${item.specifications.gsm}`}
                                {item.specifications.bf && ` | BF: ${item.specifications.bf}`}
                                {item.specifications.ect && ` | ECT: ${item.specifications.ect}`}
                                {item.specifications.fluteType && ` | Flute: ${item.specifications.fluteType}`}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.specifications && (
                            <div className="text-xs space-y-1">
                              {item.specifications.grade && <div>Grade: {item.specifications.grade}</div>}
                              {item.specifications.thickness && <div>Thickness: {item.specifications.thickness}mm</div>}
                              {item.specifications.moistureContent && <div>Moisture: ≤{item.specifications.moistureContent}%</div>}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>₹{item.rate.toFixed(2)}</TableCell>
                        <TableCell>₹{(item.gstAmount || 0).toFixed(2)}</TableCell>
                        <TableCell>₹{item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Separator className="my-4" />
                <div className="flex justify-end">
                  <div className="text-right space-y-1">
                    {selectedPO.taxCalculation && (
                      <>
                        <div className="text-sm">
                          Subtotal: ₹{selectedPO.taxCalculation.subtotal.toFixed(2)}
                        </div>
                        <div className="text-sm">
                          GST: ₹{selectedPO.taxCalculation.gstAmount.toFixed(2)}
                        </div>
                        {selectedPO.taxCalculation.tdsAmount > 0 && (
                          <div className="text-sm text-red-600">
                            TDS ({selectedPO.taxCalculation.tdsRate}%): -₹{selectedPO.taxCalculation.tdsAmount.toFixed(2)}
                          </div>
                        )}
                      </>
                    )}
                    <div className="text-lg font-bold">
                      Total Amount: ₹{selectedPO.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms and Delivery Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedPO.paymentTerms && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Payment Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Payment Method:</strong> {selectedPO.paymentTerms.paymentMethod?.toUpperCase()}</div>
                    <div><strong>Credit Days:</strong> {selectedPO.paymentTerms.creditDays} days</div>
                    {selectedPO.paymentTerms.advancePercentage > 0 && (
                      <div><strong>Advance:</strong> {selectedPO.paymentTerms.advancePercentage}%</div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {selectedPO.deliveryDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Delivery Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Address:</strong> {selectedPO.deliveryDetails.deliveryAddress}</div>
                    <div><strong>Contact Person:</strong> {selectedPO.deliveryDetails.contactPerson}</div>
                    <div><strong>Contact Phone:</strong> {selectedPO.deliveryDetails.contactPhone}</div>
                    <div><strong>Partial Delivery:</strong> {selectedPO.deliveryDetails.partialDeliveryAllowed ? 'Allowed' : 'Not Allowed'}</div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Terms and Notes */}
            {(selectedPO.terms || selectedPO.notes) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPO.terms && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Terms & Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedPO.terms}</p>
                    </CardContent>
                  </Card>
                )}
                
                {selectedPO.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedPO.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onDownload(selectedPO)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {selectedPO?.status === "approved" && (
            <>
              <Button 
                variant="outline" 
                onClick={() => onCopyEmailTemplate(selectedPO)}
              >
                Copy Email Template
              </Button>
              <Button onClick={() => onSend(selectedPO)}>
                <Send className="h-4 w-4 mr-2" />
                Send to Supplier
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}