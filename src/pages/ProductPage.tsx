import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductImageStage } from "@/components/ProductImageStage";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductPurchaseDialog } from "@/components/ProductPurchaseDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCheckout } from "@/context/checkout-context";
import {
  AGE_NOTICE,
  WHATSAPP_DISPLAY,
  formatPrice,
  formatPuffs,
  getProductBySlug,
  hasAvailableVariations,
  products,
} from "@/data/products";

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openCheckout } = useCheckout();
  const product = slug ? getProductBySlug(slug) : undefined;
  const [selectedVariation, setSelectedVariation] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const defaultVariation = product?.variations.find((variation) => variation.inStock)?.name ?? "";

  useEffect(() => {
    setSelectedVariation(defaultVariation);
    setQuantity(1);
  }, [defaultVariation, product?.id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12 text-center">
          <p className="text-lg text-muted-foreground">Produto não encontrado.</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            Voltar ao inicio
          </Link>
        </div>
      </div>
    );
  }

  const related = products
    .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
    .slice(0, 3);
  const hasAvailableFlavors = hasAvailableVariations(product);
  const availableFlavorCount = product.variations.filter((variation) => variation.inStock).length;
  const unitPrice = product.promoPrice ?? product.price;
  const subtotal = unitPrice * quantity;
  const deliveryItems = [
    "Entrega realizada via Uber.",
    "Zona Norte e Olinda: sem custo em áreas elegíveis.",
    "Zona Sul do Recife: frete fixo de R$ 5,00.",
    "Outras regiões: valor informado conforme a corrida.",
  ];
  const warrantyItems = [
    "Garantia gratuita válida por 48 horas após a entrega.",
    "Se o produto apresentar problema, a troca do item é sem custo.",
    "A logística da troca fica por conta do cliente.",
  ];
  const noteItems = [
    "Não nos responsabilizamos por problemas ocorridos durante a corrida do Uber.",
    "Em caso de troca, é necessário solicitar um novo Uber.",
    `Contato da loja: ${WHATSAPP_DISPLAY}.`,
    AGE_NOTICE,
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container mx-auto max-w-6xl flex-1 space-y-6 py-4 md:space-y-8 md:py-6">
        <div className="px-4 md:px-0">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-primary md:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <div className="grid gap-4 px-4 md:grid-cols-[1fr_0.95fr] md:gap-8 md:px-0">
          <div className="catalog-surface overflow-hidden rounded-3xl border border-border/60 p-5 md:p-8">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary md:text-xs">{product.brand}</p>
                <h1 className="font-display text-3xl font-bold leading-none text-foreground md:text-5xl">
                  {product.name}
                </h1>
              </div>
              <Badge variant="outline" className="rounded-full border-border/60 bg-background/80 text-foreground">
                {formatPuffs(product.puffs)}
              </Badge>
            </div>

            <div className="aspect-square p-2 md:p-3">
              <ProductImageStage product={product} variant="detail" />
            </div>
          </div>

          <div className="space-y-4 md:space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full border-border/60 bg-background/60 text-foreground">
                {product.brand}
              </Badge>
              <Badge variant="outline" className="rounded-full border-border/60 bg-background/60 text-foreground">
                {formatPuffs(product.puffs)}
              </Badge>
              <Badge variant="outline" className="rounded-full border-border/60 bg-background/60 text-foreground">
                {hasAvailableFlavors ? `${availableFlavorCount} sabores` : "Sem sabores ativos"}
              </Badge>
            </div>

            <div>
              <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
              <p className="mt-3 text-3xl font-bold text-foreground md:text-4xl">{formatPrice(unitPrice)}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="glass rounded-2xl p-4">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="text-sm font-semibold text-foreground">Garantia</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{product.warrantyNote}</p>
              </div>

              <div className="glass rounded-2xl p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Truck className="h-4 w-4" />
                  <p className="text-sm font-semibold text-foreground">Entrega</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{product.shippingNote}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">Sabores</p>
                <span className="text-xs text-muted-foreground">
                  {selectedVariation || (hasAvailableFlavors ? "Escolha um sabor" : "Indisponivel no momento")}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.variations.map((variation) => (
                  <button
                    key={variation.id}
                    type="button"
                    disabled={!variation.inStock}
                    onClick={() => setSelectedVariation(variation.name)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      selectedVariation === variation.name
                        ? "border-primary bg-primary text-primary-foreground"
                        : variation.inStock
                          ? "border-border/60 bg-background text-foreground hover:bg-secondary"
                          : "cursor-not-allowed border-border/40 bg-muted text-muted-foreground/40 line-through"
                    }`}
                  >
                    {variation.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
                <span className="w-8 text-center text-sm font-semibold text-foreground">{quantity}</span>
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
              <p className="mt-2 text-xs text-muted-foreground">
                Nome, telefone, frete e disponibilidade são confirmados no checkout.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                size="lg"
                className="h-11 rounded-2xl"
                disabled={!hasAvailableFlavors}
                onClick={() => setIsPurchaseDialogOpen(true)}
              >
                {hasAvailableFlavors ? (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Finalizar pedido
                  </>
                ) : (
                  "Indisponivel no momento"
                )}
              </Button>

              <Button type="button" variant="outline" size="lg" className="h-11 rounded-2xl" onClick={() => openCheckout()}>
                Ver checkout
              </Button>
            </div>
          </div>
        </div>

        <section className="space-y-3 px-4 md:px-0">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">Informações</p>
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Entrega, garantia e observações
            </h2>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="glass rounded-3xl p-4 md:p-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                <Truck className="h-3.5 w-3.5" />
                Entrega
              </div>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {deliveryItems.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-3xl p-4 md:p-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Garantia
              </div>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {warrantyItems.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-3xl p-4 md:p-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                <AlertCircle className="h-3.5 w-3.5" />
                Observações
              </div>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {noteItems.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {related.length > 0 && <ProductGrid products={related} title="Mais modelos" subtitle="Outras opcoes da mesma faixa." />}
      </main>

      <ProductPurchaseDialog
        product={product}
        open={isPurchaseDialogOpen}
        onOpenChange={setIsPurchaseDialogOpen}
        initialFlavor={selectedVariation || defaultVariation}
        initialQuantity={quantity}
      />

      <Footer />
    </div>
  );
};

export default ProductPage;
