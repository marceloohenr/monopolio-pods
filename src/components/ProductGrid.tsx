import { Product } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export function ProductGrid({ products, title, subtitle }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {title && (
        <div className="px-4 md:px-0">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 px-4 md:px-0">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
