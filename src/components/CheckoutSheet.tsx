import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCheckout } from "@/context/checkout-context";
import { formatPrice, formatPuffs, products } from "@/data/products";
import { formatShippingFee, findShippingAreaByLocation } from "@/data/shipping";
import { ProductImageStage } from "@/components/ProductImageStage";
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
import { formatCep, hasValidCep, lookupCepAddress } from "@/lib/cep";
import { cn } from "@/lib/utils";

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function hasValidPhone(value: string) {
  const digits = normalizePhone(value);
  return digits.length === 10 || digits.length === 11;
}

function formatPhoneInput(value: string) {
  const digits = normalizePhone(value);

  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

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
    freight,
    finalTotal,
    canSubmit,
    updateItemFlavor,
    updateItemQuantity,
    removeItem,
    clearCart,
    setCustomerField,
    submitCheckout,
  } = useCheckout();
  const [touched, setTouched] = useState({
    cep: false,
    phone: false,
    street: false,
    city: false,
    neighborhood: false,
  });
  const [cepLookupStatus, setCepLookupStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [cepLookupMessage, setCepLookupMessage] = useState("");

  const paymentOptions = [
    { value: "pix", label: "Pix" },
    { value: "card", label: "Cartão" },
  ] as const;

  useEffect(() => {
    if (!isOpen) {
      setTouched({ cep: false, phone: false, street: false, city: false, neighborhood: false });
      setCepLookupStatus("idle");
      setCepLookupMessage("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!hasValidCep(customer.cep)) {
      if (!customer.cep) {
        setCepLookupStatus("idle");
        setCepLookupMessage("");
      } else {
        setCepLookupStatus("idle");
        setCepLookupMessage("Complete o CEP para buscar rua, cidade e bairro automaticamente.");
      }
      return;
    }

    const controller = new AbortController();

    setCepLookupStatus("loading");
    setCepLookupMessage("Consultando CEP...");

    lookupCepAddress(customer.cep, controller.signal)
      .then((address) => {
        const area = findShippingAreaByLocation({
          neighborhood: address.neighborhood,
          city: address.city,
        });

        setCustomerField("cep", address.cep);
        setCustomerField("street", address.street);
        setCustomerField("city", address.city);
        setCustomerField("neighborhood", address.neighborhood);
        setTouched((current) => ({ ...current, street: true, city: true, neighborhood: true }));
        setCepLookupStatus("success");

        const addressLabel = [address.street, address.neighborhood, address.city].filter(Boolean).join(", ");
        const locationFallback = [address.neighborhood, address.city].filter(Boolean).join(", ");

        setCepLookupMessage(
          addressLabel
            ? area.fee === null
              ? `CEP encontrado: ${addressLabel}. Frete dessa região precisa ser consultado.`
              : `CEP encontrado: ${addressLabel}. Frete aplicado conforme a região ${area.name}.`
            : area.fee === null
              ? `CEP encontrado: ${locationFallback || address.city}. Frete dessa região precisa ser consultado.`
              : `CEP encontrado: ${locationFallback || address.city}. Frete aplicado conforme a região ${area.name}.`,
        );
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return;

        setCepLookupStatus("error");
        setCepLookupMessage(error.message || "Não foi possível consultar o CEP.");
      });

    return () => controller.abort();
  }, [customer.cep, setCustomerField]);

  const cepInvalid = touched.cep && customer.cep.trim().length > 0 && !hasValidCep(customer.cep);
  const phoneInvalid = touched.phone && !hasValidPhone(customer.phone);
  const hasStreet = customer.street.trim().length > 0;
  const hasCity = customer.city.trim().length > 0;
  const hasNeighborhood = customer.neighborhood.trim().length > 0;
  const hasShippingLocation = hasCity && hasNeighborhood;
  const streetInvalid = touched.street && !hasStreet;
  const cityInvalid = touched.city && !hasCity;
  const neighborhoodInvalid = touched.neighborhood && !hasNeighborhood;
  const locationLabel = hasShippingLocation ? `${customer.neighborhood}, ${customer.city}` : "";

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
    .filter(
      (
        entry,
      ): entry is {
        item: (typeof items)[number];
        product: (typeof products)[number];
        unitPrice: number;
      } => Boolean(entry),
    );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? null : closeCheckout())}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl uppercase tracking-[0.04em]">Checkout</SheetTitle>
          <SheetDescription>
            Informe telefone, rua, cidade e bairro para calcular o frete automaticamente antes de enviar o pedido.
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
                      <div className="h-20 w-20 shrink-0">
                        <ProductImageStage product={product} variant="checkout" />
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

          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Cliente</h2>
              <p className="mt-1 text-xs text-muted-foreground">Telefone e endereço são usados para calcular o frete e enviar o pedido.</p>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <label htmlFor="checkout-name" className="text-xs font-medium text-muted-foreground">
                  Nome
                </label>
                <Input
                  id="checkout-name"
                  value={customer.name}
                  onChange={(event) => setCustomerField("name", event.target.value)}
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="checkout-phone" className="text-xs font-medium text-muted-foreground">
                  Telefone *
                </label>
                <Input
                  id="checkout-phone"
                  value={customer.phone}
                  onChange={(event) => setCustomerField("phone", formatPhoneInput(event.target.value))}
                  onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
                  placeholder="(81) 98765-4321"
                  className={cn(phoneInvalid && "border-destructive focus-visible:ring-destructive")}
                />
                {phoneInvalid && (
                  <p className="text-xs text-destructive">Informe um telefone válido com DDD.</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="checkout-cep" className="text-xs font-medium text-muted-foreground">
                  CEP
                </label>
                <Input
                  id="checkout-cep"
                  value={customer.cep}
                  onChange={(event) => setCustomerField("cep", formatCep(event.target.value))}
                  onBlur={() => setTouched((current) => ({ ...current, cep: true }))}
                  placeholder="00000-000"
                  className={cn(cepInvalid && "border-destructive focus-visible:ring-destructive")}
                />
                {cepInvalid && (
                  <p className="text-xs text-destructive">Digite um CEP válido com 8 números.</p>
                )}
                {!cepInvalid && cepLookupMessage && (
                  <p
                    className={cn(
                      "text-xs",
                      cepLookupStatus === "error"
                        ? "text-destructive"
                        : cepLookupStatus === "success"
                          ? "text-emerald-600"
                          : "text-muted-foreground",
                    )}
                  >
                    {cepLookupMessage}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="checkout-street" className="text-xs font-medium text-muted-foreground">
                  Rua *
                </label>
                <Input
                  id="checkout-street"
                  value={customer.street}
                  onChange={(event) => setCustomerField("street", event.target.value)}
                  onBlur={() => setTouched((current) => ({ ...current, street: true }))}
                  placeholder="Rua / logradouro do cliente"
                  className={cn(streetInvalid && "border-destructive focus-visible:ring-destructive")}
                />
                {streetInvalid && (
                  <p className="text-xs text-destructive">Informe a rua para enviar o pedido.</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="checkout-city" className="text-xs font-medium text-muted-foreground">
                  Cidade *
                </label>
                <Input
                  id="checkout-city"
                  value={customer.city}
                  onChange={(event) => setCustomerField("city", event.target.value)}
                  onBlur={() => setTouched((current) => ({ ...current, city: true }))}
                  placeholder="Cidade do cliente"
                  className={cn(cityInvalid && "border-destructive focus-visible:ring-destructive")}
                />
                {cityInvalid && (
                  <p className="text-xs text-destructive">Informe a cidade para calcular o frete.</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="checkout-neighborhood" className="text-xs font-medium text-muted-foreground">
                  Bairro *
                </label>
                <Input
                  id="checkout-neighborhood"
                  value={customer.neighborhood}
                  onChange={(event) => setCustomerField("neighborhood", event.target.value)}
                  onBlur={() => setTouched((current) => ({ ...current, neighborhood: true }))}
                  placeholder="Bairro do cliente"
                  className={cn(neighborhoodInvalid && "border-destructive focus-visible:ring-destructive")}
                />
                {neighborhoodInvalid && (
                  <p className="text-xs text-destructive">Informe o bairro para calcular o frete.</p>
                )}
                {hasShippingLocation && (
                  <p className="text-xs text-muted-foreground">
                    Frete para {locationLabel}: {formatShippingFee(freight)}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="checkout-address-details" className="text-xs font-medium text-muted-foreground">
                  Número / complemento
                </label>
                <Input
                  id="checkout-address-details"
                  value={customer.addressDetails}
                  onChange={(event) => setCustomerField("addressDetails", event.target.value)}
                  placeholder="Ex.: 123, apto 402, bloco B"
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Pagamento</h2>
            <select
              value={customer.paymentMethod}
              onChange={(event) => setCustomerField("paymentMethod", event.target.value)}
              className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm text-foreground"
            >
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Frete</span>
              <span className={cn("font-semibold", hasShippingLocation ? "text-foreground" : "text-muted-foreground")}>
                {hasShippingLocation ? formatShippingFee(freight) : "Informe a cidade e o bairro"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Total final</span>
              <span className={cn("font-semibold", hasShippingLocation ? "text-foreground" : "text-muted-foreground")}>
                {hasShippingLocation ? (finalTotal === null ? "Consultar valores" : formatPrice(finalTotal)) : "Informe a cidade e o bairro"}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              O pedido do WhatsApp vai incluir telefone, rua, cidade, bairro, frete e total ja calculados.
            </p>
          </section>
        </div>

        <SheetFooter className="mt-6 gap-2">
          <Button type="button" variant="outline" onClick={closeCheckout}>
            Fechar
          </Button>
          <Button
            type="button"
            variant="whatsapp"
            disabled={!canSubmit}
            onClick={() => {
              setTouched({ cep: true, phone: true, street: true, city: true, neighborhood: true });
              submitCheckout();
            }}
          >
            Enviar pedido
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

