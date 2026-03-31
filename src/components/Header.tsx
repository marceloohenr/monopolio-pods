import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/context/checkout-context";
import { STORE_TAGLINE } from "@/data/products";
import monopolioLogo from "@/assets/monopolio-logo.jpg";

export function Header() {
  const { itemCount, openCheckout } = useCheckout();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="container flex min-h-16 items-center justify-between gap-3 px-4 py-2.5">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-11 w-11 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition group-hover:scale-[1.03]">
            <img src={monopolioLogo} alt="Logo Monopólio Pods" className="h-full w-full object-cover" />
          </div>
          <div className="leading-none">
            <span className="block font-display text-base font-bold text-foreground md:text-lg">
              Monopólio <span className="text-primary">Pods</span>
            </span>
            <span className="mt-1 hidden text-[10px] uppercase tracking-[0.22em] text-muted-foreground lg:block">
              {STORE_TAGLINE}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <SearchBar />
          <Button
            type="button"
            variant="outline"
            onClick={() => openCheckout()}
            className="relative rounded-full px-3"
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
