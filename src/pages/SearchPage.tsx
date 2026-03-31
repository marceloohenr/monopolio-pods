import { useSearchParams } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { searchProducts } from "@/data/products";

const SearchPage = () => {
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const results = searchProducts(query);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="container mx-auto max-w-6xl flex-1 space-y-4 py-4 md:space-y-6 md:py-6">
        <ProductGrid
          products={results}
          title={query ? `Busca: "${query}"` : "Catálogo"}
          subtitle={
            query
              ? `${results.length} modelo${results.length !== 1 ? "s" : ""} encontrado${results.length !== 1 ? "s" : ""}.`
              : "Todos os modelos e sabores."
          }
        />
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
