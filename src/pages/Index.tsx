import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { HomeGalleryHero } from "@/components/HomeGalleryHero";
import { ProductGrid } from "@/components/ProductGrid";
import { AGE_NOTICE, products } from "@/data/products";

const Index = () => {
  const catalogProducts = products;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container mx-auto max-w-6xl flex-1 space-y-5 py-4 md:space-y-7 md:py-6">
        <section className="space-y-2 px-4 md:px-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">Catálogo</p>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Pods disponíveis</h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Escolha o modelo, confira os sabores e monte seu pedido.
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground md:text-sm">
              {catalogProducts.length} modelos
            </p>
          </div>
        </section>

        <HomeGalleryHero />

        <CategoryNav />

        <ProductGrid
          products={catalogProducts}
          title="Catálogo completo"
          subtitle="Todos os modelos com sabores disponíveis."
        />

        <p className="px-4 text-center text-[11px] uppercase tracking-[0.18em] text-primary md:px-0 md:text-xs">
          {AGE_NOTICE}
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
