import * as React from "react";
import { Product } from "@/data/products";
import { buildProductImageAlt } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type ProductImageStageVariant = "card" | "detail" | "compact" | "checkout";

interface ProductImageAdjustment {
  scale: number;
  x?: number;
  y?: number;
  blendMode?: string;
}

const variantStyles: Record<
  ProductImageStageVariant,
  {
    stage: string;
    shell: string;
    image: string;
  }
> = {
  card: {
    stage: "flex h-full w-full items-center justify-center",
    shell:
      "relative isolate flex h-full w-full items-center justify-center overflow-hidden rounded-[26px] border border-white/80 p-2 backdrop-blur-sm dark:border-white/10 md:p-2.5",
    image:
      "h-full w-full origin-center object-contain drop-shadow-[0_24px_44px_rgba(0,0,0,0.16)] [filter:saturate(0.96)_contrast(1.02)]",
  },
  detail: {
    stage: "flex h-full w-full items-center justify-center",
    shell:
      "relative isolate flex h-full w-full items-center justify-center overflow-hidden rounded-[30px] border border-white/80 p-3 backdrop-blur-sm dark:border-white/10 md:p-4",
    image:
      "h-full w-full origin-center object-contain drop-shadow-[0_30px_56px_rgba(0,0,0,0.18)] [filter:saturate(0.98)_contrast(1.02)]",
  },
  compact: {
    stage: "flex h-full w-full items-center justify-center",
    shell:
      "relative isolate flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/80 p-1 backdrop-blur-sm dark:border-white/10",
    image:
      "h-full w-full origin-center object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.15)] [filter:saturate(0.96)_contrast(1.02)]",
  },
  checkout: {
    stage: "flex h-full w-full items-center justify-center",
    shell:
      "relative isolate flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/80 p-1 backdrop-blur-sm dark:border-white/10",
    image:
      "h-full w-full origin-center object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.15)] [filter:saturate(0.95)_contrast(1.02)]",
  },
};

const baseImageAdjustments: Record<ProductImageStageVariant, ProductImageAdjustment> = {
  card: { scale: 1.12, y: -1, blendMode: "multiply" },
  detail: { scale: 1.18, y: -1, blendMode: "multiply" },
  compact: { scale: 1.06, y: 0, blendMode: "multiply" },
  checkout: { scale: 1.03, y: 0, blendMode: "multiply" },
};

interface ProductImageStageProps {
  product: Product;
  variant?: ProductImageStageVariant;
  className?: string;
  imageClassName?: string;
}

export function ProductImageStage({
  product,
  variant = "card",
  className,
  imageClassName,
}: ProductImageStageProps) {
  const [imageIndex, setImageIndex] = React.useState(0);
  const styles = variantStyles[variant];
  const adjustment = baseImageAdjustments[variant];
  const blendMode = adjustment.blendMode;
  const imageTransform = `translate3d(${adjustment.x ?? 0}%, ${adjustment.y ?? 0}%, 0) scale(${adjustment.scale})`;
  const imageSrc = product.images[imageIndex] ?? product.images[0];

  React.useEffect(() => {
    setImageIndex(0);
  }, [product.id]);

  const handleImageError = () => {
    setImageIndex((current) => {
      if (current < product.images.length - 1) {
        return current + 1;
      }

      return current;
    });
  };

  return (
    <div className={cn("relative h-full w-full", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[12%] top-[10%] h-[28%] rounded-full opacity-75 blur-3xl"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${product.visualTheme.accentSoft} 50%, transparent 100%)`,
        }}
      />

      <div className={styles.stage}>
        <div
          className={styles.shell}
          style={{
            background: `radial-gradient(circle at 50% 16%, ${product.visualTheme.accentSoft} 0%, transparent 48%), linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,247,247,0.95) 100%)`,
            boxShadow: product.visualTheme.shadow,
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-5 top-3 h-14 rounded-full bg-white/60 blur-2xl dark:bg-white/20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 bottom-3 h-4 rounded-full bg-black/10 blur-xl dark:bg-black/28"
          />

          <img
            src={imageSrc}
            alt={buildProductImageAlt(product)}
            loading={variant === "detail" ? "eager" : "lazy"}
            decoding="async"
            onError={handleImageError}
            className={cn(styles.image, imageClassName)}
            style={{ transform: imageTransform, mixBlendMode: blendMode }}
          />
        </div>
      </div>
    </div>
  );
}
