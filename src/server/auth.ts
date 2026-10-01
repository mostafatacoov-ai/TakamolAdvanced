import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ADMIN_ROLE, type Permission } from "@/lib/admin/permissions";
import type { Localized } from "@/lib/site-types";
import { one, run } from "./db";
import { parsePermissions } from "./users";

const COOKIE = "tak_admin";
const SESSION_DAYS = 7;

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleKey: string | null;
  roleName: Localized;
  permissions: Permission[];
  mustChangePassword: boolean;
};

type SessionRow = {
  user_id: number; name: string; email: string; active: number; must_change_password: number;
  role_id: number; role_key: string | null; name_ar: string; name_en: string; permissions: string; expires_at: string;
};

/** The signed-in admin user for this request, or null. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = one<SessionRow>(
    `SELECT s.user_id, s.expires_at, u.name, u.email, u.active, u.must_change_password,
            r.id AS role_id, r.key AS role_key, r.name_ar, r.name_en, r.permissions
     FROM sessions s JOIN users u ON u.id = s.user_id JOIN roles r ON r.id = u.role_id
     WHERE s.id = ?`,
    sha256(token),
  );
  if (!row || row.active !== 1 || Date.parse(row.expires_at) < Date.now()) return null;
  return {
    id: row.user_id,
    name: row.name,
    email: row.email,
    roleId: row.role_id,
    roleKey: row.role_key,
    roleName: { ar: row.name_ar, en: row.name_en },
    permissions: parsePermissions(row.permissions, row.role_key),
    mustChangePassword: row.must_change_password === 1,
  };
});

export const can = (user: SessionUser, permission: Permission) =>
  user.roleKey === ADMIN_ROLE || user.permissions.includes(permission);

/** For admin pages: send visitors who aren't signed in to the login page. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** For admin pages: also bounce users whose role lacks `permission`. */
export async function requirePermission(permission: Permission) {
  const user = await requireUser();
  if (!can(user, permission)) redirect("/admin?denied=1");
  return user;
}

async function isHttps() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return (h.get("origin") ?? "").startsWith("https://");
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}

export async function startSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  run("DELETE FROM sessions WHERE expires_at < ?", new Date().toISOString());
  run("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", sha256(token), userId, expires.toISOString());
  run("UPDATE users SET last_login_at = datetime('now') WHERE id = ?", userId);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: await isHttps(),
    path: "/",
    expires,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) run("DELETE FROM sessions WHERE id = ?", sha256(token));
  jar.delete(COOKIE);
}

/** Sign out every other device of this user (after a password change). */
export async function endOtherSessions(userId: number) {
  const token = (await cookies()).get(COOKIE)?.value;
  run("DELETE FROM sessions WHERE user_id = ? AND id != ?", userId, token ? sha256(token) : "");
}

/* ---- login throttling: 5 failures per email+IP, 20 per IP, per 15 min -- */

export function loginBlocked(keys: string[]) {
  return keys.some((key, i) => {
    const n = one<{ n: number }>(
      "SELECT COUNT(*) AS n FROM login_attempts WHERE key = ? AND at > datetime('now', '-15 minutes')", key,
    )?.n ?? 0;
    return n >= (i === 0 ? 5 : 20);
  });
}

export function recordLoginFailure(keys: string[]) {
  for (const key of keys) run("INSERT INTO login_attempts (key) VALUES (?)", key);
  run("DELETE FROM login_attempts WHERE at < datetime('now', '-1 day')");
}

export function clearLoginFailures(key: string) {
  run("DELETE FROM login_attempts WHERE key = ?", key);
}

export const loginKeys = (email: string, ip: string) => [
  `u:${email.trim().toLowerCase()}|${sha256(ip)}`,
  `ip:${sha256(ip)}`,
];
