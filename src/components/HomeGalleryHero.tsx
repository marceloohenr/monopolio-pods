import * as React from "react";
import { BadgeCheck, ImageIcon } from "lucide-react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { homeGalleryImages } from "@/data/home-gallery";

const GallerySlide = React.memo(function GallerySlide({
  src,
  alt,
  label,
  priority,
}: {
  src: string;
  alt: string;
  label: string;
  priority?: boolean;
}) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  return (
    <div className="glass group h-full overflow-hidden rounded-[30px] border-border/60 p-2 sm:p-2.5">
      <div className="relative aspect-[591/1280] overflow-hidden rounded-[24px] bg-[#0f1013] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.18))]" />
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onError={() => setHasError(true)}
          sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 82vw"
          className={`absolute inset-0 h-full w-full object-contain object-top transition duration-500 group-hover:scale-[1.01] ${
            hasError ? "opacity-0" : "opacity-100"
          }`}
        />

        <Badge className="absolute left-4 top-4 z-10 border-white/20 bg-black/55 px-3 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm">
          <BadgeCheck className="mr-1.5 h-3.5 w-3.5" />
          Compra verificada
        </Badge>

        {hasError ? (
          <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Imagem aguardando upload</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
            <p className="max-w-[18rem] text-xs leading-relaxed text-muted-foreground">
              Adicione o arquivo em <span className="font-medium text-foreground">/public/assets/feedbacks</span>{" "}
              para exibir a imagem automaticamente.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
});
GallerySlide.displayName = "GallerySlide";

export function HomeGalleryHero() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [isInteracting, setIsInteracting] = React.useState(false);

  React.useEffect(() => {
    if (!api || isInteracting || homeGalleryImages.length <= 1) return;

    const timer = window.setInterval(() => {
      api.scrollNext();
    }, 3200);

    return () => window.clearInterval(timer);
  }, [api, isInteracting]);

  return (
    <section
      className="space-y-4 px-4 md:px-0"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={() => setIsInteracting(false)}
    >
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">Registros</p>
        <h2 className="font-display text-3xl font-bold leading-none text-foreground md:text-4xl">
          Feedback de clientes
        </h2>
      </div>

      <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="px-0 md:px-12">
        <CarouselContent>
          {homeGalleryImages.map((image, index) => (
            <CarouselItem
              key={image.id}
              className="basis-[82%] sm:basis-[48%] lg:basis-[32%]"
              style={{ contentVisibility: "auto", containIntrinsicSize: "340px 736px" }}
            >
              <GallerySlide src={image.src} alt={image.alt} label={image.label} priority={index < 4} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
}
