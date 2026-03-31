import { Product } from "@/data/products";
import { cn } from "@/lib/utils";

type ProductImageStageVariant = "card" | "detail" | "compact" | "checkout";

const variantStyles: Record<
  ProductImageStageVariant,
  {
    stage: string;
    shell: string;
    image: string;
  }
> = {
  card: {
    stage: "mx-auto flex h-full w-full items-center justify-center",
    shell:
      "relative flex aspect-[4/5] w-full max-w-[13rem] items-center justify-center overflow-hidden rounded-[30px] border border-white/70 p-4 backdrop-blur-sm dark:border-white/10 md:max-w-[14rem] md:p-5",
    image:
      "h-full w-full object-contain drop-shadow-[0_24px_44px_rgba(0,0,0,0.16)] [filter:saturate(0.9)_contrast(1.02)]",
  },
  detail: {
    stage: "mx-auto flex h-full w-full items-center justify-center",
    shell:
      "relative flex aspect-[4/5] w-full max-w-[18rem] items-center justify-center overflow-hidden rounded-[34px] border border-white/70 p-6 backdrop-blur-sm dark:border-white/10 md:max-w-[20rem] md:p-7",
    image:
      "h-full w-full object-contain drop-shadow-[0_30px_56px_rgba(0,0,0,0.18)] [filter:saturate(0.92)_contrast(1.02)]",
  },
  compact: {
    stage: "flex h-full w-full items-center justify-center",
    shell:
      "relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/70 p-2.5 backdrop-blur-sm dark:border-white/10",
    image:
      "h-full w-full object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.15)] [filter:saturate(0.9)_contrast(1.02)]",
  },
  checkout: {
    stage: "flex h-full w-full items-center justify-center",
    shell:
      "relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/70 p-2.5 backdrop-blur-sm dark:border-white/10",
    image:
      "h-full w-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.15)] [filter:saturate(0.88)_contrast(1.02)]",
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
            background: product.visualTheme.background,
            boxShadow: product.visualTheme.shadow,
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-5 top-3 h-14 rounded-full bg-white/45 blur-2xl dark:bg-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 bottom-3 h-4 rounded-full bg-black/10 blur-xl dark:bg-black/35"
          />

          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className={cn(styles.image, imageClassName)}
          />
        </div>
      </div>
    </div>
  );
}
