import * as React from "react";
import { ImageIcon } from "lucide-react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { homeGalleryImages } from "@/data/home-gallery";

function GallerySlide({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label: string;
}) {
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading");

  React.useEffect(() => {
    let isMounted = true;
    const image = new Image();

    image.onload = () => {
      if (isMounted) setStatus("loaded");
    };

    image.onerror = () => {
      if (isMounted) setStatus("error");
    };

    image.src = src;

    return () => {
      isMounted = false;
    };
  }, [src]);

  return (
    <div className="glass group overflow-hidden rounded-[28px]">
      <div className="relative aspect-[9/16] bg-gradient-to-b from-card to-secondary/70">
        {status === "loaded" ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Imagem aguardando upload</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
            <p className="max-w-[18rem] text-xs leading-relaxed text-muted-foreground">
              Adicione o arquivo em <span className="font-medium text-foreground">/public/assets/feedbacks</span> para
              exibir a imagem automaticamente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

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
          {homeGalleryImages.map((image) => (
            <CarouselItem key={image.id} className="basis-[82%] sm:basis-[48%] lg:basis-[32%]">
              <GallerySlide src={image.src} alt={image.alt} label={image.label} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
}
