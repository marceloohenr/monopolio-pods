import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { HomeGalleryHero } from "@/components/HomeGalleryHero";
import { ProductGrid } from "@/components/ProductGrid";
import { SeoHead } from "@/components/SeoHead";
import { AGE_NOTICE, products } from "@/data/products";
import { buildCollectionSchema, buildLocalBusinessSchema, buildWebsiteSchema } from "@/lib/site-config";

const Index = () => {
  const catalogProducts = products;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SeoHead
        title="Pods Recife | Comprar pods em Recife e Olinda"
        description="Peça pods em Recife e Olinda pelo WhatsApp com entrega via Uber, frete regional e garantia de 48 horas. Modelos Ignite, Elfbar e Oxbar prontos para compra."
        path="/"
        keywords={["pods recife", "comprar pods recife", "pods olinda", "pods entrega recife"]}
        schema={[
          buildWebsiteSchema(),
          buildLocalBusinessSchema(),
          buildCollectionSchema(
            "Catálogo de pods em Recife e Olinda",
            catalogProducts.map((product) => `/produto/${product.slug}`),
          ),
        ]}
      />

      <Header />

      <main className="container mx-auto max-w-6xl flex-1 space-y-5 py-4 md:space-y-7 md:py-6">
        <section className="space-y-3 px-4 md:px-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">Catálogo local</p>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <h1 className="font-display text-3xl font-bold text-foreground md:text-5xl">
                Comprar pods em Recife e Olinda
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Peça pelo WhatsApp e receba em Recife ou Olinda com entrega via Uber, frete regional e garantia de 48 horas. Modelos Ignite, Elfbar e Oxbar prontos para compra.
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground md:text-sm">
              {catalogProducts.length} modelos prontos para pedido
            </p>
          </div>
        </section>

        <HomeGalleryHero />

        <CategoryNav />

        <ProductGrid
          products={catalogProducts}
          title="Catálogo de pods em Recife"
          subtitle="Modelos Ignite, Elfbar e Oxbar com sabores disponíveis, pedido rápido no WhatsApp, entrega em Recife e Olinda e garantia local."
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
