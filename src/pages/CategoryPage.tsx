import { useParams } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductGrid } from "@/components/ProductGrid";
import { SeoHead } from "@/components/SeoHead";
import { categories, getProductsByCategory } from "@/data/products";
import { buildBreadcrumbSchema, buildCategorySeoDescription, buildLocalBusinessSchema } from "@/lib/site-config";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const products = slug ? getProductsByCategory(slug) : [];
  const category = categories.find((item) => item.slug === slug);
  const categoryName = category?.name || "Pods";
  const pageTitle = `${categoryName} Recife | ${categoryName} em Recife e Olinda`;
  const pageDescription = buildCategorySeoDescription(categoryName, products.length);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        path={slug ? `/categoria/${slug}` : "/"}
        keywords={[`${categoryName.toLowerCase()} recife`, `${categoryName.toLowerCase()} olinda`]}
        schema={[
          buildLocalBusinessSchema(),
          buildBreadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: categoryName, path: slug ? `/categoria/${slug}` : "/" },
          ]),
        ]}
      />

      <Header />
      <main className="container mx-auto max-w-6xl flex-1 space-y-4 py-4 md:space-y-6 md:py-6">
        <section className="space-y-2 px-4 md:px-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">Categoria</p>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            {categoryName} em Recife e Olinda
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">{pageDescription}</p>
        </section>

        <CategoryNav />

        <ProductGrid
          products={products}
          title={`Modelos ${categoryName} disponiveis`}
          subtitle={`${products.length} modelo${products.length !== 1 ? "s" : ""} com sabores e entrega em Recife, Olinda e regiao metropolitana.`}
        />
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
