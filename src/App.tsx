import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

// Existing pages
import Dashboard from "./pages/Dashboard";
import Suppliers from "./pages/Suppliers";
import Clients from "./pages/Clients";
import BoxMaster from "./pages/BoxMaster";
import Costing from "./pages/Costing";
import RawMaterials from "./pages/RawMaterials";
import PurchaseOrders from "./pages/PurchaseOrders";
import NotFound from "./pages/NotFound";

// New pages
import GodownJobWorker from "./pages/GodownJobWorker";
import Quotation from "./pages/Quotation";
import PurchaseInward from "./pages/PurchaseInward";
import JobCards from "./pages/JobCards";
import JWMaterialInward from "./pages/JWMaterialInward";
import JWMaterialConsumption from "./pages/JWMaterialConsumption";
import JobCardAnalysis from "./pages/JobCardAnalysis";
import RMStockConsumption from "./pages/RMStockConsumption";
import SalesOrders from "./pages/SalesOrders";
import Delivery from "./pages/Delivery";
import Reports from "./pages/Reports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* My MASTER */}
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/:supplierId" element={<Suppliers />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:clientId" element={<Clients />} />
            <Route path="/raw-materials" element={<RawMaterials />} />
            <Route path="/godown-job-worker" element={<GodownJobWorker />} />

            {/* Box Master */}
            <Route path="/boxes" element={<BoxMaster />} />
            <Route path="/boxes/:boxId" element={<BoxMaster />} />
            <Route path="/costing" element={<Costing />} />
            <Route path="/costing/:costingId" element={<Costing />} />
            <Route path="/quotation" element={<Quotation />} />

            {/* Purchase */}
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/purchase-inward" element={<PurchaseInward />} />

            {/* Work In Progress */}
            <Route path="/job-cards" element={<JobCards />} />
            <Route path="/jw-material-inward" element={<JWMaterialInward />} />
            <Route path="/jw-material-consumption" element={<JWMaterialConsumption />} />
            <Route path="/job-card-analysis" element={<JobCardAnalysis />} />
            <Route path="/rm-stock-consumption" element={<RMStockConsumption />} />

            {/* Sales */}
            <Route path="/sales-orders" element={<SalesOrders />} />
            <Route path="/delivery" element={<Delivery />} />

            {/* Reports */}
            <Route path="/reports/purchase" element={<Reports />} />
            <Route path="/reports/consumption" element={<Reports />} />
            <Route path="/reports/stock" element={<Reports />} />
            <Route path="/reports/sales" element={<Reports />} />
            <Route path="/reports/pending" element={<Reports />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
