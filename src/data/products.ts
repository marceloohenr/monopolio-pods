import igniteV55Image from "@/assets/products/ignite-v55-box.png";
import igniteV80Image from "@/assets/products/ignite-v80-box.png";
import igniteV120Image from "@/assets/products/ignite-v120-box.png";
import igniteV155Image from "@/assets/products/ignite-v155-device.png";
import igniteV250Image from "@/assets/products/ignite-v250-device.png";
import igniteV300Image from "@/assets/products/ignite-v300-box.png";
import igniteV400Image from "@/assets/products/ignite-v400-device.png";
import elfbarBc15kImage from "@/assets/products/elfbar-bc-15k.png";
import elfbarGh23kImage from "@/assets/products/elfbar-gh23k.png";
import elfbar40kTrioImage from "@/assets/products/elfbar-40k-trio.png";
import elfbar40kIceKingImage from "@/assets/products/elfbar-40k-ice-king.png";
import elfbar45kProImage from "@/assets/products/elfbar-45k-pro.png";
import oxbar35kImage from "@/assets/products/oxbar-35k.png";
import oxbar50kImage from "@/assets/products/oxbar-50k.webp";

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
export const WHATSAPP_NUMBER = "5581987258754";
export const WHATSAPP_DISPLAY = "(81) 98725-8754";
export const AGE_NOTICE = "Proibida a venda para menores de 18 anos.";

export const categories: Category[] = [
  {
    id: "1",
    name: "Ignite",
    slug: "ignite",
    icon: "Zap",
    order: 1,
    description: "Linha Ignite disponível para pedido no WhatsApp.",
  },
  {
    id: "2",
    name: "Elfbar",
    slug: "elfbar",
    icon: "Sparkles",
    order: 2,
    description: "Linha Elfbar disponível para pedido no WhatsApp.",
  },
  {
    id: "3",
    name: "Oxbar",
    slug: "oxbar",
    icon: "Battery",
    order: 3,
    description: "Linha Oxbar disponível para pedido no WhatsApp.",
  },
];

export const banners: Banner[] = [
  {
    id: "1",
    title: "IGNITE, ELFBAR E OXBAR",
    subtitle: "Catálogo multimarcas disponível para pedido no WhatsApp.",
    image: "",
    ctaText: "Ver catálogo",
    ctaLink: "/categoria/ignite",
    active: true,
  },
  {
    id: "2",
    title: "ELFBAR EM DESTAQUE",
    subtitle: "Modelos Elfbar com diferentes faixas de puffs para seu pedido.",
    image: "",
    ctaText: "Montar pedido",
    ctaLink: "/categoria/elfbar",
    active: true,
  },
  {
    id: "3",
    title: "OXBAR EM DESTAQUE",
    subtitle: "Linha Oxbar disponível com garantia e pedido pelo WhatsApp.",
    image: "",
    ctaText: "Ver estoque",
    ctaLink: "/categoria/oxbar",
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
    note: "Entrega via Uber, sujeita a disponibilidade da logística da loja.",
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
      { id: "v55-1", name: "Melancia Ice", inStock: true },
      { id: "v55-2", name: "Uva Ice", inStock: true },
      { id: "v55-3", name: "Menta Ice", inStock: true },
      { id: "v55-4", name: "Menta", inStock: true },
      { id: "v55-5", name: "Menta Miami", inStock: true },
    ],
    tags: ["mentolado", "popular"],
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
      { id: "v80-1", name: "Maracuja Kiwi", inStock: true },
      { id: "v80-2", name: "Morango Kiwi", inStock: true },
      { id: "v80-3", name: "Uva Ice", inStock: true },
      { id: "v80-4", name: "Melancia Ice", inStock: true },
      { id: "v80-5", name: "Cactus", inStock: true },
      { id: "v80-6", name: "Melancia Frozen", inStock: true },
      { id: "v80-7", name: "Maca Frozen", inStock: true },
      { id: "v80-8", name: "Agua Menta Frozen", inStock: true },
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
    description: "Modelo de 12.000 puffs com autonomia intermediaria.",
    price: 115,
    images: [igniteV120Image],
    categoryId: "1",
    variations: [{ id: "v120-0", name: "Indisponível no momento", inStock: false }],
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
    categoryId: "1",
    variations: [{ id: "v155-0", name: "Indisponível no momento", inStock: false }],
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
    name: "Ignite V250 - 25.000 Puffs",
    slug: "ignite-v250-25000-puffs",
    brand: "Ignite",
    puffs: 25000,
    description: "Modelo de 25.000 puffs com autonomia alta e recarga rapida.",
    price: 150,
    images: [igniteV250Image],
    categoryId: "1",
    variations: [
      { id: "v250-1", name: "Melancia Ice", inStock: true },
      { id: "v250-2", name: "Morango Kiwi", inStock: true },
    ],
    tags: ["novo", "popular"],
    featured: false,
    createdAt: "2026-03-31",
    warrantyNote: "Garantia gratuita de 48 horas após a entrega.",
    shippingNote: "Entrega via Uber. Consulte cobertura da região e valor da logística.",
    visualTheme: {
      edition: "Digital Display",
      accent: "#23524b",
      accentSoft: "rgba(35, 82, 75, 0.12)",
      accentContrast: "#ffffff",
      background: "linear-gradient(180deg, #f7fffd 0%, #d7efe9 100%)",
      shadow: "0 28px 70px rgba(35, 82, 75, 0.16)",
    },
  },
  {
    id: "6",
    name: "Ignite V300 - 30.000 Puffs",
    slug: "ignite-v300-30000-puffs",
    brand: "Ignite",
    puffs: 30000,
    description: "Modelo de 30.000 puffs com autonomia maxima.",
    price: 180,
    images: [igniteV300Image],
    categoryId: "1",
    variations: [
      { id: "v300-1", name: "Morango Kiwi", inStock: true },
      { id: "v300-2", name: "Uva Ice", inStock: true },
      { id: "v300-3", name: "Melancia Ice", inStock: true },
      { id: "v300-4", name: "Melancia Dragon Fruit", inStock: true },
      { id: "v300-5", name: "Melancia Mix", inStock: true },
      { id: "v300-6", name: "Menta", inStock: true },
      { id: "v300-7", name: "Menta Ice", inStock: true },
      { id: "v300-8", name: "Morango Ice", inStock: true },
      { id: "v300-9", name: "Aloe Grape", inStock: true },
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
  {
    id: "7",
    name: "Ignite V400 - 40.000 Puffs",
    slug: "ignite-v400-40000-puffs",
    brand: "Ignite",
    puffs: 40000,
    description: "Modelo de 40.000 puffs com autonomia maxima da linha Ignite.",
    price: 200,
    images: [igniteV400Image],
    categoryId: "1",
    variations: [
      { id: "v400-1", name: "Manga Ice X Maracuja Goiaba", inStock: true },
      { id: "v400-2", name: "Maca Ice X Morango Melancia", inStock: true },
      { id: "v400-3", name: "Uva Ice X Morango", inStock: true },
      { id: "v400-4", name: "Uva Ice X Melancia Ice", inStock: true },
      { id: "v400-5", name: "Uva Pop X Pessego Ice", inStock: true },
      { id: "v400-6", name: "Melancia Ice X Cereja Ice", inStock: true },
      { id: "v400-7", name: "Pessego Melancia Ice X Manga Ice", inStock: true },
      { id: "v400-8", name: "Blueberry Ice X Framboesa Amora", inStock: true },
      { id: "v400-9", name: "Menta Ice X Pessego Uva", inStock: true },
      { id: "v400-10", name: "Triple Mango", inStock: true },
      { id: "v400-11", name: "Morango Maca Melancia", inStock: true },
      { id: "v400-12", name: "Morango Kiwi", inStock: true },
    ],
    tags: ["novo", "premium"],
    featured: true,
    createdAt: "2026-03-31",
    warrantyNote: "Garantia gratuita de 48 horas após a entrega.",
    shippingNote: "Entrega via Uber. Consulte cobertura da região e valor da logística.",
    visualTheme: {
      edition: "High Capacity",
      accent: "#2d343f",
      accentSoft: "rgba(45, 52, 63, 0.12)",
      accentContrast: "#ffffff",
      background: "linear-gradient(180deg, #f5f7fa 0%, #d4dbe3 100%)",
      shadow: "0 28px 70px rgba(45, 52, 63, 0.18)",
    },
  },
  {
    id: "8",
    name: "Elfbar BC 15K - 15.000 Puffs",
    slug: "elfbar-bc-15k-15000-puffs",
    brand: "Elfbar",
    puffs: 15000,
    description: "Modelo Elfbar BC 15K para quem busca um formato mais compacto.",
    price: 130,
    images: [elfbarBc15kImage],
    categoryId: "2",
    variations: [{ id: "bc15k-1", name: "Indisponível no momento", inStock: false }],
    tags: ["novo"],
    featured: false,
    createdAt: "2026-03-31",
    warrantyNote: "Garantia gratuita de 48 horas após a entrega.",
    shippingNote: "Entrega via Uber. Consulte cobertura da região e valor da logística.",
    visualTheme: {
      edition: "BC Edition",
      accent: "#1f4f3f",
      accentSoft: "rgba(31, 79, 63, 0.12)",
      accentContrast: "#ffffff",
      background: "linear-gradient(180deg, #f5fcf8 0%, #d8eee2 100%)",
      shadow: "0 28px 70px rgba(31, 79, 63, 0.14)",
    },
  },
  {
    id: "9",
    name: "Elfbar GH23K - 23.000 Puffs",
    slug: "elfbar-gh23k-23000-puffs",
    brand: "Elfbar",
    puffs: 23000,
    description: "Modelo Elfbar GH23K com longa autonomia, recarga e sabores variados.",
    price: 145,
    images: [elfbarGh23kImage],
    categoryId: "2",
    variations: [
      { id: "gh23k-1", name: "Pessego Manga Melancia", inStock: true },
      { id: "gh23k-2", name: "Uva Ice", inStock: true },
      { id: "gh23k-3", name: "Menta Ice", inStock: true },
      { id: "gh23k-4", name: "Morango Banana", inStock: true },
      { id: "gh23k-5", name: "Abacaxi Ameixa Limao Menta", inStock: true },
    ],
    tags: ["novo"],
    featured: false,
    createdAt: "2026-03-31",
    warrantyNote: "Garantia gratuita de 48 horas após a entrega.",
    shippingNote: "Entrega via Uber. Consulte cobertura da região e valor da logística.",
    visualTheme: {
      edition: "GH Series",
      accent: "#7d1d41",
      accentSoft: "rgba(125, 29, 65, 0.11)",
      accentContrast: "#ffffff",
      background: "linear-gradient(180deg, #fff8fb 0%, #f7d8e4 100%)",
      shadow: "0 28px 70px rgba(125, 29, 65, 0.14)",
    },
  },
  {
    id: "10",
    name: "Elfbar 40K Trio - 40.000 Puffs",
    slug: "elfbar-40k-trio-40000-puffs",
    brand: "Elfbar",
    puffs: 40000,
    description: "Modelo Elfbar 40K Trio com alto rendimento para pedido.",
    price: 195,
    images: [elfbar40kTrioImage],
    categoryId: "2",
    variations: [{ id: "40ktrio-1", name: "Indisponível no momento", inStock: false }],
    tags: ["novo", "premium"],
    featured: true,
    createdAt: "2026-03-31",
    warrantyNote: "Garantia gratuita de 48 horas após a entrega.",
    shippingNote: "Entrega via Uber. Consulte cobertura da região e valor da logística.",
    visualTheme: {
      edition: "Trio Edition",
      accent: "#5d2f91",
      accentSoft: "rgba(93, 47, 145, 0.11)",
      accentContrast: "#ffffff",
      background: "linear-gradient(180deg, #faf8ff 0%, #e2d6ff 100%)",
      shadow: "0 28px 70px rgba(93, 47, 145, 0.15)",
    },
  },
  {
    id: "11",
    name: "Elfbar 40K Ice King - 40.000 Puffs",
    slug: "elfbar-40k-ice-king-40000-puffs",
    brand: "Elfbar",
    puffs: 40000,
    description: "Modelo Elfbar 40K Ice King com proposta gelada e alta autonomia.",
    price: 198,
    images: [elfbar40kIceKingImage],
    categoryId: "2",
    variations: [{ id: "40kice-1", name: "Indisponível no momento", inStock: false }],
    tags: ["novo", "premium"],
    featured: false,
    createdAt: "2026-03-31",
    warrantyNote: "Garantia gratuita de 48 horas após a entrega.",
    shippingNote: "Entrega via Uber. Consulte cobertura da região e valor da logística.",
    visualTheme: {
      edition: "Ice King",
      accent: "#216b8e",
      accentSoft: "rgba(33, 107, 142, 0.12)",
      accentContrast: "#ffffff",
      background: "linear-gradient(180deg, #f5fcff 0%, #d6eef7 100%)",
      shadow: "0 28px 70px rgba(33, 107, 142, 0.14)",
    },
  },
  {
    id: "12",
    name: "Elfbar 45K Pro - 45.000 Puffs",
    slug: "elfbar-45k-pro-45000-puffs",
    brand: "Elfbar",
    puffs: 45000,
    description: "Modelo Elfbar 45K Pro com autonomia estendida e visual premium.",
    price: 210,
    images: [elfbar45kProImage],
    categoryId: "2",
    variations: [{ id: "45kpro-1", name: "Indisponível no momento", inStock: false }],
    tags: ["novo", "premium"],
    featured: false,
    createdAt: "2026-03-31",
    warrantyNote: "Garantia gratuita de 48 horas após a entrega.",
    shippingNote: "Entrega via Uber. Consulte cobertura da região e valor da logística.",
    visualTheme: {
      edition: "Pro Edition",
      accent: "#b65f1f",
      accentSoft: "rgba(182, 95, 31, 0.11)",
      accentContrast: "#ffffff",
      background: "linear-gradient(180deg, #fffaf5 0%, #f6dfcb 100%)",
      shadow: "0 28px 70px rgba(182, 95, 31, 0.15)",
    },
  },
  {
    id: "13",
    name: "Oxbar 35K - 35.000 Puffs",
    slug: "oxbar-35k-35000-puffs",
    brand: "Oxbar",
    puffs: 35000,
    description: "Modelo Oxbar 35K com alto rendimento e pedido via WhatsApp.",
    price: 185,
    images: [oxbar35kImage],
    categoryId: "3",
    variations: [{ id: "ox35k-1", name: "Indisponível no momento", inStock: false }],
    tags: ["novo"],
    featured: false,
    createdAt: "2026-03-31",
    warrantyNote: "Garantia gratuita de 48 horas após a entrega.",
    shippingNote: "Entrega via Uber. Consulte cobertura da região e valor da logística.",
    visualTheme: {
      edition: "Performance",
      accent: "#4f3b21",
      accentSoft: "rgba(79, 59, 33, 0.12)",
      accentContrast: "#ffffff",
      background: "linear-gradient(180deg, #fdf9f4 0%, #efe1cf 100%)",
      shadow: "0 28px 70px rgba(79, 59, 33, 0.15)",
    },
  },
  {
    id: "14",
    name: "Oxbar 50K - 50.000 Puffs",
    slug: "oxbar-50k-50000-puffs",
    brand: "Oxbar",
    puffs: 50000,
    description: "Modelo Oxbar 50K com a maior autonomia desta rodada do catálogo.",
    price: 220,
    images: [oxbar50kImage],
    categoryId: "3",
    variations: [{ id: "ox50k-1", name: "Indisponível no momento", inStock: false }],
    tags: ["novo", "premium"],
    featured: true,
    createdAt: "2026-03-31",
    warrantyNote: "Garantia gratuita de 48 horas após a entrega.",
    shippingNote: "Entrega via Uber. Consulte cobertura da região e valor da logística.",
    visualTheme: {
      edition: "Max Capacity",
      accent: "#3f2a6b",
      accentSoft: "rgba(63, 42, 107, 0.12)",
      accentContrast: "#ffffff",
      background: "linear-gradient(180deg, #faf7ff 0%, #e2d9f6 100%)",
      shadow: "0 28px 70px rgba(63, 42, 107, 0.15)",
    },
  },
];

export function getProductsByTag(tag: string): Product[] {
  return products.filter((product) => product.tags.includes(tag));
}

export function hasAvailableVariations(product: Product): boolean {
  return product.variations.some((variation) => variation.inStock);
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

