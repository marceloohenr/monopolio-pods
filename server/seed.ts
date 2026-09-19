import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { config } from "./config.js";
import type { AppDatabase } from "./db.js";

interface SeedCatalog {
  categories: Array<{ id: string; name: string; slug: string; icon: string; order: number; description: string }>;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    brand: string;
    puffs: number;
    description: string;
    price: number;
    promoPrice?: number;
    sourceImages: string[];
    categoryId: string;
    variations: Array<{ id: string; name: string; inStock: boolean }>;
    tags: string[];
    featured: boolean;
    createdAt: string;
    warrantyNote: string;
    shippingNote: string;
    visualTheme: Record<string, string>;
  }>;
}

export async function seedCatalog(database: AppDatabase) {
  const existing = database.prepare("SELECT COUNT(*) AS count FROM products").get() as { count: number };
  if (existing.count > 0) return { seeded: false, count: existing.count };

  const catalog = JSON.parse(await fs.readFile(config.seedPath, "utf8")) as SeedCatalog;
  if (catalog.products.length !== 14) throw new Error("The initial catalog must contain exactly 14 products.");
  await fs.mkdir(config.uploadDirectory, { recursive: true });

  const preparedImages: Array<{
    id: string;
    productId: string;
    publicPath: string;
    width: number;
    height: number;
    sortOrder: number;
  }> = [];

  for (const product of catalog.products) {
    for (const [index, sourceImage] of product.sourceImages.entries()) {
      const sourcePath = path.join(config.projectRoot, sourceImage);
      const filename = `${product.slug}-${index + 1}-${randomUUID().slice(0, 8)}.webp`;
      const outputPath = path.join(config.uploadDirectory, filename);
      const result = await sharp(sourcePath)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 88 })
        .toFile(outputPath);
      preparedImages.push({
        id: randomUUID(),
        productId: product.id,
        publicPath: `/media/products/${filename}`,
        width: result.width,
        height: result.height,
        sortOrder: index,
      });
    }
  }

  const now = new Date().toISOString();
  database.transaction(() => {
    const insertCategory = database.prepare(`
      INSERT INTO categories (id, name, slug, icon, sort_order, description)
      VALUES (@id, @name, @slug, @icon, @order, @description)
    `);
    catalog.categories.forEach((category) => insertCategory.run(category));

    const insertProduct = database.prepare(`
      INSERT INTO products (
        id, name, slug, brand, puffs, description, price_cents, promo_price_cents,
        category_id, tags_json, featured, is_available, warranty_note, shipping_note,
        visual_theme_json, created_at, updated_at
      ) VALUES (
        @id, @name, @slug, @brand, @puffs, @description, @priceCents, @promoPriceCents,
        @categoryId, @tagsJson, @featured, @isAvailable, @warrantyNote, @shippingNote,
        @visualThemeJson, @createdAt, @updatedAt
      )
    `);
    const insertVariation = database.prepare(`
      INSERT INTO product_variations (id, product_id, name, is_available, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);
    const insertImage = database.prepare(`
      INSERT INTO product_images (id, product_id, path, mime_type, width, height, sort_order, is_primary, created_at)
      VALUES (@id, @productId, @publicPath, 'image/webp', @width, @height, @sortOrder, @isPrimary, @createdAt)
    `);

    catalog.products.forEach((product) => {
      const variations = product.variations.filter((variation) => variation.name !== "Indisponível no momento");
      const isAvailable = variations.some((variation) => variation.inStock);
      insertProduct.run({
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        puffs: product.puffs,
        description: product.description,
        priceCents: Math.round(product.price * 100),
        promoPriceCents: product.promoPrice == null ? null : Math.round(product.promoPrice * 100),
        categoryId: product.categoryId,
        tagsJson: JSON.stringify(product.tags),
        featured: Number(product.featured),
        isAvailable: Number(isAvailable),
        warrantyNote: product.warrantyNote,
        shippingNote: product.shippingNote,
        visualThemeJson: JSON.stringify(product.visualTheme),
        createdAt: product.createdAt,
        updatedAt: now,
      });
      variations.forEach((variation, index) =>
        insertVariation.run(variation.id, product.id, variation.name, Number(variation.inStock), index),
      );
    });

    preparedImages.forEach((image) =>
      insertImage.run({ ...image, isPrimary: Number(image.sortOrder === 0), createdAt: now }),
    );
  })();

  return { seeded: true, count: catalog.products.length };
}
