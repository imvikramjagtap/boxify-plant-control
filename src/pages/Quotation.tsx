import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Send, CheckCircle, Clock } from "lucide-react";

export default function Quotation() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground">Quotation</h1>
          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
            Coming Soon
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">
          Generate and manage client quotations based on box costing calculations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Draft Quotes", desc: "Quotations being prepared", icon: FileSpreadsheet, count: "—" },
          { title: "Sent", desc: "Quotations sent to clients", icon: Send, count: "—" },
          { title: "Approved", desc: "Client-approved quotes", icon: CheckCircle, count: "—" },
          { title: "Pending", desc: "Awaiting client response", icon: Clock, count: "—" },
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
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">Module Under Development</h3>
          <p className="text-sm text-muted-foreground/70 max-w-md mt-1">
            Create professional quotations linked to box costing, manage quote versions,
            and track client approvals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
