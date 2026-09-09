import { getDb } from "../db/client.ts";
import { id } from "../lib/ids.ts";
import type { Project, TenantOrg, TenantUser } from "./types.ts";

export function createOrg(name: string): TenantOrg {
  const now = new Date().toISOString();
  const org = { id: id("org"), name, createdAt: now };
  getDb().prepare(`INSERT INTO organizations (id, name, created_at) VALUES (?, ?, ?)`).run(org.id, name, now);
  return org;
}

export function getOrg(orgId: string): TenantOrg | null {
  const row = getDb().prepare(`SELECT * FROM organizations WHERE id = ?`).get(orgId) as
    | { id: string; name: string; created_at: string }
    | undefined;
  if (!row) return null;
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export function listOrgs(): TenantOrg[] {
  const rows = getDb().prepare(`SELECT * FROM organizations ORDER BY created_at`).all() as Array<{
    id: string;
    name: string;
    created_at: string;
  }>;
  return rows.map((r) => ({ id: r.id, name: r.name, createdAt: r.created_at }));
}

export function createUser(email: string, name: string): TenantUser {
  const now = new Date().toISOString();
  const user = { id: id("user"), email, name };
  getDb()
    .prepare(`INSERT INTO users (id, email, name, created_at) VALUES (?, ?, ?, ?)`)
    .run(user.id, email, name, now);
  return user;
}

export function addMembership(orgId: string, userId: string, role: string): void {
  const now = new Date().toISOString();
  getDb()
    .prepare(`INSERT INTO memberships (id, org_id, user_id, role, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(id("memship"), orgId, userId, role, now);
}

export function createProject(orgId: string, brandId: string, name: string): Project {
  const now = new Date().toISOString();
  const project = { id: id("proj"), orgId, brandId, name, createdAt: now };
  getDb()
    .prepare(`INSERT INTO projects (id, org_id, brand_id, name, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(project.id, orgId, brandId, name, now);
  return project;
}

export function listProjects(orgId: string): Project[] {
  const rows = getDb()
    .prepare(`SELECT * FROM projects WHERE org_id = ? ORDER BY created_at`)
    .all(orgId) as Array<{
    id: string;
    org_id: string;
    brand_id: string;
    name: string;
    created_at: string;
  }>;
  return rows.map((r) => ({
    id: r.id,
    orgId: r.org_id,
    brandId: r.brand_id,
    name: r.name,
    createdAt: r.created_at,
  }));
}

export function getProject(projectId: string): Project | null {
  const row = getDb().prepare(`SELECT * FROM projects WHERE id = ?`).get(projectId) as
    | { id: string; org_id: string; brand_id: string; name: string; created_at: string }
    | undefined;
  if (!row) return null;
  return { id: row.id, orgId: row.org_id, brandId: row.brand_id, name: row.name, createdAt: row.created_at };
}
