import { useState } from "react";
import {
  Users,
  Package,
  Factory,
  FileText,
  BarChart3,
  ShoppingCart,
  Calculator,
  ChevronRight,
  LayoutDashboard,
  Crown,
  Warehouse,
  FileSpreadsheet,
  ClipboardList,
  TrendingUp,
  Truck,
  PieChart,
  PackageCheck,
  ArrowDownToLine,
  Hammer,
  PackageSearch,
  Receipt,
  ShoppingBag,
  BarChart,
  BoxIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavSubItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  icon: React.ElementType;
  items: NavSubItem[];
}

const masterSections: NavSection[] = [
  {
    title: "My MASTER",
    icon: Crown,
    items: [
      { name: "Supplier", href: "/suppliers", icon: Users },
      { name: "Client", href: "/clients", icon: ShoppingBag },
      { name: "Raw Material", href: "/raw-materials", icon: Package },
      { name: "Godown / Job Worker", href: "/godown-job-worker", icon: Warehouse },
    ],
  },
  {
    title: "Box Master",
    icon: BoxIcon,
    items: [
      { name: "Costing", href: "/costing", icon: Calculator },
      { name: "Quotation", href: "/quotation", icon: FileSpreadsheet },
    ],
  },
  {
    title: "Purchase",
    icon: ShoppingCart,
    items: [
      { name: "Generate Purchase Order", href: "/purchase-orders", icon: ClipboardList },
      { name: "Purchase Inward Entry", href: "/purchase-inward", icon: ArrowDownToLine },
    ],
  },
  {
    title: "Work In Progress",
    icon: Factory,
    items: [
      { name: "Generate Job Card for JW", href: "/job-cards", icon: FileText },
      { name: "JW Material Inward", href: "/jw-material-inward", icon: PackageCheck },
      { name: "JW Material Consumption", href: "/jw-material-consumption", icon: PackageSearch },
      { name: "Job Card Analysis", href: "/job-card-analysis", icon: BarChart },
      { name: "RM Stock Consumption", href: "/rm-stock-consumption", icon: Hammer },
    ],
  },
  {
    title: "Sales",
    icon: TrendingUp,
    items: [
      { name: "Sales Order Acceptance", href: "/sales-orders", icon: Receipt },
      { name: "Delivery", href: "/delivery", icon: Truck },
    ],
  },
  {
    title: "Reports",
    icon: PieChart,
    items: [
      { name: "Purchase Report", href: "/reports/purchase", icon: BarChart3 },
      { name: "Consumption Report", href: "/reports/consumption", icon: BarChart3 },
      { name: "Stock in Hand Report", href: "/reports/stock", icon: BarChart3 },
      { name: "Sales Report", href: "/reports/sales", icon: BarChart3 },
      { name: "Pending Order Report", href: "/reports/pending", icon: BarChart3 },
    ],
  },
];

function NavSectionCollapsible({ section }: { section: NavSection }) {
  const location = useLocation();
  const isAnyChildActive = section.items.some(
    (item) =>
      location.pathname === item.href ||
      (item.href !== "/" && location.pathname.startsWith(item.href))
  );
  const [isOpen, setIsOpen] = useState(isAnyChildActive);

  const SectionIcon = section.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/sub">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className="font-medium text-sidebar-foreground/80 hover:text-sidebar-foreground"
            data-active={isAnyChildActive}
          >
            <SectionIcon className="h-4 w-4" />
            <span>{section.title}</span>
            <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/sub:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {section.items.map((item) => {
              const ItemIcon = item.icon;
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/" && location.pathname.startsWith(item.href));
              return (
                <SidebarMenuSubItem key={item.href}>
                  <SidebarMenuSubButton asChild isActive={isActive} size="sm">
                    <Link to={item.href}>
                      <ItemIcon className="h-3.5 w-3.5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const [masterOpen, setMasterOpen] = useState(true);

  const isDashboardActive = location.pathname === "/";
  const isBoxMasterActive =
    location.pathname === "/boxes" || location.pathname.startsWith("/boxes/");

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-foreground tracking-tight">
              BoxMaster Pro
            </span>
            <span className="text-[10px] text-muted-foreground leading-none">
              Plant Control System
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Dashboard — standalone */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isDashboardActive}>
                  <Link to="/">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Box Master — standalone link to box designs list */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isBoxMasterActive}>
                  <Link to="/boxes">
                    <BoxIcon className="h-4 w-4" />
                    <span>Box Designs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* MASTER — collapsible group */}
        <SidebarGroup>
          <Collapsible open={masterOpen} onOpenChange={setMasterOpen} className="group/master">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center cursor-pointer">
                <span className="text-xs font-semibold uppercase tracking-wider">MASTER</span>
                <ChevronRight className="ml-auto h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/master:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {masterSections.map((section) => (
                    <NavSectionCollapsible key={section.title} section={section} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-4 py-2 text-[10px] text-muted-foreground/60">
          © 2024 BoxMaster Pro — v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}