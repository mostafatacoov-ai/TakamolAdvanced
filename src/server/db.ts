import "server-only";
import { DatabaseSync, type SQLInputValue, type StatementSync } from "node:sqlite";
import { DB_FILE, ensureDataDirs } from "./paths";
import { seedKpi } from "./kpi-seed";
import { seed } from "./seed";

/* SQLite through Node's built-in driver (no native packages to install).
   One connection per process; statements are prepared once and reused. */

const MIGRATIONS: (string | ((db: DatabaseSync) => void))[] = [
  `
  CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    permissions TEXT NOT NULL DEFAULT '[]',
    locked INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    active INTEGER NOT NULL DEFAULT 1,
    must_change_password INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at TEXT
  );
  CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX sessions_user ON sessions(user_id);
  CREATE TABLE login_attempts (
    key TEXT NOT NULL,
    at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX login_attempts_key ON login_attempts(key, at);
  CREATE TABLE text_overrides (
    locale TEXT NOT NULL,
    path TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_by INTEGER,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (locale, path)
  );
  CREATE TABLE asset_overrides (
    path TEXT PRIMARY KEY,
    version INTEGER NOT NULL,
    updated_by INTEGER,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    uploaded_by INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title_ar TEXT NOT NULL DEFAULT '',
    title_en TEXT NOT NULL DEFAULT '',
    description_ar TEXT NOT NULL DEFAULT '',
    description_en TEXT NOT NULL DEFAULT '',
    blocks TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'draft',
    updated_by INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_ar TEXT NOT NULL DEFAULT '',
    title_en TEXT NOT NULL DEFAULT '',
    location_ar TEXT NOT NULL DEFAULT '',
    location_en TEXT NOT NULL DEFAULT '',
    type_ar TEXT NOT NULL DEFAULT '',
    type_en TEXT NOT NULL DEFAULT '',
    description_ar TEXT NOT NULL DEFAULT '',
    description_en TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    job_title TEXT NOT NULL DEFAULT '{}',
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    linkedin TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    cv_file TEXT NOT NULL,
    cv_name TEXT NOT NULL,
    cv_mime TEXT NOT NULL,
    cv_size INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    notes TEXT NOT NULL DEFAULT '',
    locale TEXT NOT NULL DEFAULT 'ar',
    ip_hash TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX applications_status ON applications(status, created_at);
  CREATE INDEX applications_ip ON applications(ip_hash, created_at);
  CREATE TABLE activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    user_name TEXT NOT NULL DEFAULT '',
    action TEXT NOT NULL,
    target TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  `,
  `
  CREATE TABLE quotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    reference TEXT NOT NULL DEFAULT '',
    sales_person TEXT NOT NULL,
    request_date TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT '',
    client_name TEXT NOT NULL,
    client_type TEXT NOT NULL DEFAULT '',
    client_contact TEXT NOT NULL DEFAULT '',
    client_phone TEXT NOT NULL DEFAULT '',
    client_email TEXT NOT NULL DEFAULT '',
    client_address TEXT NOT NULL DEFAULT '',
    services TEXT NOT NULL DEFAULT '[]',
    service_other TEXT NOT NULL DEFAULT '',
    project_name TEXT NOT NULL DEFAULT '',
    project_location TEXT NOT NULL DEFAULT '',
    land_area TEXT NOT NULL DEFAULT '',
    boundaries TEXT NOT NULL DEFAULT '',
    study_goal TEXT NOT NULL DEFAULT '',
    documents TEXT NOT NULL DEFAULT '[]',
    client_requirements TEXT NOT NULL DEFAULT '',
    amount REAL,
    vat REAL,
    total REAL,
    duration_days INTEGER,
    validity TEXT NOT NULL DEFAULT '',
    payments TEXT NOT NULL DEFAULT '',
    formats TEXT NOT NULL DEFAULT '[]',
    meeting INTEGER,
    notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    admin_notes TEXT NOT NULL DEFAULT '',
    locale TEXT NOT NULL DEFAULT 'ar',
    ip_hash TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX quotations_status ON quotations(status, created_at);
  CREATE INDEX quotations_ip ON quotations(ip_hash, created_at);
  -- the built-in Site manager role gains the new sales permissions
  UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'quotations.view')
    WHERE key = 'site_manager'
      AND NOT EXISTS (SELECT 1 FROM json_each(roles.permissions) WHERE value = 'quotations.view');
  UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'quotations.manage')
    WHERE key = 'site_manager'
      AND NOT EXISTS (SELECT 1 FROM json_each(roles.permissions) WHERE value = 'quotations.manage');
  `,
  `
  ALTER TABLE quotations ADD COLUMN amount_max REAL;
  ALTER TABLE quotations ADD COLUMN vat_max REAL;
  ALTER TABLE quotations ADD COLUMN total_max REAL;
  CREATE TABLE quotation_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_id INTEGER NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    file TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX quotation_files_quotation ON quotation_files(quotation_id);
  `,
  (db) => {
    db.exec(`
      CREATE TABLE departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_en TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX employees_department ON employees(department_id, sort_order);
      CREATE TABLE kpi_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        period TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'draft',
        content TEXT NOT NULL DEFAULT '{}',
        score REAL,
        updated_by INTEGER,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE (department_id, period)
      );
      CREATE TABLE kpi_evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER NOT NULL REFERENCES kpi_reports(id) ON DELETE CASCADE,
        employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        name TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL DEFAULT '',
        highlights TEXT NOT NULL DEFAULT '[]',
        kpis TEXT NOT NULL DEFAULT '[]',
        score REAL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        UNIQUE (report_id, employee_id)
      );
      CREATE INDEX kpi_evaluations_employee ON kpi_evaluations(employee_id);
      UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'kpi.view')
        WHERE key = 'site_manager'
          AND NOT EXISTS (SELECT 1 FROM json_each(roles.permissions) WHERE value = 'kpi.view');
      UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'kpi.manage')
        WHERE key = 'site_manager'
          AND NOT EXISTS (SELECT 1 FROM json_each(roles.permissions) WHERE value = 'kpi.manage');
    `);
    // the departments, team and August 2026 reports the module was built from
    seedKpi(db);
  },
];

type Connection = { db: DatabaseSync; statements: Map<string, StatementSync> };
const holder = globalThis as typeof globalThis & { __takamolDb?: Connection };

function open(): Connection {
  ensureDataDirs();
  const db = new DatabaseSync(DB_FILE);
  db.exec("PRAGMA busy_timeout = 8000");
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
  migrate(db);
  return { db, statements: new Map() };
}

function migrate(db: DatabaseSync) {
  const version = () =>
    Number((db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value?: string } | undefined)?.value ?? 0);
  while (version() < MIGRATIONS.length) {
    db.exec("BEGIN IMMEDIATE");
    try {
      // re-read under the write lock: a parallel build worker may have migrated
      const v = version();
      if (v < MIGRATIONS.length) {
        const step = MIGRATIONS[v];
        if (typeof step === "string") db.exec(step);
        else step(db);
        if (v === 0) seed(db);
        db.prepare(
          "INSERT INTO meta (key, value) VALUES ('schema_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        ).run(String(v + 1));
      }
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
}

function connection(): Connection {
  return (holder.__takamolDb ??= open());
}

function prepared(sql: string): StatementSync {
  const c = connection();
  let statement = c.statements.get(sql);
  if (!statement) {
    statement = c.db.prepare(sql);
    c.statements.set(sql, statement);
  }
  return statement;
}

export type Param = SQLInputValue | boolean | undefined;
const normalize = (params: Param[]): SQLInputValue[] =>
  params.map((p) => (typeof p === "boolean" ? (p ? 1 : 0) : p === undefined ? null : p));

export function one<T>(sql: string, ...params: Param[]): T | undefined {
  return prepared(sql).get(...normalize(params)) as T | undefined;
}

export function all<T>(sql: string, ...params: Param[]): T[] {
  return prepared(sql).all(...normalize(params)) as T[];
}

export function run(sql: string, ...params: Param[]) {
  const result = prepared(sql).run(...normalize(params));
  return { changes: Number(result.changes), id: Number(result.lastInsertRowid) };
}

export function transaction<T>(fn: () => T): T {
  const { db } = connection();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function getMeta(key: string): string | undefined {
  return one<{ value: string }>("SELECT value FROM meta WHERE key = ?", key)?.value;
}

export function setMeta(key: string, value: string) {
  run("INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", key, value);
}

/** SQLite's datetime('now') text ("YYYY-MM-DD HH:MM:SS", UTC) as a Date. */
export function sqlDate(value: string | null | undefined): Date | null {
  return value ? new Date(value.replace(" ", "T") + "Z") : null;
}
