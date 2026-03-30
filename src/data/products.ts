export interface ProductVariation {
  id: string;
  name: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  promoPrice?: number;
  images: string[];
  categoryId: string;
  variations: ProductVariation[];
  tags: string[]; // 'new', 'bestseller', 'promo'
  featured: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
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

export const WHATSAPP_NUMBER = "5511999999999"; // Configure aqui

export const categories: Category[] = [
  { id: "1", name: "Pods Descartáveis", slug: "pods-descartaveis", icon: "Zap", order: 1 },
  { id: "2", name: "Pods Recarregáveis", slug: "pods-recarregaveis", icon: "Battery", order: 2 },
  { id: "3", name: "Essências", slug: "essencias", icon: "Droplets", order: 3 },
  { id: "4", name: "Acessórios", slug: "acessorios", icon: "Settings", order: 4 },
  { id: "5", name: "Lançamentos", slug: "lancamentos", icon: "Sparkles", order: 5 },
  { id: "6", name: "Promoções", slug: "promocoes", icon: "Percent", order: 6 },
];

export const banners: Banner[] = [
  {
    id: "1",
    title: "MEGA PROMOÇÃO",
    subtitle: "Pods descartáveis a partir de R$ 39,90",
    image: "",
    ctaText: "Ver Ofertas",
    ctaLink: "/categoria/promocoes",
    active: true,
  },
  {
    id: "2",
    title: "LANÇAMENTO",
    subtitle: "Novos sabores chegaram! Confira a coleção",
    image: "",
    ctaText: "Explorar",
    ctaLink: "/categoria/lancamentos",
    active: true,
  },
  {
    id: "3",
    title: "FRETE GRÁTIS",
    subtitle: "Em compras acima de R$ 150",
    image: "",
    ctaText: "Comprar Agora",
    ctaLink: "/categoria/pods-descartaveis",
    active: true,
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Ignite V80 10000 Puffs",
    slug: "ignite-v80-10000-puffs",
    description: "Pod descartável com 10.000 puffs, bateria recarregável e design premium. Sabores intensos e vapor consistente do início ao fim.",
    price: 89.90,
    promoPrice: 69.90,
    images: ["/placeholder.svg"],
    categoryId: "1",
    variations: [
      { id: "v1", name: "Morango Ice", inStock: true },
      { id: "v2", name: "Manga Ice", inStock: true },
      { id: "v3", name: "Uva Ice", inStock: true },
      { id: "v4", name: "Menta", inStock: false },
      { id: "v5", name: "Melancia Ice", inStock: true },
    ],
    tags: ["bestseller", "promo"],
    featured: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Elfbar BC5000",
    slug: "elfbar-bc5000",
    description: "O famoso Elfbar com 5000 puffs, design compacto e recarga USB-C. Perfeito para o dia a dia.",
    price: 59.90,
    promoPrice: undefined,
    images: ["/placeholder.svg"],
    categoryId: "1",
    variations: [
      { id: "v1", name: "Blue Razz Ice", inStock: true },
      { id: "v2", name: "Strawberry Mango", inStock: true },
      { id: "v3", name: "Watermelon Ice", inStock: true },
    ],
    tags: ["bestseller"],
    featured: true,
    createdAt: "2024-02-01",
  },
  {
    id: "3",
    name: "Lost Mary MO5000",
    slug: "lost-mary-mo5000",
    description: "Pod descartável premium com mesh coil para sabor mais puro e intenso. 5000 puffs de puro prazer.",
    price: 64.90,
    promoPrice: 49.90,
    images: ["/placeholder.svg"],
    categoryId: "1",
    variations: [
      { id: "v1", name: "Triple Berry", inStock: true },
      { id: "v2", name: "Pineapple Coconut", inStock: true },
      { id: "v3", name: "Cherry Peach", inStock: true },
      { id: "v4", name: "Grape Jelly", inStock: true },
    ],
    tags: ["new", "promo"],
    featured: true,
    createdAt: "2024-03-01",
  },
  {
    id: "4",
    name: "OXBAR G8000",
    slug: "oxbar-g8000",
    description: "8000 puffs com tela LED indicadora de bateria e líquido. Design ergonômico e sabores exclusivos.",
    price: 79.90,
    promoPrice: undefined,
    images: ["/placeholder.svg"],
    categoryId: "1",
    variations: [
      { id: "v1", name: "Lush Ice", inStock: true },
      { id: "v2", name: "Peach Mango", inStock: true },
      { id: "v3", name: "Cool Mint", inStock: true },
    ],
    tags: ["new"],
    featured: true,
    createdAt: "2024-03-10",
  },
  {
    id: "5",
    name: "Pod Recarregável SMOK Nord 5",
    slug: "smok-nord-5",
    description: "Kit pod recarregável com potência ajustável e coils substituíveis. Ideal para quem quer personalização.",
    price: 149.90,
    promoPrice: 129.90,
    images: ["/placeholder.svg"],
    categoryId: "2",
    variations: [
      { id: "v1", name: "Preto", inStock: true },
      { id: "v2", name: "Prata", inStock: true },
      { id: "v3", name: "Azul", inStock: true },
    ],
    tags: ["promo"],
    featured: false,
    createdAt: "2024-02-15",
  },
  {
    id: "6",
    name: "Juice Salt Nic 30ml",
    slug: "juice-salt-nic-30ml",
    description: "Essência salt nicotine 35mg em diversos sabores. Compatível com pods recarregáveis.",
    price: 39.90,
    promoPrice: undefined,
    images: ["/placeholder.svg"],
    categoryId: "3",
    variations: [
      { id: "v1", name: "Tobacco", inStock: true },
      { id: "v2", name: "Menthol", inStock: true },
      { id: "v3", name: "Strawberry Cream", inStock: true },
      { id: "v4", name: "Mango Tango", inStock: true },
    ],
    tags: [],
    featured: false,
    createdAt: "2024-01-20",
  },
  {
    id: "7",
    name: "Carregador USB-C Magnético",
    slug: "carregador-usb-c-magnetico",
    description: "Carregador universal USB-C com conexão magnética para pods. Carregamento rápido e seguro.",
    price: 29.90,
    promoPrice: 19.90,
    images: ["/placeholder.svg"],
    categoryId: "4",
    variations: [],
    tags: ["promo"],
    featured: false,
    createdAt: "2024-02-20",
  },
  {
    id: "8",
    name: "Waka SoMatch MB6000",
    slug: "waka-somatch-mb6000",
    description: "Pod com design único estilo isqueiro, 6000 puffs e flavor boost technology.",
    price: 74.90,
    promoPrice: 59.90,
    images: ["/placeholder.svg"],
    categoryId: "1",
    variations: [
      { id: "v1", name: "Double Apple", inStock: true },
      { id: "v2", name: "Blueberry Raspberry", inStock: true },
      { id: "v3", name: "Kiwi Passion Guava", inStock: true },
    ],
    tags: ["bestseller", "promo"],
    featured: true,
    createdAt: "2024-03-05",
  },
];

export function getProductsByTag(tag: string): Product[] {
  return products.filter((p) => p.tags.includes(tag));
}

export function getProductsByCategory(categorySlug: string): Product[] {
  const cat = categories.find((c) => c.slug === categorySlug);
  if (!cat) return [];
  if (categorySlug === "promocoes") return products.filter((p) => p.promoPrice);
  if (categorySlug === "lancamentos") return products.filter((p) => p.tags.includes("new"));
  return products.filter((p) => p.categoryId === cat.id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.variations.some((v) => v.name.toLowerCase().includes(q))
  );
}

export function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function buildWhatsAppLink(product: Product, variation?: string, quantity = 1): string {
  const lines = [
    `Olá! Tenho interesse em comprar:`,
    ``,
    `🛒 *${product.name}*`,
    variation ? `📋 Sabor/Variação: ${variation}` : "",
    `📦 Quantidade: ${quantity}`,
    product.promoPrice
      ? `💰 Preço: ${formatPrice(product.promoPrice)}`
      : `💰 Preço: ${formatPrice(product.price)}`,
    ``,
    `Poderia me ajudar a finalizar o pedido?`,
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
}
