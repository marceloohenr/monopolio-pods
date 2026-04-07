import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");
const iconsDir = path.join(publicDir, "icons");
const sourcePath = path.join(rootDir, "src", "data", "products.ts");
const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || "https://monopoliopods.vercel.app").replace(
  /\/+$/,
  "",
);

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getSection(source, startMarker, endMarker) {
  const startIndex = source.indexOf(startMarker);
  const endIndex = source.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return "";
  }

  return source.slice(startIndex, endIndex);
}

function extractCategorySlugs(source) {
  const categorySection = getSection(source, "export const categories", "export const banners");
  return [...categorySection.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
}

function extractProductEntries(source) {
  const productSection = getSection(source, "export const products", "export function getProductsByTag");

  return [...productSection.matchAll(/slug:\s*"([^"]+)"[\s\S]*?createdAt:\s*"([^"]+)"/g)].map((match) => ({
    slug: match[1],
    createdAt: match[2],
  }));
}

async function ensureDirectories() {
  await fs.mkdir(publicDir, { recursive: true });
  await fs.mkdir(iconsDir, { recursive: true });
}

async function generateIcons() {
  const logoPath = path.join(rootDir, "src", "assets", "monopolio-logo.jpg");

  await Promise.all([
    sharp(logoPath).resize(192, 192, { fit: "cover", position: "center" }).png().toFile(path.join(iconsDir, "icon-192.png")),
    sharp(logoPath).resize(512, 512, { fit: "cover", position: "center" }).png().toFile(path.join(iconsDir, "icon-512.png")),
    sharp(logoPath)
      .resize(180, 180, { fit: "cover", position: "center" })
      .png()
      .toFile(path.join(publicDir, "apple-touch-icon.png")),
    sharp(logoPath)
      .resize(32, 32, { fit: "cover", position: "center" })
      .png()
      .toFile(path.join(publicDir, "favicon-32x32.png")),
    sharp(logoPath)
      .resize(16, 16, { fit: "cover", position: "center" })
      .png()
      .toFile(path.join(publicDir, "favicon-16x16.png")),
  ]);
}

async function generateSocialPreview() {
  const canvasWidth = 1200;
  const canvasHeight = 630;
  const logoPath = path.join(rootDir, "src", "assets", "monopolio-logo.jpg");
  const productPaths = [
    path.join(rootDir, "src", "assets", "products", "ignite-v155-device.png"),
    path.join(rootDir, "src", "assets", "products", "elfbar-gh23k.png"),
    path.join(rootDir, "src", "assets", "products", "oxbar-50k.webp"),
  ];

  const [logo, ...products] = await Promise.all([
    sharp(logoPath).resize(110, 110, { fit: "cover", position: "center" }).jpeg({ quality: 92 }).toBuffer(),
    ...productPaths.map((filePath, index) =>
      sharp(filePath)
        .resize(index === 1 ? 280 : 240, 420, { fit: "contain" })
        .png()
        .toBuffer(),
    ),
  ]);

  const backgroundSvg = Buffer.from(`
    <svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f1013" />
          <stop offset="55%" stop-color="#17191f" />
          <stop offset="100%" stop-color="#20232b" />
        </linearGradient>
        <radialGradient id="glow" cx="18%" cy="18%" r="60%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.16)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="${canvasWidth}" height="${canvasHeight}" rx="36" fill="url(#bg)" />
      <rect width="${canvasWidth}" height="${canvasHeight}" rx="36" fill="url(#glow)" />
      <rect x="66" y="72" width="122" height="122" rx="30" fill="rgba(255,255,255,0.08)" />
      <text x="220" y="116" fill="#f5f1e8" font-size="68" font-weight="800" font-family="Arial, sans-serif">Monopolio Pods</text>
      <text x="220" y="174" fill="#d9d2c4" font-size="28" font-weight="600" font-family="Arial, sans-serif">Pods em Recife e Olinda com entrega rapida</text>
      <text x="80" y="290" fill="#ffffff" font-size="76" font-weight="800" font-family="Arial, sans-serif">Ignite, Elfbar e Oxbar</text>
      <text x="80" y="350" fill="#cfd4dc" font-size="30" font-weight="500" font-family="Arial, sans-serif">Catalogo atualizado, compra no WhatsApp, frete regional e garantia de 48h.</text>
      <rect x="80" y="404" width="220" height="52" rx="26" fill="#ffffff" fill-opacity="0.1" />
      <rect x="318" y="404" width="206" height="52" rx="26" fill="#ffffff" fill-opacity="0.1" />
      <rect x="542" y="404" width="188" height="52" rx="26" fill="#ffffff" fill-opacity="0.1" />
      <text x="112" y="438" fill="#f8f8f8" font-size="24" font-weight="700" font-family="Arial, sans-serif">Comprar pods Recife</text>
      <text x="350" y="438" fill="#f8f8f8" font-size="24" font-weight="700" font-family="Arial, sans-serif">Entrega em Olinda</text>
      <text x="574" y="438" fill="#f8f8f8" font-size="24" font-weight="700" font-family="Arial, sans-serif">WhatsApp</text>
    </svg>
  `);

  await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: "#0f1013",
    },
  })
    .composite([
      { input: backgroundSvg, top: 0, left: 0 },
      { input: logo, top: 78, left: 72 },
      { input: products[0], top: 160, left: 790 },
      { input: products[1], top: 120, left: 905 },
      { input: products[2], top: 220, left: 1010 },
    ])
    .jpeg({ quality: 92, progressive: true })
    .toFile(path.join(publicDir, "og-catalogo-monopolio-pods.jpg"));
}

async function generateManifest() {
  const manifest = {
    name: "Monopolio Pods",
    short_name: "Monopolio",
    description:
      "Catalogo de pods em Recife e Olinda com modelos Ignite, Elfbar e Oxbar, entrega regional e pedido no WhatsApp.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f1e8",
    theme_color: "#111318",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  await fs.writeFile(path.join(publicDir, "site.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function generateRobotsTxt() {
  const host = new URL(siteUrl).host;
  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Host: ${host}
`;

  await fs.writeFile(path.join(publicDir, "robots.txt"), robots, "utf8");
}

async function generateSitemap() {
  const source = await fs.readFile(sourcePath, "utf8");
  const categorySlugs = extractCategorySlugs(source);
  const productEntries = extractProductEntries(source);
  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    { path: "/", priority: "1.0", changefreq: "daily", lastmod: today },
    ...categorySlugs.map((slug) => ({
      path: `/categoria/${slug}`,
      priority: "0.8",
      changefreq: "weekly",
      lastmod: today,
    })),
    ...productEntries.map((product) => ({
      path: `/produto/${product.slug}`,
      priority: "0.7",
      changefreq: "weekly",
      lastmod: product.createdAt || today,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(`${siteUrl}${entry.path}`)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  await fs.writeFile(path.join(publicDir, "sitemap.xml"), xml, "utf8");
}

await ensureDirectories();
await generateIcons();
await generateSocialPreview();
await generateManifest();
await generateRobotsTxt();
await generateSitemap();

console.log("SEO assets generated successfully.");
