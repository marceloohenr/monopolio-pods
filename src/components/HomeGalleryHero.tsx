import * as React from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, ImageIcon } from "lucide-react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="group mx-auto overflow-hidden rounded-[26px] border border-black/10 bg-[#16171b] p-[3px] shadow-[0_18px_45px_rgba(15,16,19,0.10)] sm:rounded-[30px] sm:p-1">
      <div className="relative aspect-[591/1280] overflow-hidden rounded-[22px] bg-[#0f1013] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:rounded-[26px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.18))]" />
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onError={() => setHasError(true)}
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, (min-width: 380px) 74vw, 86vw"
          className={`absolute inset-0 h-full w-full object-contain object-top transition duration-500 group-hover:scale-[1.01] ${
            hasError ? "opacity-0" : "opacity-100"
          }`}
        />

        <Badge className="absolute left-3 top-3 z-10 border-white/20 bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:text-[11px]">
          <BadgeCheck className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
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
  const interactionTimeoutRef = React.useRef<number>();

  const handleManualNav = React.useCallback(
    (direction: "prev" | "next") => {
      window.clearTimeout(interactionTimeoutRef.current);
      setIsInteracting(true);

      if (direction === "prev") {
        api?.scrollPrev();
      } else {
        api?.scrollNext();
      }

      interactionTimeoutRef.current = window.setTimeout(() => {
        setIsInteracting(false);
      }, 4200);
    },
    [api],
  );

  React.useEffect(() => {
    return () => window.clearTimeout(interactionTimeoutRef.current);
  }, []);

  React.useEffect(() => {
    if (!api || isInteracting || homeGalleryImages.length <= 1) return;

    const timer = window.setInterval(() => {
      api.scrollNext();
    }, 3200);

    return () => window.clearInterval(timer);
  }, [api, isInteracting]);

  return (
    <section
      className="space-y-3 overflow-hidden px-4 md:space-y-4 md:px-0"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={() => setIsInteracting(false)}
    >
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">Registros</p>
        <h2 className="font-display text-[2rem] font-bold leading-[0.95] text-foreground sm:text-3xl md:text-4xl">
          Feedback de clientes
        </h2>
      </div>

      <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="-mx-1 px-1 sm:mx-0 sm:px-0 md:px-12">
        <CarouselContent className="items-start">
          {homeGalleryImages.map((image, index) => (
            <CarouselItem
              key={image.id}
              className="basis-[88%] min-[380px]:basis-[78%] sm:basis-[48%] lg:basis-[32%]"
              style={{ contentVisibility: "auto", containIntrinsicSize: "300px 650px" }}
            >
              <GallerySlide src={image.src} alt={image.alt} label={image.label} priority={index < 4} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-[3.5rem] top-3 z-20 h-9 w-9 rounded-full border border-white/10 bg-black/55 text-white shadow-[0_12px_28px_rgba(0,0,0,0.26)] backdrop-blur-sm hover:bg-black/70 hover:text-white md:left-2 md:right-auto md:top-1/2 md:h-10 md:w-10 md:-translate-y-1/2"
          onClick={() => handleManualNav("prev")}
          aria-label="Ver feedback anterior"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 z-20 h-9 w-9 rounded-full border border-white/10 bg-black/55 text-white shadow-[0_12px_28px_rgba(0,0,0,0.26)] backdrop-blur-sm hover:bg-black/70 hover:text-white md:right-2 md:top-1/2 md:h-10 md:w-10 md:-translate-y-1/2"
          onClick={() => handleManualNav("next")}
          aria-label="Ver proximo feedback"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Carousel>
    </section>
  );
}
