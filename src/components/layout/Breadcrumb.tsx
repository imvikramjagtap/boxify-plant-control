import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

const routeNames: Record<string, string> = {
  "/": "Dashboard",
  "/suppliers": "Supplier",
  "/clients": "Client",
  "/raw-materials": "Raw Material",
  "/godown-job-worker": "Godown / Job Worker",
  "/boxes": "Box Designs",
  "/costing": "Costing",
  "/quotation": "Quotation",
  "/purchase-orders": "Generate Purchase Order",
  "/purchase-inward": "Purchase Inward Entry",
  "/job-cards": "Generate Job Card for JW",
  "/jw-material-inward": "JW Material Inward",
  "/jw-material-consumption": "JW Material Consumption",
  "/job-card-analysis": "Job Card Analysis",
  "/rm-stock-consumption": "RM Stock Consumption",
  "/sales-orders": "Sales Order Acceptance",
  "/delivery": "Delivery",
  "/reports": "Reports",
  "/reports/purchase": "Purchase Report",
  "/reports/consumption": "Consumption Report",
  "/reports/stock": "Stock in Hand Report",
  "/reports/sales": "Sales Report",
  "/reports/pending": "Pending Order Report",
};

export function AppBreadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // For root path
  if (location.pathname === "/") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {pathnames.map((pathname, index) => {
          const routePath = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const routeName = routeNames[routePath] || pathname.replace(/-/g, " ");

          return (
            <div key={routePath} className="flex items-center">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="capitalize">
                    {routeName}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={routePath} className="capitalize">
                      {routeName}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}