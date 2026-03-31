import igniteV55Image from "@/assets/products/ignite-v55-box.png";
import igniteV80Image from "@/assets/products/ignite-v80-box.png";
import igniteV120Image from "@/assets/products/ignite-v120-box.png";
import igniteV155Image from "@/assets/products/ignite-v155-device.png";
import igniteV300Image from "@/assets/products/ignite-v300-box.png";

export interface ProductVariation {
  id: string;
  name: string;
  inStock: boolean;
}

export interface ProductVisualTheme {
  edition: string;
  accent: string;
  accentSoft: string;
  accentContrast: string;
  background: string;
  shadow: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  puffs: number;
  description: string;
  price: number;
  promoPrice?: number;
  images: string[];
  categoryId: string;
  variations: ProductVariation[];
  tags: string[];
  featured: boolean;
  createdAt: string;
  warrantyNote: string;
  shippingNote: string;
  visualTheme: ProductVisualTheme;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  description: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  active: boolean;
}

export interface StoreHighlight {
  id: string;
  title: string;
  description: string;
}

export interface DeliveryZone {
  id: string;
  area: string;
  value: string;
  note: string;
}

export interface StorePolicy {
  id: string;
  title: string;
  description: string;
}

export const STORE_NAME = "Monopólio Pods";
export const STORE_TAGLINE = "Ignite x Elfbar x Oxbar";
export const WHATSAPP_NUMBER = "5581992421131";
export const WHATSAPP_DISPLAY = "(81) 99242-1131";
export const AGE_NOTICE = "Proibida a venda para menores de 18 anos.";

export const categories: Category[] = [
  {
    id: "1",
    name: "Até 8.000 puffs",
    slug: "ate-8000-puffs",
    icon: "Zap",
    order: 1,
    description: "Modelos Ignite V55 e V80.",
  },
  {
    id: "2",
    name: "12.000 a 15.500",
    slug: "12000-a-15500",
    icon: "Battery",
    order: 2,
    description: "Modelos Ignite V120 e V155.",
  },
  {
    id: "3",
    name: "30.000 puffs",
    slug: "30000-puffs",
    icon: "Sparkles",
    order: 3,
    description: "Modelo Ignite V300.",
  },
];

export const banners: Banner[] = [
  {
    id: "1",
    title: "MONOPOLIO PODS",
    subtitle: "Linha Ignite disponível para pedido no WhatsApp.",
    image: "",
    ctaText: "Ver catálogo",
    ctaLink: "/categoria/ate-8000-puffs",
    active: true,
  },
  {
    id: "2",
    title: "2 PODS = FRETE GRATIS",
    subtitle: "Frete grátis em compras com 2 pods nas áreas elegíveis.",
    image: "",
    ctaText: "Montar pedido",
    ctaLink: "/categoria/12000-a-15500",
    active: true,
  },
  {
    id: "3",
    title: "GARANTIA GRATUITA",
    subtitle: "Troca do produto em até 48 horas após a entrega.",
    image: "",
    ctaText: "Ver estoque",
    ctaLink: "/categoria/30000-puffs",
    active: true,
  },
];

export const storeHighlights: StoreHighlight[] = [
  {
    id: "1",
    title: "ZN e Olinda com frete grátis",
    description: "Entrega sem custo para bairros elegíveis dessas regiões.",
  },
  {
    id: "2",
    title: "ZS de Recife com taxa fixa",
    description: "Frete fixo de R$ 5,00 para a zona sul do Recife.",
  },
  {
    id: "3",
    title: "Garantia gratuita de 48 horas",
    description: "Se o pod vier com problema, trocamos o produto sem custo.",
  },
];

export const deliveryZones: DeliveryZone[] = [
  {
    id: "1",
    area: "Zona Norte e Olinda",
    value: "Sem custo em áreas elegíveis",
    note: "Entrega via Uber, sujeita à disponibilidade da logística da loja.",
  },
  {
    id: "2",
    area: "Zona Sul do Recife",
    value: "Frete fixo de R$ 5,00",
    note: "Consulte disponibilidade por bairro antes da confirmação do pedido.",
  },
  {
    id: "3",
    area: "Outras regiões",
    value: "Consultar valores",
    note: "O valor da corrida é informado conforme a região e a disponibilidade.",
  },
];

export const storePolicies: StorePolicy[] = [
  {
    id: "1",
    title: "Garantia gratuita",
    description:
      "Caso o produto apresente problema, a troca do item é sem custo. A logística da troca fica por conta do cliente.",
  },
  {
    id: "2",
    title: "Prazo da garantia",
    description: "A garantia é válida apenas por 48 horas após a entrega.",
  },
  {
    id: "3",
    title: "Entrega via Uber",
    description:
      "Não nos responsabilizamos por problemas ocorridos durante a corrida. Em caso de troca, é necessário solicitar um novo Uber.",
  },
  {
    id: "4",
    title: "Logística da troca",
    description:
      "A logística da troca é sempre de responsabilidade do cliente, inclusive quando houver novo envio do item.",
  },
  {
    id: "5",
    title: "Cobertura de entrega",
    description: "A entrega sem custo depende da região e da disponibilidade da logística da loja.",
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Ignite V55 - 5.500 Puffs",
    slug: "ignite-v55-5500-puffs",
    brand: "Ignite",
    puffs: 5500,
    description: "Modelo de 5.500 puffs com perfil mentolado.",
    price: 95,
    images: [igniteV55Image],
    categoryId: "1",
    variations: [
      { id: "v55-1", name: "Menta ice", inStock: true },
      { id: "v55-2", name: "Menta", inStock: true },
      { id: "v55-3", name: "Menta Miami", inStock: true },
    ],
    tags: ["mentolado"],
    featured: false,
    createdAt: "2026-03-30",
    warrantyNote: "Garantia gratuita de 48 horas após a entrega.",
    shippingNote: "Entrega via Uber. Consulte cobertura da região e valor da logística.",
    visualTheme: {
      edition: "Ultra Thin Miami Mint",
      accent: "#183127",
      accentSoft: "rgba(24, 49, 39, 0.10)",
      accentContrast: "#ffffff",
      background: "linear-gradient(180deg, #ffffff 0%, #edf7f1 100%)",
      shadow: "0 28px 70px rgba(24, 49, 39, 0.14)",
    },
  },
  {
    id: "2",
    name: "Ignite V80 - 8.000 Puffs",
    slug: "ignite-v80-8000-puffs",
    brand: "Ignite",
    puffs: 8000,
    description: "Modelo de 8.000 puffs com ampla variedade de sabores.",
    price: 105,
    images: [igniteV80Image],
    categoryId: "1",
    variations: [
      { id: "v80-1", name: "Maracujá Kiwi", inStock: true },
      { id: "v80-2", name: "Morango Kiwi", inStock: true },
      { id: "v80-3", name: "Uva ice", inStock: true },
      { id: "v80-4", name: "Melancia ice", inStock: true },
      { id: "v80-5", name: "Menta ice", inStock: true },
      { id: "v80-6", name: "Menta", inStock: true },
      { id: "v80-7", name: "Cactus", inStock: true },
      { id: "v80-8", name: "Maçã Verde", inStock: true },
      { id: "v80-9", name: "Manga Limão", inStock: true },
      { id: "v80-10", name: "Toranja Menta", inStock: true },
      { id: "v80-11", name: "Melancia Frozen", inStock: true },
      { id: "v80-12", name: "Uva Frozen", inStock: true },
    ],
    tags: ["popular", "mais-sabores"],
    featured: true,
    createdAt: "2026-03-30",
    warrantyNote: "Garantia gratuita de 48 horas após a entrega.",
    shippingNote: "Entrega via Uber. Consulte cobertura da região e valor da logística.",
    visualTheme: {
      edition: "Gold Edition",
      accent: "#9b7a31",
      accentSoft: "rgba(155, 122, 49, 0.13)",
      accentContrast: "#ffffff",
      background: "linear-gradient(180deg, #fffbf2 0%, #efe1b8 100%)",
      shadow: "0 28px 70px rgba(155, 122, 49, 0.18)",
    },
  },
  {
    id: "3",
    name: "Ignite V120 - 12.000 Puffs",
    slug: "ignite-v120-12000-puffs",
    brand: "Ignite",
    puffs: 12000,
    description: "Modelo de 12.000 puffs com autonomia intermediária.",
    price: 115,
    images: [igniteV120Image],
    categoryId: "2",
    variations: [
      { id: "v120-1", name: "Melancia Pêssego", inStock: true },
      { id: "v120-2", name: "Aloe Grape", inStock: true },
    ],
    tags: [],
    featured: false,
    createdAt: "2026-03-30",
    warrantyNote: "Garantia gratuita de 48 horas após a entrega.",
    shippingNote: "Entrega via Uber. Consulte cobertura da região e valor da logística.",
    visualTheme: {
      edition: "Rose Gold Edition",
      accent: "#9f6d60",
      accentSoft: "rgba(159, 109, 96, 0.12)",
      accentContrast: "#ffffff",
      background: "linear-gradient(180deg, #fffaf8 0%, #f4dfd5 100%)",
      shadow: "0 28px 70px rgba(159, 109, 96, 0.15)",
    },
  },
  {
    id: "4",
    name: "Ignite V155 - 15.500 Puffs",
    slug: "ignite-v155-15500-puffs",
    brand: "Ignite",
    puffs: 15500,
    description: "Modelo de 15.500 puffs com autonomia alta e mais sabores.",
    price: 130,
    images: [igniteV155Image],
    categoryId: "2",
    variations: [
      { id: "v155-1", name: "Maracujá Kiwi Goiaba", inStock: true },
      { id: "v155-2", name: "Morango Kiwi", inStock: true },
      { id: "v155-3", name: "Uva ice", inStock: true },
      { id: "v155-4", name: "Menta", inStock: true },
      { id: "v155-5", name: "Melancia ice", inStock: true },
      { id: "v155-6", name: "Melancia Mix", inStock: true },
      { id: "v155-7", name: "Menta ice", inStock: true },
      { id: "v155-8", name: "Blueberry", inStock: true },
      { id: "v155-9", name: "Maçã Verde", inStock: true },
      { id: "v155-10", name: "Tropical Açaí", inStock: true },
    ],
    tags: ["popular"],
    featured: true,
    createdAt: "2026-03-30",
    warrantyNote: "Garantia gratuita de 48 horas após a entrega.",
    shippingNote: "Entrega via Uber. Consulte cobertura da região e valor da logística.",
    visualTheme: {
      edition: "Ultra Slim Orange",
      accent: "#cf6b34",
      accentSoft: "rgba(207, 107, 52, 0.13)",
      accentContrast: "#ffffff",
      background: "linear-gradient(180deg, #fffaf4 0%, #ffd8bd 100%)",
      shadow: "0 28px 70px rgba(207, 107, 52, 0.16)",
    },
  },
  {
    id: "5",
    name: "Ignite V300 - 30.000 Puffs",
    slug: "ignite-v300-30000-puffs",
    brand: "Ignite",
    puffs: 30000,
    description: "Modelo de 30.000 puffs com autonomia máxima.",
    price: 180,
    images: [igniteV300Image],
    categoryId: "3",
    variations: [
      { id: "v300-1", name: "Morango Kiwi", inStock: true },
      { id: "v300-2", name: "Melancia ice", inStock: true },
      { id: "v300-3", name: "Abacaxi Manga", inStock: true },
      { id: "v300-4", name: "Menta Melão", inStock: true },
      { id: "v300-5", name: "Uva ice", inStock: true },
      { id: "v300-6", name: "Menta", inStock: true },
      { id: "v300-7", name: "Menta ice", inStock: true },
      { id: "v300-8", name: "Maçã Verde", inStock: true },
      { id: "v300-9", name: "Banana ice", inStock: true },
      { id: "v300-10", name: "Morango ice", inStock: true },
      { id: "v300-11", name: "Cactus Limão Soda", inStock: true },
    ],
    tags: ["popular", "premium"],
    featured: true,
    createdAt: "2026-03-30",
    warrantyNote: "Garantia gratuita de 48 horas após a entrega.",
    shippingNote: "Entrega via Uber. Consulte cobertura da região e valor da logística.",
    visualTheme: {
      edition: "Black Digital",
      accent: "#1b2430",
      accentSoft: "rgba(27, 36, 48, 0.12)",
      accentContrast: "#ffffff",
      background: "linear-gradient(180deg, #f2f5f8 0%, #d8dfe7 100%)",
      shadow: "0 28px 70px rgba(27, 36, 48, 0.17)",
    },
  },
];

export function getProductsByTag(tag: string): Product[] {
  return products.filter((product) => product.tags.includes(tag));
}

export function getProductsByCategory(categorySlug: string): Product[] {
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) return [];
  return products.filter((product) => product.categoryId === category.id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

export function searchProducts(query: string): Product[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) => {
    const category = categories.find((item) => item.id === product.categoryId);

    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.brand.toLowerCase().includes(normalizedQuery) ||
      String(product.puffs).includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      product.variations.some((variation) => variation.name.toLowerCase().includes(normalizedQuery)) ||
      category?.name.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatPuffs(value: number): string {
  return `${value.toLocaleString("pt-BR")} puffs`;
}

export function buildWhatsAppLink(product: Product, variation?: string, quantity = 1): string {
  const unitPrice = product.promoPrice ?? product.price;
  const subtotal = unitPrice * quantity;

  const lines = [
    `Olá! Quero fazer um pedido na ${STORE_NAME}:`,
    "",
    `Produto: ${product.name}`,
    `Marca: ${product.brand}`,
    `Puffs: ${formatPuffs(product.puffs)}`,
    variation ? `Sabor: ${variation}` : "",
    `Quantidade: ${quantity}`,
    `Valor unitário: ${formatPrice(unitPrice)}`,
    `Subtotal: ${formatPrice(subtotal)}`,
    "",
    "Pode confirmar disponibilidade, frete e prazo de entrega?",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
}
