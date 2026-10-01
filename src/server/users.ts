import "server-only";
import { ADMIN_ROLE, isPermission, PERMISSIONS, type Permission } from "@/lib/admin/permissions";
import type { Localized } from "@/lib/site-types";
import { all, one, run, transaction } from "./db";
import { hashPassword } from "./passwords";

/* ---- roles ------------------------------------------------------------- */

export type RoleRecord = {
  id: number;
  key: string | null;
  name: Localized;
  permissions: Permission[];
  locked: boolean;
  users: number;
};

type RoleRow = { id: number; key: string | null; name_ar: string; name_en: string; permissions: string; locked: number; users?: number };

export function parsePermissions(raw: string, key: string | null): Permission[] {
  if (key === ADMIN_ROLE) return [...PERMISSIONS];
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((p): p is Permission => typeof p === "string" && isPermission(p)) : [];
  } catch {
    return [];
  }
}

const toRole = (r: RoleRow): RoleRecord => ({
  id: r.id,
  key: r.key,
  name: { ar: r.name_ar, en: r.name_en },
  permissions: parsePermissions(r.permissions, r.key),
  locked: r.locked === 1,
  users: r.users ?? 0,
});

export function listRoles() {
  return all<RoleRow>(
    "SELECT r.*, (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id) AS users FROM roles r ORDER BY r.locked DESC, r.id",
  ).map(toRole);
}

export function getRole(id: number) {
  const row = one<RoleRow>("SELECT r.*, (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id) AS users FROM roles r WHERE r.id = ?", id);
  return row ? toRole(row) : null;
}

export const adminRoleId = () => one<{ id: number }>("SELECT id FROM roles WHERE key = ?", ADMIN_ROLE)!.id;

export function createRole(name: Localized, permissions: Permission[]) {
  return run("INSERT INTO roles (name_ar, name_en, permissions) VALUES (?, ?, ?)", name.ar, name.en, JSON.stringify(permissions)).id;
}

export function updateRole(id: number, name: Localized, permissions: Permission[]) {
  run("UPDATE roles SET name_ar = ?, name_en = ?, permissions = ? WHERE id = ? AND locked = 0", name.ar, name.en, JSON.stringify(permissions), id);
}

export function deleteRole(id: number) {
  run("DELETE FROM roles WHERE id = ? AND locked = 0", id);
}

/* ---- users ------------------------------------------------------------- */

export type UserRecord = {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleKey: string | null;
  roleName: Localized;
  active: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

type UserRow = {
  id: number; name: string; email: string; role_id: number; active: number; must_change_password: number;
  created_at: string; last_login_at: string | null; role_key: string | null; role_name_ar: string; role_name_en: string;
};

const USER_SELECT = `SELECT u.*, r.key AS role_key, r.name_ar AS role_name_ar, r.name_en AS role_name_en
  FROM users u JOIN roles r ON r.id = u.role_id`;

const toUser = (r: UserRow): UserRecord => ({
  id: r.id,
  name: r.name,
  email: r.email,
  roleId: r.role_id,
  roleKey: r.role_key,
  roleName: { ar: r.role_name_ar, en: r.role_name_en },
  active: r.active === 1,
  mustChangePassword: r.must_change_password === 1,
  createdAt: r.created_at,
  lastLoginAt: r.last_login_at,
});

export const listUsers = () => all<UserRow>(`${USER_SELECT} ORDER BY u.id`).map(toUser);

export function getUser(id: number) {
  const row = one<UserRow>(`${USER_SELECT} WHERE u.id = ?`, id);
  return row ? toUser(row) : null;
}

export const countUsers = () => one<{ n: number }>("SELECT COUNT(*) AS n FROM users")?.n ?? 0;

export function findUserByEmail(email: string) {
  return one<{ id: number; password_hash: string; active: number }>(
    "SELECT id, password_hash, active FROM users WHERE email = ?", email.trim(),
  );
}

export function emailTaken(email: string, exceptId?: number) {
  const row = one<{ id: number }>("SELECT id FROM users WHERE email = ?", email.trim());
  return !!row && row.id !== exceptId;
}

/** Active administrators other than `exceptId` — there must always be one. */
export function otherActiveAdmins(exceptId: number) {
  return one<{ n: number }>(
    "SELECT COUNT(*) AS n FROM users u JOIN roles r ON r.id = u.role_id WHERE r.key = ? AND u.active = 1 AND u.id != ?",
    ADMIN_ROLE, exceptId,
  )?.n ?? 0;
}

export async function createUser(input: { name: string; email: string; roleId: number; password: string; mustChange: boolean }) {
  const hash = await hashPassword(input.password);
  return run(
    "INSERT INTO users (name, email, password_hash, role_id, must_change_password) VALUES (?, ?, ?, ?, ?)",
    input.name, input.email.trim(), hash, input.roleId, input.mustChange,
  ).id;
}

export function updateUser(id: number, input: { name: string; email: string; roleId: number; active: boolean }) {
  transaction(() => {
    run("UPDATE users SET name = ?, email = ?, role_id = ?, active = ? WHERE id = ?", input.name, input.email.trim(), input.roleId, input.active, id);
    if (!input.active) run("DELETE FROM sessions WHERE user_id = ?", id);
  });
}

export async function setUserPassword(id: number, password: string, mustChange: boolean) {
  const hash = await hashPassword(password);
  run("UPDATE users SET password_hash = ?, must_change_password = ? WHERE id = ?", hash, mustChange, id);
}

export function deleteUser(id: number) {
  run("DELETE FROM users WHERE id = ?", id);
}
