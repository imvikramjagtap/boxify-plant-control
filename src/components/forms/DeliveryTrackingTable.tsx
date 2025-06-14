import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Package, CheckCircle, XCircle } from "lucide-react";
import { POItem, PurchaseOrder } from "@/store/types";

interface DeliveryTrackingTableProps {
  purchaseOrder: PurchaseOrder;
  onDeliveryUpdate: (
    itemId: string,
    deliveredQuantity: number,
    qualityAccepted: boolean,
    grnNumber?: string,
    inspectionNotes?: string
  ) => void;
}

interface DeliveryData {
  deliveredQuantity: number;
  qualityAccepted: boolean;
  grnNumber: string;
  inspectionNotes: string;
}

export default function DeliveryTrackingTable({ 
  purchaseOrder, 
  onDeliveryUpdate 
}: DeliveryTrackingTableProps) {
  const [selectedItem, setSelectedItem] = useState<POItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deliveryData, setDeliveryData] = useState<DeliveryData>({
    deliveredQuantity: 0,
    qualityAccepted: true,
    grnNumber: "",
    inspectionNotes: ""
  });

  const handleDeliveryRecord = (item: POItem) => {
    setSelectedItem(item);
    const remainingQuantity = item.quantity - (item.deliveredQuantity || 0);
    setDeliveryData({
      deliveredQuantity: remainingQuantity,
      qualityAccepted: true,
      grnNumber: "",
      inspectionNotes: ""
    });
    setIsDialogOpen(true);
  };

  const handleSaveDelivery = () => {
    if (!selectedItem) return;

    onDeliveryUpdate(
      selectedItem.id,
      deliveryData.deliveredQuantity,
      deliveryData.qualityAccepted,
      deliveryData.grnNumber,
      deliveryData.inspectionNotes
    );

    setIsDialogOpen(false);
    setSelectedItem(null);
  };

  const getDeliveryStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "partial":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getRemainingQuantity = (item: POItem) => {
    return item.quantity - (item.deliveredQuantity || 0);
  };

  const getDeliveryProgress = (item: POItem) => {
    const delivered = item.deliveredQuantity || 0;
    return Math.round((delivered / item.quantity) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Package className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Delivery Tracking</h3>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Ordered Qty</TableHead>
              <TableHead>Delivered Qty</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead>GRN</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseOrder.items.map((item) => {
              const remainingQty = getRemainingQuantity(item);
              const progress = getDeliveryProgress(item);
              
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.materialName}</p>
                      <p className="text-sm text-muted-foreground">{item.unit}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.deliveredQuantity || 0}</TableCell>
                  <TableCell>{remainingQty}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDeliveryStatusColor(item.deliveryStatus)}>
                      {item.deliveryStatus || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.qualityAccepted !== undefined && (
                      <div className="flex items-center space-x-1">
                        {item.qualityAccepted ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {item.qualityAccepted ? "Accepted" : "Rejected"}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.grnNumber && (
                      <span className="text-sm font-mono">{item.grnNumber}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {remainingQty > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeliveryRecord(item)}
                      >
                        Record Delivery
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delivery Recording Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Delivery - {selectedItem?.materialName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ordered Quantity</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedItem?.quantity} {selectedItem?.unit}
                </p>
              </div>
              <div>
                <Label>Already Delivered</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedItem?.deliveredQuantity || 0} {selectedItem?.unit}
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="deliveredQuantity">
                Delivered Quantity ({selectedItem?.unit}) *
              </Label>
              <Input
                id="deliveredQuantity"
                type="number"
                min="1"
                max={getRemainingQuantity(selectedItem!)}
                value={deliveryData.deliveredQuantity}
                onChange={(e) => setDeliveryData({
                  ...deliveryData,
                  deliveredQuantity: parseInt(e.target.value) || 0
                })}
                placeholder="Enter delivered quantity"
              />
            </div>

            <div>
              <Label htmlFor="grnNumber">GRN Number</Label>
              <Input
                id="grnNumber"
                value={deliveryData.grnNumber}
                onChange={(e) => setDeliveryData({
                  ...deliveryData,
                  grnNumber: e.target.value
                })}
                placeholder="Enter GRN number"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="qualityAccepted"
                checked={deliveryData.qualityAccepted}
                onCheckedChange={(checked) => setDeliveryData({
                  ...deliveryData,
                  qualityAccepted: checked as boolean
                })}
              />
              <Label htmlFor="qualityAccepted">Quality Accepted</Label>
            </div>

            <div>
              <Label htmlFor="inspectionNotes">Inspection Notes</Label>
              <Textarea
                id="inspectionNotes"
                value={deliveryData.inspectionNotes}
                onChange={(e) => setDeliveryData({
                  ...deliveryData,
                  inspectionNotes: e.target.value
                })}
                placeholder="Enter inspection notes (optional)"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDelivery}
              disabled={deliveryData.deliveredQuantity <= 0}
            >
              Save Delivery
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}