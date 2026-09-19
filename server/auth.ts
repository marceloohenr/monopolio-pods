import { createHash, randomBytes, randomUUID } from "node:crypto";
import argon2 from "argon2";
import type { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import type { AppDatabase } from "./db.js";

export interface AdminIdentity {
  id: string;
  email: string;
  role: "admin";
  csrfToken: string;
  sessionId: string;
}

declare global {
  // Express exposes request augmentation through its global namespace.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminIdentity;
    }
  }
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export function hashSensitive(value: string) {
  return sha256(`${process.env.SECURITY_HASH_SECRET || "local-development"}:${value}`);
}

export async function createAdmin(database: AppDatabase, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const existing = database.prepare("SELECT id FROM admin_users WHERE email = ?").get(normalizedEmail) as
    | { id: string }
    | undefined;
  const now = new Date().toISOString();
  if (existing) {
    database.prepare("UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE id = ?").run(
      passwordHash,
      now,
      existing.id,
    );
    database.prepare("DELETE FROM admin_sessions WHERE user_id = ?").run(existing.id);
    return existing.id;
  }
  const id = randomUUID();
  database.prepare(`
    INSERT INTO admin_users (id, email, password_hash, role, created_at, updated_at)
    VALUES (?, ?, ?, 'admin', ?, ?)
  `).run(id, normalizedEmail, passwordHash, now, now);
  return id;
}

export function isLoginBlocked(database: AppDatabase, email: string, ip: string) {
  const since = new Date(Date.now() - config.loginWindowMinutes * 60_000).toISOString();
  const row = database.prepare(`
    SELECT COUNT(*) AS count FROM login_attempts
    WHERE (email_hash = ? OR ip_hash = ?) AND succeeded = 0 AND attempted_at >= ?
  `).get(hashSensitive(email.toLowerCase()), hashSensitive(ip), since) as { count: number };
  return row.count >= config.loginMaxAttempts;
}

export function recordLoginAttempt(database: AppDatabase, email: string, ip: string, succeeded: boolean) {
  database.prepare(`
    INSERT INTO login_attempts (email_hash, ip_hash, succeeded, attempted_at) VALUES (?, ?, ?, ?)
  `).run(hashSensitive(email.toLowerCase()), hashSensitive(ip), Number(succeeded), new Date().toISOString());
  database.prepare("DELETE FROM login_attempts WHERE attempted_at < ?").run(
    new Date(Date.now() - 24 * 60 * 60_000).toISOString(),
  );
}

export async function verifyCredentials(database: AppDatabase, email: string, password: string) {
  const user = database.prepare(`
    SELECT id, email, password_hash AS passwordHash, role FROM admin_users WHERE email = ?
  `).get(email.trim().toLowerCase()) as
    | { id: string; email: string; passwordHash: string; role: "admin" }
    | undefined;
  if (!user || !(await argon2.verify(user.passwordHash, password))) return null;
  return user;
}

export function createSession(database: AppDatabase, userId: string) {
  const token = randomBytes(32).toString("base64url");
  const csrfToken = randomBytes(24).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.sessionHours * 60 * 60_000);
  const id = randomUUID();
  database.prepare(`
    INSERT INTO admin_sessions (id, user_id, token_hash, csrf_token, expires_at, created_at, last_seen_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, sha256(token), csrfToken, expiresAt.toISOString(), now.toISOString(), now.toISOString());
  return { id, token, csrfToken, expiresAt };
}

export function sessionMiddleware(database: AppDatabase) {
  return (request: Request, response: Response, next: NextFunction) => {
    const token = request.cookies?.[config.cookieName];
    if (!token) return response.status(401).json({ message: "Autenticação necessária." });
    const row = database.prepare(`
      SELECT sessions.id AS sessionId, sessions.csrf_token AS csrfToken, sessions.expires_at AS expiresAt,
             users.id, users.email, users.role
      FROM admin_sessions sessions
      JOIN admin_users users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ?
    `).get(sha256(token)) as
      | { sessionId: string; csrfToken: string; expiresAt: string; id: string; email: string; role: "admin" }
      | undefined;
    if (!row || new Date(row.expiresAt).getTime() <= Date.now()) {
      if (row) database.prepare("DELETE FROM admin_sessions WHERE id = ?").run(row.sessionId);
      response.clearCookie(config.cookieName, cookieOptions());
      return response.status(401).json({ message: "Sessão expirada." });
    }
    request.admin = {
      id: row.id,
      email: row.email,
      role: row.role,
      csrfToken: row.csrfToken,
      sessionId: row.sessionId,
    };
    database.prepare("UPDATE admin_sessions SET last_seen_at = ? WHERE id = ?").run(
      new Date().toISOString(),
      row.sessionId,
    );
    next();
  };
}

export function requireCsrf(request: Request, response: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return next();
  if (!request.admin || request.get("x-csrf-token") !== request.admin.csrfToken) {
    return response.status(403).json({ message: "Requisição inválida." });
  }
  const origin = request.get("origin");
  const validOrigin = origin === config.siteUrl || (!config.production && Boolean(origin?.startsWith("http://localhost:")));
  if (!validOrigin) {
    return response.status(403).json({ message: "Origem inválida." });
  }
  next();
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.production,
    sameSite: "strict" as const,
    path: "/",
    maxAge: config.sessionHours * 60 * 60_000,
  };
}

export function audit(
  database: AppDatabase,
  request: Request,
  action: string,
  entityType: string,
  entityId: string | null,
  before: unknown,
  after: unknown,
) {
  database.prepare(`
    INSERT INTO audit_logs (
      admin_user_id, action, entity_type, entity_id, before_json, after_json, ip_hash, user_agent, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    request.admin?.id ?? null,
    action,
    entityType,
    entityId,
    before == null ? null : JSON.stringify(before),
    after == null ? null : JSON.stringify(after),
    hashSensitive(request.ip || "unknown"),
    request.get("user-agent")?.slice(0, 300) || null,
    new Date().toISOString(),
  );
}
