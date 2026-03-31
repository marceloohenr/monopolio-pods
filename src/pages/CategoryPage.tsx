import { useParams } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductGrid } from "@/components/ProductGrid";
import { categories, getProductsByCategory } from "@/data/products";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const products = slug ? getProductsByCategory(slug) : [];
  const category = categories.find((item) => item.slug === slug);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="container mx-auto max-w-6xl flex-1 space-y-4 py-4 md:space-y-6 md:py-6">
        <CategoryNav />
        <ProductGrid
          products={products}
          title={category?.name || "Categoria"}
          subtitle={
            category
              ? `${products.length} modelo${products.length !== 1 ? "s" : ""} com sabores disponíveis.`
              : `${products.length} item${products.length !== 1 ? "s" : ""}.`
          }
        />
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
