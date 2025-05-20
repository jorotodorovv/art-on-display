
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import { LanguageProvider } from "./components/LanguageToggle";
import { AuthProvider } from "./contexts/AuthContext";
import { ArtworkProvider } from "./contexts/ArtworkContext";
import { CartProvider } from "./contexts/CartContext";
import "@/integrations/supabase/storage"; // Import storage setup

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ArtworkProvider>
        <LanguageProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Index />} />
                    <Route path="about" element={<About />} />
                    <Route path="gallery" element={<Gallery />} />
                    <Route path="login" element={<Login />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="payment-success" element={<PaymentSuccess />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </LanguageProvider>
      </ArtworkProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
