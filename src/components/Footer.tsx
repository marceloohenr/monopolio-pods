import { Link } from "react-router-dom";
import { Instagram, MapPin, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AGE_NOTICE,
  STORE_TAGLINE,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
  deliveryZones,
} from "@/data/products";
import { SITE_NAME } from "@/lib/site-config";
import monopolioLogo from "@/assets/monopolio-logo.jpg";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-border/60 bg-card/70">
      <div className="container mx-auto max-w-6xl px-4 py-6 md:px-0 md:py-8">
        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr_1fr] md:gap-6">
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
                <img
                  src={monopolioLogo}
                  alt="Logo da Monopolio Pods com entrega em Recife e Olinda"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <p className="font-display text-2xl leading-none text-foreground">{SITE_NAME}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{STORE_TAGLINE}</p>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Loja de pods em Recife e Olinda com atendimento no WhatsApp, entrega regional e garantia de 48 horas para Ignite, Elfbar e Oxbar.
            </p>

            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Contato</p>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="whatsapp" className="rounded-2xl">
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  {WHATSAPP_DISPLAY}
                </a>
              </Button>

              <Button asChild variant="outline" className="rounded-2xl">
                <a href="https://www.instagram.com/monopoliopods/" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                  @monopoliopods
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <Truck className="h-3.5 w-3.5" />
              Entrega
            </div>

            <div className="space-y-2">
              {deliveryZones.map((zone) => (
                <div key={zone.id} className="rounded-2xl border border-border/60 bg-background/60 p-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{zone.area}</p>
                      <p className="text-xs text-muted-foreground">{zone.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Garantia
            </div>

            <div className="rounded-3xl border border-border/60 bg-background/60 p-4">
              <p className="text-base font-semibold text-foreground">Garantia gratuita de 48h</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Caso o produto apresente problema apos a entrega, a troca segue a politica informada pela loja.
              </p>
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-primary">{AGE_NOTICE}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>{SITE_NAME} | Recife e regiao metropolitana</p>

          <Button
            asChild
            variant="outline"
            className="h-auto self-center rounded-full px-2.5 py-1 text-[11px] font-semibold sm:ml-auto sm:px-3 sm:py-1.5 sm:text-xs"
          >
            <a href="https://devmarcelo.vercel.app" target="_blank" rel="noopener noreferrer" aria-label="Abrir site do desenvolvedor">
              <span>&lt;/&gt;</span>
              <span>Desenvolvedor</span>
              <span>&lt;/&gt;</span>
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}
