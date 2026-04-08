import { categories, deliveryZones, Product, WHATSAPP_DISPLAY } from "@/data/products";

export const DEFAULT_SITE_URL = (import.meta.env.VITE_SITE_URL || "https://monopoliopods.vercel.app").replace(/\/+$/, "");
export const SITE_NAME = "Monopolio Pods";
export const SITE_LEGAL_NAME = SITE_NAME;
export const SITE_DESCRIPTION =
  "Comprar pods em Recife e Olinda com entrega via Uber, catálogo de Ignite, Elfbar e Oxbar, atendimento rápido no WhatsApp e garantia de 48 horas.";
export const SITE_OG_IMAGE = "/og-catalogo-monopolio-pods.jpg";
export const SITE_LOCALE = "pt_BR";
export const SITE_TWITTER_HANDLE = "@monopoliopods";
export const SITE_KEYWORDS = [
  "pods recife",
  "comprar pods recife",
  "ignite pods recife",
  "elfbar recife",
  "oxbar recife",
  "pods entrega recife",
  "pods olinda",
  "pod descartavel recife",
  "catálogo de pods recife",
];

export function toAbsoluteUrl(pathname = "/") {
  if (/^https?:\/\//.test(pathname)) return pathname;

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${DEFAULT_SITE_URL}${normalizedPath}`;
}

export function buildTitle(title: string) {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

export function buildProductSeoDescription(product: Product) {
  return `${product.name} da ${product.brand} com ${product.puffs.toLocaleString("pt-BR")} puffs, sabores disponíveis e entrega em Recife e Olinda. Compre no catálogo da ${SITE_NAME} com frete regional e garantia de 48 horas.`;
}

export function buildCategorySeoDescription(categoryName: string, totalProducts: number) {
  return `${categoryName} em Recife e Olinda com ${totalProducts} modelo${totalProducts !== 1 ? "s" : ""} disponível${totalProducts !== 1 ? "eis" : ""} para pedido no WhatsApp. Catálogo da ${SITE_NAME} com entrega, frete regional e garantia de 48 horas.`;
}

export function buildSearchSeoDescription(query: string, totalProducts: number) {
  if (!query) {
    return "Busque pods Ignite, Elfbar e Oxbar em Recife e Olinda no catálogo da Monopolio Pods.";
  }

  return `Busca por ${query} com ${totalProducts} resultado${totalProducts !== 1 ? "s" : ""} no catálogo da ${SITE_NAME} para Recife, Olinda e região metropolitana.`;
}

export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_LEGAL_NAME,
    alternateName: SITE_NAME,
    image: toAbsoluteUrl(SITE_OG_IMAGE),
    url: DEFAULT_SITE_URL,
    telephone: WHATSAPP_DISPLAY,
    areaServed: ["Recife", "Olinda", "Região Metropolitana do Recife"],
    priceRange: "$$",
    paymentAccepted: ["Pix", "Cartão"],
    currenciesAccepted: "BRL",
    sameAs: ["https://www.instagram.com/monopoliopods/"],
    description: SITE_DESCRIPTION,
    makesOffer: categories.map((category) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: `${category.name} Pods`,
        category: category.name,
      },
      availability: "https://schema.org/InStock",
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Catálogo de pods Monopolio Pods",
      itemListElement: categories.map((category) => ({
        "@type": "OfferCatalog",
        name: category.name,
        url: toAbsoluteUrl(`/categoria/${category.slug}`),
      })),
    },
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_LEGAL_NAME,
    url: DEFAULT_SITE_URL,
    inLanguage: "pt-BR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${DEFAULT_SITE_URL}/busca?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

export function buildCollectionSchema(title: string, paths: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url: toAbsoluteUrl("/"),
    hasPart: paths.map((path) => ({
      "@type": "WebPage",
      url: toAbsoluteUrl(path),
    })),
  };
}

export function buildProductSchema(product: Product) {
  const offerPrice = product.promoPrice ?? product.price;
  const isAvailable = product.variations.some((variation) => variation.inStock);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: buildProductSeoDescription(product),
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    sku: product.id,
    category: product.brand,
    image: product.images.map((image) => toAbsoluteUrl(image)),
    url: toAbsoluteUrl(`/produto/${product.slug}`),
    areaServed: ["Recife", "Olinda"],
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: offerPrice.toFixed(2),
      availability: isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: toAbsoluteUrl(`/produto/${product.slug}`),
      seller: {
        "@type": "LocalBusiness",
        name: SITE_LEGAL_NAME,
      },
      shippingDetails: deliveryZones.map((zone) => ({
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "BR",
          addressRegion: "PE",
          addressLocality: zone.area,
        },
        shippingRate: {
          "@type": "MonetaryAmount",
          currency: "BRL",
          value: zone.value.includes("5,00") ? "5.00" : "0.00",
        },
      })),
    },
  };
}

export function buildProductImageAlt(product: Product) {
  return `${product.name} da ${product.brand} disponível para compra em Recife e Olinda`;
}
