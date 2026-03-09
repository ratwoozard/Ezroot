/**
 * JWT claims and roles (OpenAPI / auth contract).
 */

export const ROLES = {
  admin: 'admin',
  user: 'user',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** JWT payload (claims). sub = user_id, org = org_id. */
export interface AuthClaims {
  sub: string;
  org: string;
  role: Role;
  email?: string;
}

export const JWT_ORG_CLAIM = 'org';
export const JWT_SUB_CLAIM = 'sub';
