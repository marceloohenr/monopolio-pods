import { randomUUID } from "node:crypto";
import type { AppDatabase } from "./db.js";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  brand: string;
  puffs: number;
  description: string;
  price_cents: number;
  promo_price_cents: number | null;
  category_id: string;
  tags_json: string;
  featured: number;
  is_available: number;
  warranty_note: string;
  shipping_note: string;
  visual_theme_json: string;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  brand: string;
  categoryId: string;
  puffs: number;
  description: string;
  priceCents: number;
  variations: Array<{ id?: string; name: string; isAvailable: boolean }>;
}

const fallbackTheme = {
  edition: "Catálogo Monopólio",
  accent: "#20252d",
  accentSoft: "rgba(32, 37, 45, 0.10)",
  accentContrast: "#ffffff",
  background: "linear-gradient(180deg, #ffffff 0%, #eef1f4 100%)",
  shadow: "0 28px 70px rgba(32, 37, 45, 0.14)",
};

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function uniqueSlug(database: AppDatabase, name: string) {
  const base = slugify(name) || `produto-${Date.now()}`;
  let slug = base;
  let suffix = 2;
  while (database.prepare("SELECT 1 FROM products WHERE slug = ?").get(slug)) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

export function listCategories(database: AppDatabase) {
  return database
    .prepare("SELECT id, name, slug, icon, sort_order AS 'order', description FROM categories ORDER BY sort_order")
    .all();
}

export function getProduct(database: AppDatabase, id: string) {
  const row = database.prepare("SELECT * FROM products WHERE id = ?").get(id) as ProductRow | undefined;
  return row ? hydrateProduct(database, row) : null;
}

export function getProductBySlug(database: AppDatabase, slug: string) {
  const row = database.prepare("SELECT * FROM products WHERE slug = ?").get(slug) as ProductRow | undefined;
  return row ? hydrateProduct(database, row) : null;
}

export function listProducts(database: AppDatabase, options?: { publicOnly?: boolean }) {
  const where = options?.publicOnly
    ? "WHERE EXISTS (SELECT 1 FROM product_images image WHERE image.product_id = products.id)"
    : "";
  const rows = database.prepare(`SELECT * FROM products ${where} ORDER BY created_at, name`).all() as ProductRow[];
  return rows.map((row) => hydrateProduct(database, row));
}

function hydrateProduct(database: AppDatabase, row: ProductRow) {
  const variations = database
    .prepare(`
      SELECT id, name, is_available AS isAvailable
      FROM product_variations WHERE product_id = ? ORDER BY sort_order, id
    `)
    .all(row.id)
    .map((variation) => ({
      ...(variation as { id: string; name: string; isAvailable: number }),
      inStock: Boolean((variation as { isAvailable: number }).isAvailable),
      isAvailable: Boolean((variation as { isAvailable: number }).isAvailable),
    }));
  const imageRecords = database
    .prepare(`
      SELECT id, path, mime_type AS mimeType, width, height, sort_order AS sortOrder,
             is_primary AS isPrimary
      FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order, id
    `)
    .all(row.id)
    .map((image) => ({
      ...(image as Record<string, unknown>),
      isPrimary: Boolean((image as { isPrimary: number }).isPrimary),
    })) as Array<{ id: string; path: string; isPrimary: boolean; sortOrder: number }>;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    puffs: row.puffs,
    description: row.description,
    price: row.price_cents / 100,
    priceCents: row.price_cents,
    promoPrice: row.promo_price_cents == null ? undefined : row.promo_price_cents / 100,
    images: imageRecords.map((image) => image.path),
    imageRecords,
    categoryId: row.category_id,
    variations,
    tags: JSON.parse(row.tags_json) as string[],
    featured: Boolean(row.featured),
    isAvailable: Boolean(row.is_available),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    warrantyNote: row.warranty_note,
    shippingNote: row.shipping_note,
    visualTheme: { ...fallbackTheme, ...(JSON.parse(row.visual_theme_json) as Record<string, string>) },
  };
}

export function createProduct(database: AppDatabase, input: ProductInput) {
  const now = new Date().toISOString();
  const id = randomUUID();
  database.transaction(() => {
    database.prepare(`
      INSERT INTO products (
        id, name, slug, brand, puffs, description, price_cents, category_id, tags_json,
        featured, is_available, warranty_note, shipping_note, visual_theme_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', 0, 0, ?, ?, ?, ?, ?)
    `).run(
      id,
      input.name,
      uniqueSlug(database, input.name),
      input.brand,
      input.puffs,
      input.description,
      input.priceCents,
      input.categoryId,
      "Garantia gratuita de 48 horas após a entrega.",
      "Entrega via Uber. Consulte cobertura da região e valor da logística.",
      JSON.stringify(fallbackTheme),
      now,
      now,
    );
    replaceVariations(database, id, input.variations);
  })();
  return getProduct(database, id)!;
}

export function updateProduct(database: AppDatabase, id: string, input: ProductInput) {
  const before = getProduct(database, id);
  if (!before) return null;
  database.transaction(() => {
    database.prepare(`
      UPDATE products SET name = ?, brand = ?, category_id = ?, puffs = ?, description = ?,
        price_cents = ?, updated_at = ? WHERE id = ?
    `).run(
      input.name,
      input.brand,
      input.categoryId,
      input.puffs,
      input.description,
      input.priceCents,
      new Date().toISOString(),
      id,
    );
    replaceVariations(database, id, input.variations);
    if (!input.variations.some((variation) => variation.isAvailable)) {
      database.prepare("UPDATE products SET is_available = 0 WHERE id = ?").run(id);
    }
  })();
  return { before, after: getProduct(database, id)! };
}

function replaceVariations(
  database: AppDatabase,
  productId: string,
  variations: ProductInput["variations"],
) {
  database.prepare("DELETE FROM product_variations WHERE product_id = ?").run(productId);
  const insert = database.prepare(`
    INSERT INTO product_variations (id, product_id, name, is_available, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);
  variations.forEach((variation, index) =>
    insert.run(variation.id || randomUUID(), productId, variation.name, Number(variation.isAvailable), index),
  );
}

export function setProductAvailability(database: AppDatabase, id: string, isAvailable: boolean) {
  const product = getProduct(database, id);
  if (!product) return { error: "not_found" as const };
  if (isAvailable && product.imageRecords.length === 0) return { error: "image_required" as const };
  if (isAvailable && !product.variations.some((variation) => variation.isAvailable)) {
    return { error: "variation_required" as const };
  }
  database.prepare("UPDATE products SET is_available = ?, updated_at = ? WHERE id = ?").run(
    Number(isAvailable),
    new Date().toISOString(),
    id,
  );
  return { before: product, after: getProduct(database, id)! };
}
