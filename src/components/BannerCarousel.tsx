import { Link } from "react-router-dom";
import { MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { banners, buildWhatsAppLink, getFeaturedProducts } from "@/data/products";
import { Button } from "@/components/ui/button";
import monopolioLogo from "@/assets/monopolio-logo.jpg";

export function BannerCarousel() {
  const banner = banners.find((item) => item.active);
  const featuredProduct = getFeaturedProducts()[0];

  if (!banner || !featuredProduct) return null;

  const theme = featuredProduct.visualTheme;

  return (
    <section className="mx-4 md:mx-0 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-3">
      <div className="hidden glass rounded-2xl border border-border/50 bg-gradient-to-br from-primary/15 via-background to-background p-4 md:p-6 lg:block">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm md:h-20 md:w-20">
            <img src={monopolioLogo} alt="Logo Monopólio Pods" className="h-full w-full object-cover" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">Atendimento via WhatsApp</p>
            <p className="text-xs font-medium text-muted-foreground md:text-sm">Linha Ignite disponível</p>
          </div>
        </div>
        <h1 className="max-w-xl font-display text-[2rem] font-bold leading-none text-foreground md:text-5xl">
          {banner.title}
        </h1>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground md:mt-4 md:text-base">
          {banner.subtitle}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] font-medium text-foreground md:gap-2 md:text-xs">
          <span className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1 md:px-3 md:py-1.5">Ignite</span>
          <span className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1 md:px-3 md:py-1.5">WhatsApp</span>
          <span className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1 md:px-3 md:py-1.5">48h</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 md:mt-6 md:flex md:flex-row md:gap-3">
          <Button asChild variant="neon" size="lg" className="h-10 px-4 text-sm md:h-11 md:px-8">
            <Link to={banner.ctaLink}>{banner.ctaText}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-10 px-4 text-sm md:h-11 md:px-8">
            <a href={buildWhatsAppLink(featuredProduct)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>

      <div
        className="glass rounded-2xl border border-border/50 p-4 md:p-5 lg:h-full"
        style={{ background: theme.background, boxShadow: theme.shadow }}
      >
        <p className="text-[10px] uppercase tracking-[0.24em] text-primary md:text-xs">Em destaque</p>
        <div className="mt-3 grid grid-cols-[112px_1fr] gap-3 md:mt-4 md:gap-4">
          <div className="overflow-hidden rounded-xl bg-card/60 md:rounded-2xl">
            <img
              src={featuredProduct.images[0]}
              alt={featuredProduct.name}
              className="h-full w-full object-contain p-2.5 md:p-4"
            />
          </div>

          <div className="space-y-2.5">
            <h2 className="font-display text-xl font-bold leading-none text-foreground md:text-2xl">{featuredProduct.name}</h2>
            <p className="line-clamp-2 text-xs text-muted-foreground md:text-sm">{featuredProduct.description}</p>
            <div className="rounded-xl border border-border/60 bg-card/80 p-2.5 md:rounded-2xl md:p-3">
              <p className="text-xs uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
                {theme.edition}
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground md:mt-2 md:text-sm">Consulte sabores e disponibilidade.</p>
            </div>

            <div className="space-y-1.5 text-xs text-foreground md:space-y-2 md:text-sm">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span>Frete por região.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Garantia de 48 horas.</span>
              </div>
            </div>

            <Button asChild variant="whatsapp" className="mt-2 w-full text-xs md:mt-3 md:text-sm">
              <a href={buildWhatsAppLink(featuredProduct)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                Pedir
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
