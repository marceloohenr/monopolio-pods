// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import sharp from "sharp";

const password = "Test-password-123!";
let temporaryDirectory: string;
let database: import("better-sqlite3").Database;
let app: import("express").Express;
let createAdmin: (database: import("better-sqlite3").Database, email: string, password: string) => Promise<string>;

beforeAll(async () => {
  temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "monopolio-api-"));
  process.env.DATA_DIR = temporaryDirectory;
  process.env.DATABASE_PATH = path.join(temporaryDirectory, "test.sqlite");
  process.env.UPLOAD_DIR = path.join(temporaryDirectory, "uploads");
  process.env.SITE_URL = "http://localhost:8080";
  process.env.ADMIN_PATH = "/painel-teste-seguro";
  process.env.SECURITY_HASH_SECRET = "test-secret";

  const [{ openDatabase, runMigrations }, appModule, authModule] = await Promise.all([
    import("./db.js"),
    import("./app.js"),
    import("./auth.js"),
  ]);
  database = openDatabase(process.env.DATABASE_PATH);
  runMigrations(database);
  database.prepare(`
    INSERT INTO categories (id, name, slug, icon, sort_order, description)
    VALUES ('test-category', 'Teste', 'teste', 'Package', 1, 'Categoria de teste')
  `).run();
  createAdmin = authModule.createAdmin;
  await createAdmin(database, "admin@gmail.com", password);
  app = appModule.createApp(database);
});

beforeEach(() => {
  database.prepare("DELETE FROM audit_logs").run();
  database.prepare("DELETE FROM login_attempts").run();
  database.prepare("DELETE FROM admin_sessions").run();
  database.prepare("DELETE FROM products").run();
});

afterAll(async () => {
  database.close();
  await fs.rm(temporaryDirectory, { recursive: true, force: true });
});

async function login() {
  const response = await request(app)
    .post("/api/admin/auth/login")
    .set("Origin", "http://localhost:8080")
    .send({ email: "admin@gmail.com", password });
  const setCookie = response.headers["set-cookie"] as unknown as string[];
  return {
    response,
    cookie: setCookie[0].split(";", 1)[0],
    csrf: response.body.csrfToken as string,
  };
}

function adminHeaders(cookie: string, csrf?: string) {
  const headers: Record<string, string> = { Cookie: cookie, Origin: "http://localhost:8080" };
  if (csrf) headers["x-csrf-token"] = csrf;
  return headers;
}

const productPayload = {
  name: "Produto de Teste",
  brand: "Marca",
  categoryId: "test-category",
  puffs: 12000,
  description: "Descrição válida para o produto de teste.",
  priceCents: 8990,
  variations: [{ name: "Menta", isAvailable: true }],
};

describe("admin authentication and security", () => {
  it("serves the panel only from the configured secret route", async () => {
    await request(app).get("/admin.html").expect(404);
    const panel = await request(app).get("/painel-teste-seguro").expect(200);
    expect(panel.headers["x-robots-tag"]).toBe("noindex, nofollow");
  });

  it("creates an opaque session cookie and rejects missing authentication", async () => {
    await request(app).get("/api/admin/products").expect(401);
    const { response, cookie } = await login();
    expect(response.status).toBe(200);
    expect(cookie).toMatch(/^mp_admin_session=/);
    expect(response.headers["set-cookie"][0]).toContain("HttpOnly");
    expect(response.headers["set-cookie"][0]).toContain("SameSite=Strict");
  });

  it("requires both CSRF token and a valid origin for mutations", async () => {
    const { cookie, csrf } = await login();
    await request(app).post("/api/admin/products").set("Cookie", cookie).send(productPayload).expect(403);
    await request(app)
      .post("/api/admin/products")
      .set("Cookie", cookie)
      .set("x-csrf-token", csrf)
      .send(productPayload)
      .expect(403);
  });

  it("invalidates the session on logout and rejects expired sessions", async () => {
    const first = await login();
    await request(app)
      .post("/api/admin/auth/logout")
      .set(adminHeaders(first.cookie, first.csrf))
      .expect(204);
    await request(app).get("/api/admin/products").set("Cookie", first.cookie).expect(401);

    const second = await login();
    database.prepare("UPDATE admin_sessions SET expires_at = ?").run("2000-01-01T00:00:00.000Z");
    await request(app).get("/api/admin/products").set("Cookie", second.cookie).expect(401);
  });

  it("blocks attempts by IP or e-mail after five failures", async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(app)
        .post("/api/admin/auth/login")
        .set("Origin", "http://localhost:8080")
        .send({ email: "admin@gmail.com", password: "wrong-password" })
        .expect(401);
    }
    await request(app)
      .post("/api/admin/auth/login")
      .set("Origin", "http://localhost:8080")
      .send({ email: "another@example.com", password: "wrong-password" })
      .expect(429);
  });
});

describe("product administration", () => {
  it("creates and edits a product while preserving its slug", async () => {
    const { cookie, csrf } = await login();
    const created = await request(app)
      .post("/api/admin/products")
      .set(adminHeaders(cookie, csrf))
      .send(productPayload)
      .expect(201);
    expect(created.body.product.isAvailable).toBe(false);
    const { id, slug } = created.body.product;

    const updated = await request(app)
      .put(`/api/admin/products/${id}`)
      .set(adminHeaders(cookie, csrf))
      .send({ ...productPayload, name: "Produto com Novo Nome" })
      .expect(200);
    expect(updated.body.product.slug).toBe(slug);
    expect(database.prepare("SELECT COUNT(*) AS count FROM audit_logs WHERE entity_type = 'product'").get()).toEqual({ count: 2 });
  });

  it("validates images and availability requirements", async () => {
    const { cookie, csrf } = await login();
    const created = await request(app)
      .post("/api/admin/products")
      .set(adminHeaders(cookie, csrf))
      .send(productPayload)
      .expect(201);
    const id = created.body.product.id as string;

    await request(app)
      .patch(`/api/admin/products/${id}/availability`)
      .set(adminHeaders(cookie, csrf))
      .send({ isAvailable: true })
      .expect(400);
    await request(app)
      .post(`/api/admin/products/${id}/images`)
      .set(adminHeaders(cookie, csrf))
      .attach("image", Buffer.from("not-an-image"), { filename: "invalid.png", contentType: "image/png" })
      .expect(400);

    const image = await sharp({ create: { width: 24, height: 24, channels: 3, background: "#ffffff" } }).png().toBuffer();
    const uploaded = await request(app)
      .post(`/api/admin/products/${id}/images`)
      .set(adminHeaders(cookie, csrf))
      .attach("image", image, { filename: "product.png", contentType: "image/png" })
      .expect(201);
    expect(uploaded.body.product.images[0]).toMatch(/^\/media\/products\/.+\.webp$/);

    await request(app)
      .patch(`/api/admin/products/${id}/availability`)
      .set(adminHeaders(cookie, csrf))
      .send({ isAvailable: true })
      .expect(200);

    const disabled = await request(app)
      .put(`/api/admin/products/${id}`)
      .set(adminHeaders(cookie, csrf))
      .send({ ...productPayload, variations: [{ name: "Menta", isAvailable: false }] })
      .expect(200);
    expect(disabled.body.product.isAvailable).toBe(false);
  });

  it("does not allow image operations across products", async () => {
    const { cookie, csrf } = await login();
    const first = await request(app).post("/api/admin/products").set(adminHeaders(cookie, csrf)).send(productPayload);
    const second = await request(app).post("/api/admin/products").set(adminHeaders(cookie, csrf)).send({ ...productPayload, name: "Segundo Produto" });
    const image = await sharp({ create: { width: 16, height: 16, channels: 3, background: "#000000" } }).png().toBuffer();
    const uploaded = await request(app)
      .post(`/api/admin/products/${first.body.product.id}/images`)
      .set(adminHeaders(cookie, csrf))
      .attach("image", image, { filename: "product.png", contentType: "image/png" });
    const imageId = uploaded.body.product.imageRecords[0].id;

    await request(app)
      .patch(`/api/admin/products/${second.body.product.id}/images/${imageId}/primary`)
      .set(adminHeaders(cookie, csrf))
      .expect(404);
  });
});
