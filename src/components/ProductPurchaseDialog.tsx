import { useEffect, useRef, useState } from "react";
import { Minus, Plus, ShieldCheck, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCheckout } from "@/context/checkout-context";
import { Product, formatPrice, formatPuffs, hasAvailableVariations } from "@/data/products";
import { ProductImageStage } from "@/components/ProductImageStage";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductPurchaseDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFlavor?: string;
  initialQuantity?: number;
}

export function ProductPurchaseDialog({
  product,
  open,
  onOpenChange,
  initialFlavor,
  initialQuantity,
}: ProductPurchaseDialogProps) {
  const { openCheckout } = useCheckout();
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const pendingCheckoutRef = useRef<{ flavor: string; quantity: number } | null>(null);
  const unitPrice = product.promoPrice ?? product.price;
  const subtotal = unitPrice * quantity;
  const hasAvailableFlavors = hasAvailableVariations(product);

  useEffect(() => {
    if (!open) return;

    setSelectedFlavor(initialFlavor?.trim() || "");
    setQuantity(Math.max(1, initialQuantity ?? 1));
  }, [initialFlavor, initialQuantity, open, product]);

  useEffect(() => {
    if (open || !pendingCheckoutRef.current) return;

    const checkoutOptions = pendingCheckoutRef.current;
    pendingCheckoutRef.current = null;

    window.requestAnimationFrame(() => {
      openCheckout(product, checkoutOptions);
    });
  }, [open, openCheckout, product]);

  const handleConfirm = () => {
    if (!hasAvailableFlavors) {
      toast.error("Produto indisponivel no momento.");
      return;
    }

    if (!selectedFlavor) {
      toast.error("Escolha um sabor para continuar.");
      return;
    }

    pendingCheckoutRef.current = {
      flavor: selectedFlavor,
      quantity,
    };

    onOpenChange(false);
    toast.success("Produto adicionado. Checkout aberto.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md rounded-3xl border-border/70 p-0"
        onCloseAutoFocus={(event) => {
          if (pendingCheckoutRef.current) {
            event.preventDefault();
          }
        }}
      >
        <div className="catalog-surface rounded-t-3xl border-b border-border/60 p-5">
          <div className="flex items-start gap-4">
            <div className="h-24 w-24 shrink-0">
              <ProductImageStage product={product} variant="compact" />
            </div>

            <DialogHeader className="space-y-1 text-left">
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary">{product.brand}</p>
              <DialogTitle className="font-display text-3xl leading-none text-foreground">
                {product.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {formatPuffs(product.puffs)}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Preço unitário</span>
            <span className="text-2xl font-bold text-foreground">{formatPrice(unitPrice)}</span>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Escolha o sabor</p>
            <Select value={selectedFlavor} onValueChange={setSelectedFlavor} disabled={!hasAvailableFlavors}>
              <SelectTrigger className="h-11 rounded-2xl border-border/60 bg-background text-left">
                <SelectValue placeholder={hasAvailableFlavors ? "Escolha o sabor" : "Indisponivel no momento"} />
              </SelectTrigger>
              <SelectContent>
                {product.variations
                  .filter((variation) => variation.inStock)
                  .map((variation) => (
                    <SelectItem key={variation.id} value={variation.name}>
                      {variation.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {!hasAvailableFlavors && (
              <p className="text-xs text-muted-foreground">Esse produto esta sem sabores ativos no momento.</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">Quantidade</p>
            <div className="glass flex items-center rounded-full px-1">
              <button
                type="button"
                disabled={!hasAvailableFlavors}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 text-muted-foreground transition hover:text-foreground"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold text-foreground">{quantity}</span>
              <button
                type="button"
                disabled={!hasAvailableFlavors}
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 text-muted-foreground transition hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-lg font-semibold text-foreground">{formatPrice(subtotal)}</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Garantia 48h
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-border/60 p-5 pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!selectedFlavor || !hasAvailableFlavors}>
            {hasAvailableFlavors ? (
              <>
                <ShoppingBag className="h-4 w-4" />
                Adicionar ao carrinho
              </>
            ) : (
              "Indisponivel no momento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
