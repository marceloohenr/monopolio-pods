import * as React from "react";
import { ShieldCheck } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { loadTestimonials, TESTIMONIALS_EVENT, type Testimonial } from "@/data/testimonials";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TestimonialsSection() {
  const [items, setItems] = React.useState<Testimonial[]>([]);

  React.useEffect(() => {
    const sync = () => setItems(loadTestimonials());

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(TESTIMONIALS_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(TESTIMONIALS_EVENT, sync);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="space-y-3 px-4 md:px-0">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">Prova social</p>
          <h2 className="font-display text-lg font-bold text-foreground md:text-xl">Feedbacks</h2>
        </div>
      </div>

      <Carousel opts={{ align: "start", loop: items.length > 1 }} className="px-10 md:px-12">
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.id} className="basis-full md:basis-1/2 xl:basis-1/3">
              <div className="glass h-full rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  {item.photoUrl ? (
                    <img src={item.photoUrl} alt={item.name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {getInitials(item.name)}
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Cliente verificado</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{item.text}"</p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Feedback real
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-0 top-12 -translate-y-0" />
        <CarouselNext className="right-0 top-12 -translate-y-0" />
      </Carousel>
    </section>
  );
}
