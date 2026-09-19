import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CheckoutSheet } from "@/components/CheckoutSheet";
import { SeoRuntime } from "@/components/SeoRuntime";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "@/components/theme-provider";
import { CheckoutProvider } from "@/context/checkout-context";
import { CatalogProvider } from "@/context/catalog-context";
import Index from "./pages/Index.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <CatalogProvider>
        <CheckoutProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SeoRuntime />
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/categoria/:slug" element={<CategoryPage />} />
              <Route path="/produto/:slug" element={<ProductPage />} />
              <Route path="/busca" element={<SearchPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CheckoutSheet />
          </BrowserRouter>
        </TooltipProvider>
        </CheckoutProvider>
      </CatalogProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
