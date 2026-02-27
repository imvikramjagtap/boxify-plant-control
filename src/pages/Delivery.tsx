import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, Clock, CheckCircle } from "lucide-react";

export default function Delivery() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground">Delivery</h1>
          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
            Coming Soon
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">
          Manage dispatch and delivery of finished goods to clients.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Ready to Dispatch", desc: "Packed and waiting", icon: Package, count: "—" },
          { title: "In Transit", desc: "Currently being delivered", icon: Truck, count: "—" },
          { title: "Pending", desc: "Scheduled deliveries", icon: Clock, count: "—" },
          { title: "Delivered", desc: "This month", icon: CheckCircle, count: "—" },
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
          <Truck className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">Module Under Development</h3>
          <p className="text-sm text-muted-foreground/70 max-w-md mt-1">
            Generate delivery challans, schedule dispatches, track in-transit goods,
            and confirm delivery with proof.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
