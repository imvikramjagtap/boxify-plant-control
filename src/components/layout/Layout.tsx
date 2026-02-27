import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppBreadcrumb } from "./Breadcrumb";
import { Button } from "@/components/ui/button";
import { HelpCircle, Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <div className="border-b bg-background px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <AppBreadcrumb />
            </div>
            
            <div className="flex items-center gap-3">
              {/* <div className="hidden md:flex relative mr-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input 
                  placeholder="Universal Search..." 
                  className="w-48 pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all focus:w-64"
                />
              </div> */}

              {/* <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-blue-600 transition-colors">
                <Bell className="h-5 w-5" />
              </Button> */}

              <Link to="/help">
                <Button variant="ghost" className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all font-medium gap-2">
                  <HelpCircle className="h-5 w-5" />
                  <span className="hidden sm:inline">System Help</span>
                </Button>
              </Link>

              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer hover:scale-105 transition-transform">
                VJ
              </div>
            </div>
          </div>
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}