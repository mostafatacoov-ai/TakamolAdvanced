import "server-only";
import { all, one, run } from "./db";

export type ActivityRecord = {
  id: number;
  userName: string;
  action: string;
  target: string;
  createdAt: string;
};

export function logActivity(user: { id: number; name: string } | null, action: string, target = "") {
  run(
    "INSERT INTO activity (user_id, user_name, action, target) VALUES (?, ?, ?, ?)",
    user?.id ?? null, user?.name ?? "", action, target.slice(0, 200),
  );
}

type Row = { id: number; user_name: string; action: string; target: string; created_at: string };
const toRecord = (r: Row): ActivityRecord => ({
  id: r.id, userName: r.user_name, action: r.action, target: r.target, createdAt: r.created_at,
});

export function listActivity(page = 1, perPage = 40) {
  const total = one<{ n: number }>("SELECT COUNT(*) AS n FROM activity")?.n ?? 0;
  const rows = all<Row>("SELECT * FROM activity ORDER BY id DESC LIMIT ? OFFSET ?", perPage, (Math.max(1, page) - 1) * perPage);
  return { rows: rows.map(toRecord), total, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export const recentActivity = (limit = 8) =>
  all<Row>("SELECT * FROM activity ORDER BY id DESC LIMIT ?", limit).map(toRecord);
