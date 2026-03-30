import { useState, useEffect } from "react";
import { banners } from "@/data/products";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export function BannerCarousel() {
  const activeBanners = banners.filter((b) => b.active);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const banner = activeBanners[current];

  const gradients = [
    "from-primary/20 via-background to-background",
    "from-badge-new/20 via-background to-background",
    "from-badge-sale/20 via-background to-background",
  ];

  return (
    <div className="relative overflow-hidden rounded-xl mx-4 md:mx-0">
      <div
        className={`relative bg-gradient-to-r ${gradients[current % gradients.length]} border border-border/50 rounded-xl p-6 md:p-12 min-h-[200px] md:min-h-[300px] flex flex-col justify-center transition-all duration-700`}
      >
        <div className="max-w-lg space-y-3 animate-slide-in" key={banner.id}>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground text-glow">
            {banner.title}
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg">{banner.subtitle}</p>
          <Link to={banner.ctaLink}>
            <Button variant="neon" size="lg" className="mt-2">
              {banner.ctaText}
            </Button>
          </Link>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {activeBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? "bg-primary w-6 box-glow" : "bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={() => setCurrent((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background/50 text-foreground hover:bg-background/80 transition hidden md:block"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrent((prev) => (prev + 1) % activeBanners.length)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background/50 text-foreground hover:bg-background/80 transition hidden md:block"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
