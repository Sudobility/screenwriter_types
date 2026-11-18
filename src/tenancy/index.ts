import { z } from 'zod';

export const ENTITY_KINDS = ['personal', 'organization'] as const;
export type EntityKind = (typeof ENTITY_KINDS)[number];

/**
 * Entity roles, ordered by authority — unified with `@sudobility/entity_service`
 * (owner/manager/member). Collapsed from the former 5-role ladder: admin+writer
 * → manager (edit/manage), commenter+viewer → member (read). There is no longer
 * a comment-only or view-only tier.
 */
export const ROLES = ['owner', 'manager', 'member'] as const;
export type Role = (typeof ROLES)[number];

export const entityKindSchema = z.enum(ENTITY_KINDS);
export const roleSchema = z.enum(ROLES);

export interface ManagedEntitySummary {
  id: string;
  kind: EntityKind;
  name: string;
  avatarAssetId: string | null;
}

export interface ManagedEntity extends ManagedEntitySummary {
  defaultTemplateId: string | null;
  defaultLanguage: string;
  aiEnabled: boolean;
  /** F-SET-009: false disables every existing `anyone with the link` share link of the workspace and refuses new ones. */
  allowPublicLinks: boolean;
  createdAt: string;
  updatedAt: string;
}

/** `GET /entities` item: summary plus the caller's role. */
export type ManagedEntityListItem = ManagedEntitySummary & { role: Role };

/** `GET /entities/:wid` */
export type ManagedEntityDetail = ManagedEntity & {
  role: Role;
  memberCount: number;
  storageBytes: number;
};

// ─── Permissions (spec 05 §5.2) ─────────────────────────────────────────────

/**
 * Every permission with the LOWEST role that holds it. The matrix is monotonic (a higher role has
 * everything a lower one has), so `ROLE_PERMISSIONS` is derived from this table.
 * Notes on the two permissions with a condition beyond the role:
 *  - `share.manage` for a writer only applies to documents/projects they created (checked by the API).
 *  - `project.trash` / `project.restore` for a writer only applies to projects they created.
 */
export const PERMISSION_MIN_ROLE = {
  'entity.read': 'member',
  'entity.update': 'manager',
  'entity.aiToggle': 'owner',
  'entity.audit': 'manager',
  'entity.delete': 'owner',
  'entity.transfer': 'owner',
  'entity.leave': 'member',
  'members.read': 'member',
  'members.invite': 'manager',
  'members.updateRole': 'manager',
  'members.remove': 'manager',
  'project.create': 'manager',
  'project.read': 'member',
  'project.update': 'manager',
  'project.trash': 'manager',
  'project.restore': 'manager',
  'project.purge': 'manager',
  'document.create': 'manager',
  'document.read': 'member',
  'document.export': 'member',
  'document.edit': 'manager',
  'document.comment': 'member',
  'document.chat': 'member',
  'document.activity': 'member',
  'document.trash': 'manager',
  'document.restore': 'manager',
  'document.move': 'manager',
  'document.lock': 'manager',
  'document.aiExclude': 'manager',
  'snapshot.create': 'manager',
  'snapshot.open': 'manager',
  'snapshot.fork': 'manager',
  'snapshot.cherryPick': 'manager',
  'snapshot.appendNote': 'manager',
  'snapshot.read': 'member',
  'snapshot.compare': 'member',
  'snapshot.hideForSelf': 'member',
  'version.restore': 'manager',
  'version.restoreAsCopy': 'manager',
  'share.manage': 'manager',
  'assets.upload': 'manager',
  'assets.link': 'manager',
  'assets.read': 'member',
  'ai.run': 'manager',
  'ai.review': 'member',
  'jobs.media': 'manager',
  'templates.manage': 'manager',
  'reports.run': 'member',
  'apiKeys.use': 'member',
} as const satisfies Record<string, Role>;

export type Permission = keyof typeof PERMISSION_MIN_ROLE;
export const PERMISSIONS = Object.keys(PERMISSION_MIN_ROLE) as Permission[];

/** 0 = owner, 1 = manager, 2 = member; a smaller number is more authority. */
const RANK: Record<Role, number> = {
  owner: 0,
  manager: 1,
  member: 2,
};

/** True when `a` has at least the authority of `b`. */
export const roleAtLeast = (a: Role, b: Role): boolean => RANK[a] <= RANK[b];

/** The higher-authority of the given roles (nulls ignored); null when there are none. */
export function maxRole(...roles: (Role | null | undefined)[]): Role | null {
  let best: Role | null = null;
  for (const r of roles)
    if (r && (best === null || RANK[r] < RANK[best])) best = r;
  return best;
}

/** The lower-authority of two roles (used to cap an API key by its scope). */
export const minRole = (a: Role, b: Role): Role => (RANK[a] >= RANK[b] ? a : b);

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> =
  Object.fromEntries(
    ROLES.map((role) => [
      role,
      PERMISSIONS.filter((p) => roleAtLeast(role, PERMISSION_MIN_ROLE[p])),
    ])
  ) as unknown as Record<Role, readonly Permission[]>;

/** The only check routes call. */
export const hasPermission = (role: Role, permission: Permission): boolean =>
  roleAtLeast(role, PERMISSION_MIN_ROLE[permission]);

/** Lowest role that holds `permission` (goes in a 403's `details.requiredRole`). */
export const requiredRoleFor = (permission: Permission): Role =>
  PERMISSION_MIN_ROLE[permission];

/** Roles a share grant or a project/document invitation may carry: `owner` is never granted by share. */
export const SHARE_ROLES = ['manager', 'member'] as const;
export type ShareRole = (typeof SHARE_ROLES)[number];
