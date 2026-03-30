import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductGrid } from "@/components/ProductGrid";
import { getProductsByCategory, categories } from "@/data/products";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const products = slug ? getProductsByCategory(slug) : [];
  const category = categories.find((c) => c.slug === slug);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-6xl mx-auto space-y-6 py-6">
        <CategoryNav />
        <ProductGrid
          products={products}
          title={category?.name || "Categoria"}
          subtitle={`${products.length} produto${products.length !== 1 ? "s" : ""}`}
        />
      </main>
    </div>
  );
};

export default CategoryPage;
