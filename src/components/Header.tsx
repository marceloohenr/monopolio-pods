import { Link } from "react-router-dom";
import { MessageCircle, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/context/checkout-context";
import { AGE_NOTICE, STORE_TAGLINE, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/data/products";
import monopolioLogo from "@/assets/monopolio-logo.jpg";

export function Header() {
  const { itemCount, openCheckout } = useCheckout();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="relative overflow-hidden border-b border-primary/20 bg-primary text-primary-foreground shadow-[0_10px_28px_hsl(var(--primary)/0.18)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(255,255,255,0.16),transparent_28%),linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)] dark:bg-[radial-gradient(circle_at_left,rgba(0,0,0,0.14),transparent_28%),linear-gradient(90deg,transparent,rgba(0,0,0,0.1),transparent)]" />

        <div className="container relative px-4">
          <div className="marquee-shell py-1.5 text-[10px] font-medium lg:hidden">
            <div className="marquee-track">
              <div className="marquee-segment">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-2.5 py-1 text-primary-foreground"
                >
                  <MessageCircle className="h-3 w-3" />
                  Pedidos no WhatsApp: {WHATSAPP_DISPLAY}
                </a>

                <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-2.5 py-1 text-primary-foreground">
                  <Truck className="h-3 w-3" />
                  ZN grátis | ZS R$ 5,00 | demais regiões: consultar
                </div>

                <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-2.5 py-1 text-primary-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  Garantia 48h | {AGE_NOTICE}
                </div>
              </div>

              <div className="marquee-segment" aria-hidden="true">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-2.5 py-1 text-primary-foreground"
                >
                  <MessageCircle className="h-3 w-3" />
                  Pedidos no WhatsApp: {WHATSAPP_DISPLAY}
                </a>

                <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-2.5 py-1 text-primary-foreground">
                  <Truck className="h-3 w-3" />
                  ZN grátis | ZS R$ 5,00 | demais regiões: consultar
                </div>

                <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-2.5 py-1 text-primary-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  Garantia 48h | {AGE_NOTICE}
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden min-h-10 flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-[11px] font-medium lg:flex xl:justify-between">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1 text-primary-foreground transition hover:bg-primary-foreground/16"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Pedidos no WhatsApp: {WHATSAPP_DISPLAY}
            </a>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1 text-primary-foreground">
              <Truck className="h-3.5 w-3.5" />
              ZN grátis | ZS R$ 5,00 | demais regiões: consultar
            </div>

            <div className="hidden items-center gap-1.5 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1 text-primary-foreground lg:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              Garantia 48h | {AGE_NOTICE}
            </div>
          </div>
        </div>
      </div>

      <div className="container flex min-h-16 items-center justify-between gap-2 px-4 py-2.5 sm:gap-3">
        <Link to="/" className="group flex min-w-0 flex-1 items-center gap-2">
          <div className="h-11 w-11 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition group-hover:scale-[1.03]">
            <img
              src={monopolioLogo}
              alt="Logo da Monopolio Pods para compra de pods em Recife"
              className="h-full w-full object-cover"
              decoding="async"
            />
          </div>
          <div className="min-w-0 leading-none">
            <span className="block truncate font-display text-sm font-bold text-foreground sm:text-base md:text-lg">
              Monopolio <span className="text-primary">Pods</span>
            </span>
            <span className="mt-1 hidden text-[10px] uppercase tracking-[0.22em] text-muted-foreground lg:block">
              {STORE_TAGLINE}
            </span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <SearchBar />
          <Button
            type="button"
            variant="outline"
            onClick={() => openCheckout()}
            className="relative h-10 rounded-full px-2.5 sm:px-3"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Pedido</span>
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
