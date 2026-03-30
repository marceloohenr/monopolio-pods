import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getProductBySlug,
  formatPrice,
  buildWhatsAppLink,
  products,
} from "@/data/products";
import { MessageCircle, ArrowLeft, Plus, Minus } from "lucide-react";

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;
  const [selectedVariation, setSelectedVariation] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12 text-center">
          <p className="text-muted-foreground text-lg">Produto não encontrado.</p>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.promoPrice
    ? Math.round(((product.price - product.promoPrice) / product.price) * 100)
    : 0;

  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-6xl mx-auto py-6 space-y-8">
        {/* Breadcrumb */}
        <div className="px-4 md:px-0">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-10 px-4 md:px-0">
          {/* Image */}
          <div className="relative aspect-square bg-secondary/50 rounded-xl overflow-hidden glass">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {discount > 0 && (
                <Badge className="bg-badge-sale text-foreground font-bold">
                  -{discount}%
                </Badge>
              )}
              {product.tags.includes("new") && (
                <Badge className="bg-badge-new text-foreground font-bold">
                  NOVO
                </Badge>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {product.name}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {product.promoPrice ? (
                <>
                  <span className="text-3xl font-bold text-primary text-glow">
                    {formatPrice(product.promoPrice)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Variations */}
            {product.variations.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Sabor / Variação:</p>
                <div className="flex flex-wrap gap-2">
                  {product.variations.map((v) => (
                    <button
                      key={v.id}
                      disabled={!v.inStock}
                      onClick={() => setSelectedVariation(v.name)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedVariation === v.name
                          ? "bg-primary text-primary-foreground box-glow"
                          : v.inStock
                          ? "glass text-foreground hover:bg-secondary"
                          : "bg-muted text-muted-foreground/40 cursor-not-allowed line-through"
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-foreground">Quantidade:</p>
              <div className="flex items-center glass rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-muted-foreground hover:text-foreground transition"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-muted-foreground hover:text-foreground transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={buildWhatsAppLink(product, selectedVariation || undefined, quantity)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="whatsapp" size="lg" className="w-full text-base">
                <MessageCircle className="h-5 w-5" />
                Comprar via WhatsApp
              </Button>
            </a>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <ProductGrid products={related} title="Produtos Relacionados" />
        )}
      </main>
    </div>
  );
};

export default ProductPage;
