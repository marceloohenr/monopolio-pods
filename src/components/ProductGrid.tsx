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
      <div className="px-4 py-12 text-center md:px-0">
        <p className="text-muted-foreground">Sem produtos.</p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {title && (
        <div className="px-4 md:px-0">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground md:text-sm">{subtitle}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 px-4 md:grid-cols-2 md:gap-4 md:px-0 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
