import { Product } from "@/data/products";
import { cn } from "@/lib/utils";

type ProductImageStageVariant = "card" | "detail" | "compact" | "checkout";

interface ProductImageAdjustment {
  scale: number;
  x?: number;
  y?: number;
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
      "relative flex h-full w-full items-center justify-center overflow-hidden rounded-[26px] border border-white/80 p-2 backdrop-blur-sm dark:border-white/10 md:p-2.5",
    image:
      "h-full w-full origin-center object-contain drop-shadow-[0_24px_44px_rgba(0,0,0,0.16)] [filter:saturate(0.96)_contrast(1.02)]",
  },
  detail: {
    stage: "flex h-full w-full items-center justify-center",
    shell:
      "relative flex h-full w-full items-center justify-center overflow-hidden rounded-[30px] border border-white/80 p-3 backdrop-blur-sm dark:border-white/10 md:p-4",
    image:
      "h-full w-full origin-center object-contain drop-shadow-[0_30px_56px_rgba(0,0,0,0.18)] [filter:saturate(0.98)_contrast(1.02)]",
  },
  compact: {
    stage: "flex h-full w-full items-center justify-center",
    shell:
      "relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/80 p-1 backdrop-blur-sm dark:border-white/10",
    image:
      "h-full w-full origin-center object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.15)] [filter:saturate(0.96)_contrast(1.02)]",
  },
  checkout: {
    stage: "flex h-full w-full items-center justify-center",
    shell:
      "relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/80 p-1 backdrop-blur-sm dark:border-white/10",
    image:
      "h-full w-full origin-center object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.15)] [filter:saturate(0.95)_contrast(1.02)]",
  },
};

const productImageAdjustments: Record<string, Partial<Record<ProductImageStageVariant, ProductImageAdjustment>>> = {
  "ignite-v55-5500-puffs": {
    card: { scale: 1.18, y: -4 },
    detail: { scale: 1.22, y: -4 },
    compact: { scale: 1.12, y: -2 },
    checkout: { scale: 1.08, y: -2 },
  },
  "ignite-v80-8000-puffs": {
    card: { scale: 1.15, y: -3 },
    detail: { scale: 1.2, y: -3 },
    compact: { scale: 1.1, y: -2 },
    checkout: { scale: 1.06, y: -1 },
  },
  "ignite-v120-12000-puffs": {
    card: { scale: 1.14, y: -1 },
    detail: { scale: 1.18, y: -1 },
    compact: { scale: 1.08, y: 0 },
    checkout: { scale: 1.05, y: 0 },
  },
  "ignite-v155-15500-puffs": {
    card: { scale: 1.08, x: 1, y: 0 },
    detail: { scale: 1.12, x: 1, y: 0 },
    compact: { scale: 1.03, x: 1 },
    checkout: { scale: 1.01, x: 1 },
  },
  "ignite-v300-30000-puffs": {
    card: { scale: 1.08, y: -1 },
    detail: { scale: 1.14, y: -1 },
    compact: { scale: 1.02, y: 0 },
    checkout: { scale: 1.01, y: 0 },
  },
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
  const styles = variantStyles[variant];
  const adjustment = productImageAdjustments[product.slug]?.[variant] ?? { scale: 1 };
  const imageTransform = `translate3d(${adjustment.x ?? 0}%, ${adjustment.y ?? 0}%, 0) scale(${adjustment.scale})`;

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
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className={cn(styles.image, imageClassName)}
            style={{ transform: imageTransform }}
          />
        </div>
      </div>
    </div>
  );
}
