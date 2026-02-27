import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import {
  BarChart3,
  ShoppingCart,
  PackageSearch,
  Package,
  TrendingUp,
  Clock,
} from "lucide-react";

const reportTypes: Record<string, { title: string; description: string; icon: React.ElementType }> = {
  purchase: {
    title: "Purchase Report",
    description: "Analyze purchase orders, supplier performance, and procurement trends. Track spending by material, supplier, and time period.",
    icon: ShoppingCart,
  },
  consumption: {
    title: "Consumption Report",
    description: "Review raw material consumption across production, job workers, and wastage. Compare actual vs planned usage.",
    icon: PackageSearch,
  },
  stock: {
    title: "Stock in Hand Report",
    description: "Current inventory status for all raw materials and finished goods. View stock levels, valuation, and reorder points.",
    icon: Package,
  },
  sales: {
    title: "Sales Report",
    description: "Track sales performance by client, product, and time period. Monitor revenue, margins, and growth trends.",
    icon: TrendingUp,
  },
  pending: {
    title: "Pending Order Report",
    description: "View all pending orders across clients. Track delivery timelines, production status, and overdue items.",
    icon: Clock,
  },
};

export default function Reports() {
  const location = useLocation();
  const reportType = location.pathname.split("/").pop() || "";
  const report = reportTypes[reportType];

  // If a specific report type is matched
  if (report) {
    const Icon = report.icon;
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{report.title}</h1>
            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
              Coming Soon
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{report.description}</p>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Icon className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">Report Under Development</h3>
            <p className="text-sm text-muted-foreground/70 max-w-md mt-2">
              This report module is being built. It will include filters, date ranges,
              export to PDF/Excel, and interactive charts.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default reports overview
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Access all business reports and analytics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(reportTypes).map(([key, report]) => {
          const Icon = report.icon;
          return (
            <Card key={key} className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{report.description}</p>
                <Badge variant="outline" className="mt-3 text-xs bg-amber-50 text-amber-700 border-amber-200">
                  Coming Soon
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
