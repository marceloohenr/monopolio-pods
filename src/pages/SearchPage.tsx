import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { searchProducts } from "@/data/products";

const SearchPage = () => {
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const results = searchProducts(query);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-6xl mx-auto space-y-6 py-6">
        <ProductGrid
          products={results}
          title={`Resultados para "${query}"`}
          subtitle={`${results.length} produto${results.length !== 1 ? "s" : ""} encontrado${results.length !== 1 ? "s" : ""}`}
        />
      </main>
    </div>
  );
};

export default SearchPage;
