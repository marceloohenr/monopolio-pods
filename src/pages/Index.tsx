import { Header } from "@/components/Header";
import { BannerCarousel } from "@/components/BannerCarousel";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductGrid } from "@/components/ProductGrid";
import { getFeaturedProducts, getProductsByTag } from "@/data/products";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/data/products";

const Index = () => {
  const featured = getFeaturedProducts();
  const promos = getProductsByTag("promo");
  const newProducts = getProductsByTag("new");
  const bestsellers = getProductsByTag("bestseller");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-6xl mx-auto space-y-8 py-6">
        <BannerCarousel />
        <CategoryNav />
        
        {bestsellers.length > 0 && (
          <ProductGrid products={bestsellers} title="🔥 Mais Procurados" subtitle="Os favoritos dos nossos clientes" />
        )}

        {promos.length > 0 && (
          <ProductGrid products={promos} title="💰 Ofertas" subtitle="Preços imperdíveis por tempo limitado" />
        )}

        {newProducts.length > 0 && (
          <ProductGrid products={newProducts} title="✨ Lançamentos" subtitle="Acabou de chegar" />
        )}

        {featured.length > 0 && (
          <ProductGrid products={featured} title="⭐ Destaques" subtitle="Seleção especial para você" />
        )}
      </main>

      {/* WhatsApp FAB */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-whatsapp text-whatsapp-foreground p-4 rounded-full shadow-lg animate-pulse-glow hover:scale-110 transition-transform"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
};

export default Index;
