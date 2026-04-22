import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { HomeGalleryHero } from "@/components/HomeGalleryHero";
import { ProductGrid } from "@/components/ProductGrid";
import { SeoHead } from "@/components/SeoHead";
import { AGE_NOTICE, products } from "@/data/products";
import { buildCollectionSchema, buildLocalBusinessSchema, buildWebsiteSchema } from "@/lib/site-config";

const Index = () => {
  // Ordem comercial usada na vitrine principal.
  const brandOrder = ["Ignite", "Elfbar", "Oxbar"];
  const catalogProducts = [...products].sort(
    (a, b) => brandOrder.indexOf(a.brand) - brandOrder.indexOf(b.brand),
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SeoHead
        title="Monopolio Pods | Venda de pods"
        description="Catálogo de pods com modelos Ignite, Elfbar e Oxbar, sabores disponíveis, pedido pelo WhatsApp e garantia de 48 horas."
        path="/"
        keywords={["monopolio pods", "venda de pods", "catalogo de pods", "comprar pods", "pods ignite", "pods elfbar", "pods oxbar"]}
        schema={[
          buildWebsiteSchema(),
          buildLocalBusinessSchema(),
          buildCollectionSchema(
            "Catálogo de pods Monopolio Pods",
            catalogProducts.map((product) => `/produto/${product.slug}`),
          ),
        ]}
      />

      <Header />

      <main className="container mx-auto max-w-6xl flex-1 space-y-5 py-4 md:space-y-7 md:py-6">
        {/* Abertura da home com posicionamento do catálogo */}
        <section className="space-y-3 px-4 md:px-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">Monopolio Pods</p>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <h1 className="font-display text-3xl font-bold text-foreground md:text-5xl">
                Venda de pods
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Catálogo de pods com modelos Ignite, Elfbar e Oxbar, sabores disponíveis, pedido pelo WhatsApp e garantia de 48 horas.
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground md:text-sm">
              {catalogProducts.length} modelos prontos para pedido
            </p>
          </div>
        </section>

        <HomeGalleryHero />

        <CategoryNav />

        {/* Grade principal do catálogo */}
        <ProductGrid
          products={catalogProducts}
          title="Catálogo de pods"
          subtitle="Modelos Ignite, Elfbar e Oxbar com sabores disponíveis, pedido rápido no WhatsApp e garantia de 48 horas."
        />

        <section className="sr-only" aria-label="Informações sobre entrega de pods em Recife e Olinda">
          <h2>Entrega de pods em Recife e Olinda com pedido rápido</h2>
          <p>
            A Monopolio Pods trabalha com pods descartáveis das marcas Ignite, Elfbar e Oxbar para clientes de Recife, Olinda e região metropolitana. O catálogo inclui modelos com diferentes faixas de puffs, sabores variados e pedido direto pelo WhatsApp.
          </p>
          <p>
            Quem procura comprar pods em Recife encontra opções com entrega via Uber, frete regional conforme o bairro e garantia de 48 horas. A loja atende Zona Norte, Zona Sul, Olinda e outras áreas sob consulta.
          </p>
        </section>

        <p className="px-4 text-center text-[11px] uppercase tracking-[0.18em] text-primary md:px-0 md:text-xs">
          {AGE_NOTICE}
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
