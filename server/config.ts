import path from "node:path";

function normalizeAdminPath(value: string) {
  const normalized = `/${value.trim().replace(/^\/+|\/+$/g, "")}`;
  if (normalized === "/" || normalized.split("/").length !== 2) {
    throw new Error("ADMIN_PATH must contain exactly one non-empty path segment.");
  }
  return normalized;
}

const projectRoot = process.cwd();
const dataDirectory = path.resolve(process.env.DATA_DIR || path.join(projectRoot, ".data"));
const production = process.env.NODE_ENV === "production";

if (production && !process.env.ADMIN_PATH) {
  throw new Error("ADMIN_PATH is required in production.");
}
if (production && !process.env.SECURITY_HASH_SECRET) {
  throw new Error("SECURITY_HASH_SECRET is required in production.");
}

export const config = {
  projectRoot,
  dataDirectory,
  databasePath: path.resolve(process.env.DATABASE_PATH || path.join(dataDirectory, "monopolio.sqlite")),
  uploadDirectory: path.resolve(process.env.UPLOAD_DIR || path.join(dataDirectory, "uploads", "products")),
  staticDirectory: path.resolve(process.env.STATIC_ROOT || path.join(projectRoot, "dist")),
  migrationDirectory: path.join(projectRoot, "server", "migrations"),
  seedPath: path.join(projectRoot, "server", "seed", "catalog.json"),
  adminPath: normalizeAdminPath(process.env.ADMIN_PATH || "/painel-local-seguro"),
  cookieName: process.env.ADMIN_COOKIE_NAME || "mp_admin_session",
  siteUrl: (process.env.SITE_URL || "http://localhost:8080").replace(/\/+$/, ""),
  port: Number(process.env.PORT || 3002),
  production,
  sessionHours: 8,
  loginWindowMinutes: 15,
  loginMaxAttempts: 5,
};
