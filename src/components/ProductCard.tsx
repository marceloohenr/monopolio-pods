import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ShoppingBag } from "lucide-react";
import { Product, formatPrice, formatPuffs, hasAvailableVariations } from "@/data/products";
import { ProductImageStage } from "@/components/ProductImageStage";
import { ProductPurchaseDialog } from "@/components/ProductPurchaseDialog";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const unitPrice = product.promoPrice ?? product.price;
  const hasAvailableFlavors = hasAvailableVariations(product);

  const handleFlavorClick = (flavor: string) => {
    if (!hasAvailableFlavors) return;
    setSelectedFlavor(flavor);
    setIsDialogOpen(true);
  };

  const handleOpenPurchaseDialog = () => {
    if (!hasAvailableFlavors) return;
    setSelectedFlavor("");
    setIsDialogOpen(true);
  };

  return (
    <>
      <article className="glass overflow-hidden rounded-3xl">
        <Link to={`/produto/${product.slug}`} className="block">
          <div className="catalog-surface aspect-[5/4] border-b border-border/60 p-2.5 md:p-3">
            <ProductImageStage product={product} variant="card" />
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
                <button
                  key={variation.id}
                  type="button"
                  disabled={!variation.inStock}
                  onClick={() => handleFlavorClick(variation.name)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition ${
                    variation.inStock
                      ? "border-border/60 bg-background text-foreground hover:border-primary/40 hover:bg-secondary"
                      : "cursor-not-allowed border-border/40 bg-muted text-muted-foreground/50 line-through"
                  }`}
                >
                  {variation.name}
                </button>
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
            disabled={!hasAvailableFlavors}
            onClick={handleOpenPurchaseDialog}
          >
            {hasAvailableFlavors ? (
              <>
                <ShoppingBag className="h-4 w-4" />
                Finalizar pedido
              </>
            ) : (
              "Indisponível no momento"
            )}
          </Button>
        </div>
      </article>

      <ProductPurchaseDialog
        product={product}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialFlavor={selectedFlavor}
        initialQuantity={1}
      />
    </>
  );
}
