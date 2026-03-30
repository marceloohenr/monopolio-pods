import { Product, formatPrice, buildWhatsAppLink } from "@/data/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.promoPrice
    ? Math.round(((product.price - product.promoPrice) / product.price) * 100)
    : 0;

  return (
    <div className="group glass rounded-lg overflow-hidden transition-all duration-300 hover:box-glow-strong hover:scale-[1.02] animate-slide-in">
      <Link to={`/produto/${product.slug}`} className="block">
        <div className="relative aspect-square bg-secondary/50 overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge className="bg-badge-sale text-foreground font-bold text-xs px-2 py-0.5">
                -{discount}%
              </Badge>
            )}
            {product.tags.includes("new") && (
              <Badge className="bg-badge-new text-foreground font-bold text-xs px-2 py-0.5">
                NOVO
              </Badge>
            )}
            {product.tags.includes("bestseller") && (
              <Badge className="bg-primary text-primary-foreground font-bold text-xs px-2 py-0.5">
                ⭐ MAIS VENDIDO
              </Badge>
            )}
          </div>
        </div>
      </Link>

      <div className="p-3 space-y-2">
        <Link to={`/produto/${product.slug}`}>
          <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          {product.promoPrice ? (
            <>
              <span className="text-lg font-bold text-primary text-glow">
                {formatPrice(product.promoPrice)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <a
          href={buildWhatsAppLink(product)}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button variant="whatsapp" size="sm" className="w-full text-xs">
            <MessageCircle className="h-3.5 w-3.5" />
            Comprar via WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
}
