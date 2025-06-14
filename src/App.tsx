import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Suppliers from "./pages/Suppliers";
import Clients from "./pages/Clients";
import BoxMaster from "./pages/BoxMaster";
import Costing from "./pages/Costing";
import RawMaterials from "./pages/RawMaterials";
import PurchaseOrders from "./pages/PurchaseOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/:supplierId" element={<Suppliers />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:clientId" element={<Clients />} />
            <Route path="/boxes" element={<BoxMaster />} />
            <Route path="/boxes/:boxId" element={<BoxMaster />} />
            <Route path="/costing" element={<Costing />} />
            <Route path="/costing/:costingId" element={<Costing />} />
            <Route path="/raw-materials" element={<RawMaterials />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
