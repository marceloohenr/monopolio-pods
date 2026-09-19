import path from "node:path";
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import multer from "multer";
import argon2 from "argon2";
import { z } from "zod";
import { config } from "./config.js";
import type { AppDatabase } from "./db.js";
import {
  audit,
  cookieOptions,
  createSession,
  isLoginBlocked,
  recordLoginAttempt,
  requireCsrf,
  sessionMiddleware,
  verifyCredentials,
} from "./auth.js";
import {
  createProduct,
  getProduct,
  getProductBySlug,
  listCategories,
  listProducts,
  setProductAvailability,
  updateProduct,
} from "./catalog.js";
import { addImage, removeImage, reorderImages, replaceImage, setPrimaryImage } from "./images.js";

const loginSchema = z.object({ email: z.string().email().max(160), password: z.string().min(1).max(300) });
const variationSchema = z.object({
  id: z.string().min(1).max(100).optional(),
  name: z.string().trim().min(1).max(100),
  isAvailable: z.boolean(),
});
const productSchema = z.object({
  name: z.string().trim().min(2).max(140),
  brand: z.string().trim().min(1).max(80),
  categoryId: z.string().min(1).max(80),
  puffs: z.number().int().min(0).max(1_000_000),
  description: z.string().trim().min(3).max(2000),
  priceCents: z.number().int().min(0).max(100_000_000),
  variations: z.array(variationSchema).max(100),
});
const passwordSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(12).max(200) });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});

export function createApp(database: AppDatabase) {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'", "https://viacep.com.br", "https://www.google-analytics.com"],
          fontSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: "same-origin" },
    }),
  );
  app.use(express.json({ limit: "256kb" }));
  app.use(cookieParser());

  app.use("/media/products", express.static(config.uploadDirectory, { immutable: true, maxAge: "1y" }));

  app.get("/api/catalog/categories", (_request, response) => {
    response.set("Cache-Control", "no-store").json({ categories: listCategories(database) });
  });
  app.get("/api/catalog/products", (_request, response) => {
    response.set("Cache-Control", "no-store").json({ products: listProducts(database, { publicOnly: true }) });
  });
  app.get("/api/catalog/products/:slug", (request, response) => {
    const product = getProductBySlug(database, request.params.slug);
    if (!product || product.imageRecords.length === 0) return response.status(404).json({ message: "Produto não encontrado." });
    response.set("Cache-Control", "no-store").json({ product });
  });

  app.get("/sitemap.xml", (_request, response) => {
    const categories = listCategories(database) as Array<{ slug: string }>;
    const products = listProducts(database, { publicOnly: true });
    const urls = ["/", ...categories.map((category) => `/categoria/${category.slug}`), ...products.map((product) => `/produto/${product.slug}`)];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((url) => `  <url><loc>${config.siteUrl}${url}</loc></url>`)
      .join("\n")}\n</urlset>\n`;
    response.type("application/xml").set("Cache-Control", "no-store").send(xml);
  });

  app.post("/api/admin/auth/login", async (request, response) => {
    const origin = request.get("origin");
    const validOrigin = origin === config.siteUrl || (!config.production && Boolean(origin?.startsWith("http://localhost:")));
    if (!validOrigin) return response.status(403).json({ message: "Requisição inválida." });
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return response.status(401).json({ message: "E-mail ou senha inválidos." });
    const { email, password } = parsed.data;
    const ip = request.ip || "unknown";
    if (isLoginBlocked(database, email, ip)) {
      return response.status(429).json({ message: "Não foi possível entrar agora. Tente novamente mais tarde." });
    }
    const user = await verifyCredentials(database, email, password);
    recordLoginAttempt(database, email, ip, Boolean(user));
    if (!user) return response.status(401).json({ message: "E-mail ou senha inválidos." });
    const session = createSession(database, user.id);
    response.cookie(config.cookieName, session.token, cookieOptions());
    request.admin = { id: user.id, email: user.email, role: user.role, csrfToken: session.csrfToken, sessionId: session.id };
    audit(database, request, "login", "session", session.id, null, { email: user.email });
    return response.json({ user: { email: user.email, role: user.role }, csrfToken: session.csrfToken });
  });

  const requireAdmin = sessionMiddleware(database);
  app.use("/api/admin", requireAdmin, requireCsrf);

  app.get("/api/admin/auth/session", (request, response) => {
    response.set("Cache-Control", "no-store").json({
      user: { email: request.admin!.email, role: request.admin!.role },
      csrfToken: request.admin!.csrfToken,
    });
  });
  app.post("/api/admin/auth/logout", (request, response) => {
    audit(database, request, "logout", "session", request.admin!.sessionId, null, null);
    database.prepare("DELETE FROM admin_sessions WHERE id = ?").run(request.admin!.sessionId);
    response.clearCookie(config.cookieName, cookieOptions()).status(204).end();
  });
  app.post("/api/admin/auth/change-password", async (request, response) => {
    const parsed = passwordSchema.safeParse(request.body);
    if (!parsed.success) return response.status(400).json({ message: "A nova senha deve ter pelo menos 12 caracteres." });
    const user = await verifyCredentials(database, request.admin!.email, parsed.data.currentPassword);
    if (!user) return response.status(400).json({ message: "Senha atual inválida." });
    const hash = await argon2.hash(parsed.data.newPassword, { type: argon2.argon2id });
    database.transaction(() => {
      database.prepare("UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE id = ?").run(hash, new Date().toISOString(), user.id);
      database.prepare("DELETE FROM admin_sessions WHERE user_id = ? AND id != ?").run(user.id, request.admin!.sessionId);
    })();
    audit(database, request, "change_password", "admin_user", user.id, null, null);
    response.status(204).end();
  });

  app.get("/api/admin/products", (_request, response) => response.json({ products: listProducts(database) }));
  app.get("/api/admin/products/:id", (request, response) => {
    const product = getProduct(database, request.params.id);
    return product ? response.json({ product }) : response.status(404).json({ message: "Produto não encontrado." });
  });
  app.post("/api/admin/products", (request, response) => {
    const parsed = productSchema.safeParse(request.body);
    if (!parsed.success) return response.status(400).json({ message: "Revise os campos do produto.", issues: parsed.error.flatten() });
    try {
      const product = createProduct(database, parsed.data);
      audit(database, request, "create", "product", product.id, null, product);
      return response.status(201).json({ product });
    } catch (error) {
      return handleDatabaseError(error, response);
    }
  });
  app.put("/api/admin/products/:id", (request, response) => {
    const parsed = productSchema.safeParse(request.body);
    if (!parsed.success) return response.status(400).json({ message: "Revise os campos do produto.", issues: parsed.error.flatten() });
    try {
      const result = updateProduct(database, request.params.id, parsed.data);
      if (!result) return response.status(404).json({ message: "Produto não encontrado." });
      audit(database, request, "update", "product", request.params.id, result.before, result.after);
      return response.json({ product: result.after });
    } catch (error) {
      return handleDatabaseError(error, response);
    }
  });
  app.patch("/api/admin/products/:id/availability", (request, response) => {
    const parsed = z.object({ isAvailable: z.boolean() }).safeParse(request.body);
    if (!parsed.success) return response.status(400).json({ message: "Disponibilidade inválida." });
    const result = setProductAvailability(database, request.params.id, parsed.data.isAvailable);
    if ("error" in result && result.error) {
      const messages = {
        not_found: "Produto não encontrado.",
        image_required: "Adicione uma imagem antes de disponibilizar o produto.",
        variation_required: "Ative pelo menos um sabor antes de disponibilizar o produto.",
      };
      return response.status(result.error === "not_found" ? 404 : 400).json({ message: messages[result.error] });
    }
    audit(database, request, "availability", "product", request.params.id, result.before, result.after);
    return response.json({ product: result.after });
  });

  app.post("/api/admin/products/:id/images", upload.single("image"), async (request, response) => {
    try {
      if (!request.file) return response.status(400).json({ message: "Selecione uma imagem." });
      const productId = request.params.id as string;
      const result = await addImage(database, productId, request.file);
      if (!result) return response.status(404).json({ message: "Produto não encontrado." });
      audit(database, request, "add_image", "product", productId, result.before, result.after);
      return response.status(201).json({ product: result.after });
    } catch (error) {
      return handleUploadError(error, response);
    }
  });
  app.post("/api/admin/products/:id/images/:imageId/replace", upload.single("image"), async (request, response) => {
    try {
      if (!request.file) return response.status(400).json({ message: "Selecione uma imagem." });
      const productId = request.params.id as string;
      const imageId = request.params.imageId as string;
      const result = await replaceImage(database, productId, imageId, request.file);
      if (!result) return response.status(404).json({ message: "Imagem não encontrada." });
      audit(database, request, "replace_image", "product", productId, result.before, result.after);
      return response.json({ product: result.after });
    } catch (error) {
      return handleUploadError(error, response);
    }
  });
  app.delete("/api/admin/products/:id/images/:imageId", async (request, response) => {
    const result = await removeImage(database, request.params.id, request.params.imageId);
    if ("error" in result) {
      return response.status(result.error === "last_image" ? 400 : 404).json({
        message: result.error === "last_image" ? "O produto precisa manter ao menos uma imagem." : "Imagem não encontrada.",
      });
    }
    audit(database, request, "remove_image", "product", request.params.id, result.before, result.after);
    return response.json({ product: result.after });
  });
  app.patch("/api/admin/products/:id/images/:imageId/primary", (request, response) => {
    const result = setPrimaryImage(database, request.params.id, request.params.imageId);
    if (!result) return response.status(404).json({ message: "Imagem não encontrada." });
    audit(database, request, "primary_image", "product", request.params.id, result.before, result.after);
    return response.json({ product: result.after });
  });
  app.put("/api/admin/products/:id/images/order", (request, response) => {
    const parsed = z.object({ imageIds: z.array(z.string().uuid()).min(1) }).safeParse(request.body);
    if (!parsed.success) return response.status(400).json({ message: "Ordem de imagens inválida." });
    try {
      const result = reorderImages(database, request.params.id, parsed.data.imageIds);
      if (!result) return response.status(404).json({ message: "Produto não encontrado." });
      audit(database, request, "reorder_images", "product", request.params.id, result.before, result.after);
      return response.json({ product: result.after });
    } catch {
      return response.status(400).json({ message: "A ordem precisa incluir todas as imagens uma única vez." });
    }
  });

  app.get("/admin.html", (_request, response) => response.status(404).end());
  app.use(express.static(config.staticDirectory, { index: false, maxAge: "1y", immutable: true }));
  app.use((request, response) => {
    if (request.path === config.adminPath || request.path.startsWith(`${config.adminPath}/`)) {
      return response.sendFile(path.join(config.staticDirectory, "admin.html"), { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
    }
    if (request.method === "GET" && !path.extname(request.path)) {
      return response.sendFile(path.join(config.staticDirectory, "index.html"), { headers: { "Cache-Control": "no-cache" } });
    }
    response.status(404).end();
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return response.status(400).json({ message: "A imagem deve ter no máximo 8 MB." });
    }
    console.error(error);
    response.status(500).json({ message: "Não foi possível concluir a operação." });
  });
  return app;
}

function handleUploadError(error: unknown, response: express.Response) {
  if (error instanceof Error && error.message === "INVALID_IMAGE") {
    return response.status(400).json({ message: "Envie uma imagem JPEG, PNG ou WebP válida." });
  }
  throw error;
}

function handleDatabaseError(error: unknown, response: express.Response) {
  if (error instanceof Error && error.message.includes("FOREIGN KEY")) {
    return response.status(400).json({ message: "Categoria inválida." });
  }
  throw error;
}
