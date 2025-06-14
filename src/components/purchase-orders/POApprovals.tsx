import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, XCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface POApprovalsProps {
  purchaseOrders: any[];
  onView: (po: any) => void;
  onApprove: (po: any) => void;
  onReject: (po: any) => void;
}

export default function POApprovals({ purchaseOrders, onView, onApprove, onReject }: POApprovalsProps) {
  const pendingPOs = purchaseOrders.filter(po => po.status === "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <p className="text-sm text-muted-foreground">Purchase orders requiring your approval</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingPOs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending approvals</p>
          ) : (
            pendingPOs.map((po) => (
              <div key={po.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-medium">{po.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {po.supplier.name} • ₹{po.totalAmount.toLocaleString()} • {po.items.length} items
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requested by {po.requestedBy} on {format(po.date, "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onView(po)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onReject(po)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => onApprove(po)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}