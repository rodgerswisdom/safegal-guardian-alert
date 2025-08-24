import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProviderWrapper } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import AuthSetup from "./pages/AuthSetup";
import Report from "./pages/Report";
import Officer from "./pages/Officer";
import Admin from "./pages/Admin";
import PublicData from "./pages/PublicData";
import Trust from "./pages/Trust";
import Learn from "./pages/Learn";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProviderWrapper>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/setup" element={<AuthSetup />} />
            <Route path="/report" element={<Report />} />
            <Route path="/public" element={<PublicData />} />
            <Route path="/trust" element={<Trust />} />
            <Route path="/learn" element={<Learn />} />
            
            {/* Protected Routes */}
            <Route 
              path="/officer" 
              element={
                <ProtectedRoute requiredRoles={['cpo', 'ngo', 'admin']}>
                  <Officer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProviderWrapper>
  </QueryClientProvider>
);

export default App;
