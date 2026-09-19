import fs from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

const root = process.cwd();
const outputDirectory = path.join(root, "server", "seed");
const outputPath = path.join(outputDirectory, "catalog.json");

const vite = await createServer({
  appType: "custom",
  server: { middlewareMode: true },
});

try {
  const catalog = await vite.ssrLoadModule("/src/data/products.ts");
  const products = catalog.products.map((product) => ({
    ...product,
    sourceImages: product.images.map((image) => image.replace(/^\//, "")),
    images: undefined,
  }));

  if (products.length !== 14) {
    throw new Error(`Expected 14 products, received ${products.length}.`);
  }

  await fs.mkdir(outputDirectory, { recursive: true });
  await fs.writeFile(
    outputPath,
    `${JSON.stringify({ categories: catalog.categories, products }, null, 2)}\n`,
    "utf8",
  );
  console.log(`Catalog seed exported to ${path.relative(root, outputPath)}.`);
} finally {
  await vite.close();
}
