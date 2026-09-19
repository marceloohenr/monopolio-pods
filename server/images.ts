import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import type { AppDatabase } from "./db.js";
import { config } from "./config.js";
import { getProduct } from "./catalog.js";

export async function processImage(file: Express.Multer.File) {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
    throw new Error("INVALID_IMAGE");
  }
  await fs.mkdir(config.uploadDirectory, { recursive: true });
  const filename = `${randomUUID()}.webp`;
  const absolutePath = path.join(config.uploadDirectory, filename);
  try {
    const result = await sharp(file.buffer)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88 })
      .toFile(absolutePath);
    return {
      absolutePath,
      publicPath: `/media/products/${filename}`,
      width: result.width,
      height: result.height,
    };
  } catch {
    await fs.rm(absolutePath, { force: true });
    throw new Error("INVALID_IMAGE");
  }
}

export async function addImage(database: AppDatabase, productId: string, file: Express.Multer.File) {
  const product = getProduct(database, productId);
  if (!product) return null;
  const processed = await processImage(file);
  const count = product.imageRecords.length;
  const id = randomUUID();
  database.prepare(`
    INSERT INTO product_images (id, product_id, path, mime_type, width, height, sort_order, is_primary, created_at)
    VALUES (?, ?, ?, 'image/webp', ?, ?, ?, ?, ?)
  `).run(id, productId, processed.publicPath, processed.width, processed.height, count, Number(count === 0), new Date().toISOString());
  return { before: product, after: getProduct(database, productId)! };
}

export async function replaceImage(
  database: AppDatabase,
  productId: string,
  imageId: string,
  file: Express.Multer.File,
) {
  const product = getProduct(database, productId);
  const current = database.prepare("SELECT path FROM product_images WHERE id = ? AND product_id = ?").get(
    imageId,
    productId,
  ) as { path: string } | undefined;
  if (!product || !current) return null;
  const processed = await processImage(file);
  database.prepare(`
    UPDATE product_images SET path = ?, mime_type = 'image/webp', width = ?, height = ? WHERE id = ?
  `).run(processed.publicPath, processed.width, processed.height, imageId);
  await removeStoredFile(current.path);
  return { before: product, after: getProduct(database, productId)! };
}

export async function removeImage(database: AppDatabase, productId: string, imageId: string) {
  const product = getProduct(database, productId);
  if (!product) return { error: "not_found" as const };
  if (product.imageRecords.length <= 1) return { error: "last_image" as const };
  const image = product.imageRecords.find((entry) => entry.id === imageId);
  if (!image) return { error: "not_found" as const };

  database.transaction(() => {
    database.prepare("DELETE FROM product_images WHERE id = ? AND product_id = ?").run(imageId, productId);
    if (image.isPrimary) {
      const next = database.prepare(`
        SELECT id FROM product_images WHERE product_id = ? ORDER BY sort_order, id LIMIT 1
      `).get(productId) as { id: string };
      database.prepare("UPDATE product_images SET is_primary = 1 WHERE id = ?").run(next.id);
    }
  })();
  await removeStoredFile(image.path);
  return { before: product, after: getProduct(database, productId)! };
}

export function setPrimaryImage(database: AppDatabase, productId: string, imageId: string) {
  const before = getProduct(database, productId);
  if (!before || !before.imageRecords.some((image) => image.id === imageId)) return null;
  database.transaction(() => {
    database.prepare("UPDATE product_images SET is_primary = 0 WHERE product_id = ?").run(productId);
    database.prepare("UPDATE product_images SET is_primary = 1 WHERE id = ? AND product_id = ?").run(imageId, productId);
  })();
  return { before, after: getProduct(database, productId)! };
}

export function reorderImages(database: AppDatabase, productId: string, imageIds: string[]) {
  const before = getProduct(database, productId);
  if (!before) return null;
  const currentIds = before.imageRecords.map((image) => image.id).sort();
  if (currentIds.join("|") !== [...imageIds].sort().join("|")) throw new Error("INVALID_IMAGE_ORDER");
  const update = database.prepare("UPDATE product_images SET sort_order = ? WHERE id = ? AND product_id = ?");
  database.transaction(() => imageIds.forEach((id, index) => update.run(index, id, productId)))();
  return { before, after: getProduct(database, productId)! };
}

async function removeStoredFile(publicPath: string) {
  const filename = path.basename(publicPath);
  await fs.rm(path.join(config.uploadDirectory, filename), { force: true });
}

