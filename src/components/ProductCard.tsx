import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ShoppingBag } from "lucide-react";
import { Product, formatPrice, formatPuffs } from "@/data/products";
import { ProductPurchaseDialog } from "@/components/ProductPurchaseDialog";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const unitPrice = product.promoPrice ?? product.price;

  return (
    <>
      <article className="glass overflow-hidden rounded-3xl">
        <Link to={`/produto/${product.slug}`} className="block">
          <div className="catalog-surface aspect-[4/3] border-b border-border/60 p-4 md:p-5">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.14)] [filter:saturate(0.68)_contrast(1.04)]"
              loading="lazy"
            />
          </div>
        </Link>

        <div className="space-y-4 p-4 md:p-5">
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary">{product.brand}</p>
            <Link to={`/produto/${product.slug}`}>
              <h3 className="font-display text-2xl font-bold leading-none text-foreground transition hover:text-primary md:text-[2rem]">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">{formatPuffs(product.puffs)}</p>
          </div>

          <div className="text-2xl font-bold text-foreground md:text-3xl">{formatPrice(unitPrice)}</div>

          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Sabores</p>
            <div className="flex flex-wrap gap-1.5">
              {product.variations.map((variation) => (
                <span
                  key={variation.id}
                  className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs text-foreground"
                >
                  {variation.name}
                </span>
              ))}
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Garantia 48h
          </div>

          <Button
            type="button"
            className="h-11 w-full rounded-2xl text-sm"
            onClick={() => setIsDialogOpen(true)}
          >
            <ShoppingBag className="h-4 w-4" />
            Finalizar pedido
          </Button>
        </div>
      </article>

      <ProductPurchaseDialog
        product={product}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialQuantity={1}
      />
    </>
  );
}
