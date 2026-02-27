import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownToLine, Package, ClipboardCheck, Truck } from "lucide-react";


export default function PurchaseInward() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground">Purchase Inward Entry</h1>
          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
            Coming Soon
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">
          Record incoming materials against purchase orders with quality inspection.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Pending Deliveries", desc: "Awaiting material arrival", icon: Truck, count: "—" },
          { title: "Received Today", desc: "Materials received today", icon: ArrowDownToLine, count: "—" },
          { title: "Quality Checks", desc: "Pending quality inspection", icon: ClipboardCheck, count: "—" },
          { title: "Stocked", desc: "Added to inventory", icon: Package, count: "—" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground">{stat.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ArrowDownToLine className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">Module Under Development</h3>
          <p className="text-sm text-muted-foreground/70 max-w-md mt-1">
            Record GRN (Goods Receipt Notes), verify material quality,
            update stock automatically, and reconcile against purchase orders.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
