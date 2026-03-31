import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCheckout } from "@/context/checkout-context";
import { formatPrice, formatPuffs, products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function ProductSelect({
  productId,
  value,
  onChange,
}: {
  productId: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const product = products.find((entry) => entry.id === productId);

  if (!product || product.variations.length === 0) return null;

  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
    >
      {product.variations.map((variation) => (
        <option key={variation.id} value={variation.name}>
          {variation.name}
        </option>
      ))}
    </select>
  );
}

export function CheckoutSheet() {
  const {
    isOpen,
    closeCheckout,
    items,
    customer,
    itemCount,
    subtotal,
    canSubmit,
    updateItemFlavor,
    updateItemQuantity,
    removeItem,
    clearCart,
    setCustomerField,
    submitCheckout,
  } = useCheckout();

  const detailedItems = items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) return null;

      return {
        item,
        product,
        unitPrice: product.promoPrice ?? product.price,
      };
    })
    .filter(Boolean);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? null : closeCheckout())}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl uppercase tracking-[0.04em]">Checkout</SheetTitle>
          <SheetDescription>
            Revise os itens, informe seus dados e gere a mensagem pronta para o WhatsApp.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">Itens</h2>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Limpar
                </button>
              )}
            </div>

            {detailedItems.length > 0 ? (
              <div className="space-y-3">
                {detailedItems.map(({ item, product, unitPrice }) => (
                  <div key={item.id} className="glass rounded-2xl p-3">
                    <div className="flex gap-3">
                      <div className="h-20 w-20 shrink-0 rounded-xl bg-card p-2">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-contain [filter:grayscale(1)_contrast(1.05)]"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">{product.brand}</p>
                            <h3 className="text-sm font-semibold text-foreground">{product.name}</h3>
                            <p className="text-xs text-muted-foreground">{formatPuffs(product.puffs)}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="rounded-full p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                            aria-label={`Remover ${product.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-2">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Sabor</p>
                          <ProductSelect
                            productId={product.id}
                            value={item.flavor}
                            onChange={(flavor) => updateItemFlavor(item.id, flavor)}
                          />
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="glass flex items-center rounded-full px-1">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 text-muted-foreground transition hover:text-foreground"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-foreground">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 text-muted-foreground transition hover:text-foreground"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{formatPrice(unitPrice)} un.</p>
                            <p className="text-sm font-semibold text-foreground">{formatPrice(unitPrice * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass rounded-2xl p-5 text-center">
                <ShoppingBag className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-foreground">Seu checkout está vazio.</p>
                <p className="mt-1 text-xs text-muted-foreground">Adicione um pod para continuar.</p>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Cliente</h2>
            <div className="grid gap-3">
              <Input
                value={customer.name}
                onChange={(event) => setCustomerField("name", event.target.value)}
                placeholder="Nome"
              />
              <Input
                value={customer.phone}
                onChange={(event) => setCustomerField("phone", event.target.value)}
                placeholder="Telefone"
              />
            </div>
          </section>

          <section className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Itens</span>
              <span className="font-semibold text-foreground">{itemCount}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Frete e disponibilidade são confirmados no WhatsApp.</p>
          </section>
        </div>

        <SheetFooter className="mt-6 gap-2">
          <Button type="button" variant="outline" onClick={closeCheckout}>
            Fechar
          </Button>
          <Button type="button" variant="whatsapp" disabled={!canSubmit} onClick={submitCheckout}>
            Enviar pedido
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
