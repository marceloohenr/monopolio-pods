import { useSearchParams } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { SeoHead } from "@/components/SeoHead";
import { searchProducts } from "@/data/products";
import { buildSearchSeoDescription } from "@/lib/site-config";

const SearchPage = () => {
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const results = searchProducts(query);
  const pageTitle = query ? `Busca por ${query} no catálogo de pods` : "Buscar pods em Recife";
  const pageDescription = buildSearchSeoDescription(query, results.length);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        path={query ? `/busca?q=${encodeURIComponent(query)}` : "/busca"}
        noindex
      />

      <Header />
      <main className="container mx-auto max-w-6xl flex-1 space-y-4 py-4 md:space-y-6 md:py-6">
        <section className="space-y-2 px-4 md:px-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">Busca</p>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            {query ? `Resultados para ${query}` : "Buscar pods em Recife"}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">{pageDescription}</p>
        </section>

        <ProductGrid
          products={results}
          title={query ? `Busca por ${query}` : "Catálogo completo"}
          subtitle={
            query
              ? `${results.length} resultado${results.length !== 1 ? "s" : ""} no catálogo de pods para Recife e Olinda.`
              : "Todos os modelos Ignite, Elfbar e Oxbar disponíveis para pedido."
          }
        />
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
