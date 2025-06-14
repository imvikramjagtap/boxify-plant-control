import { 
  Settings, 
  Users, 
  Package, 
  Factory, 
  FileText, 
  BarChart3,
  ShoppingCart,
  Calculator
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
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Suppliers", href: "/suppliers", icon: Users },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Box Master", href: "/boxes", icon: Package },
  { name: "Costing", href: "/costing", icon: Calculator },
  { name: "Job Cards", href: "/job-cards", icon: FileText },
  { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart },
  { name: "Production", href: "/production", icon: Factory },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Package className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">
            BoxMaster Pro
          </span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || 
                  (item.href !== "/" && location.pathname.startsWith(item.href));
                
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          © 2024 BoxMaster Pro
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}