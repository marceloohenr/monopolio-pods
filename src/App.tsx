import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CheckoutSheet } from "@/components/CheckoutSheet";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "@/components/theme-provider";
import { CheckoutProvider } from "@/context/checkout-context";
import Index from "./pages/Index.tsx";
import AdminTestimonialsPage from "./pages/AdminTestimonialsPage.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <CheckoutProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/categoria/:slug" element={<CategoryPage />} />
              <Route path="/produto/:slug" element={<ProductPage />} />
              <Route path="/busca" element={<SearchPage />} />
              <Route path="/admin/depoimentos" element={<AdminTestimonialsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CheckoutSheet />
          </BrowserRouter>
        </TooltipProvider>
      </CheckoutProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
