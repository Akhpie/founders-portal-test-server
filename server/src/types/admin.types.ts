// types/admin.types.ts
export interface AdminCreateInput {
  fullName: string;
  email: string;
  password: string;
  role?: "super_admin" | "admin" | "moderator";
  permissions?: string[];
}

export interface AdminUpdateInput {
  fullName?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  role?: "super_admin" | "admin" | "moderator";
  permissions?: string[];
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
}

export interface AdminLoginInput {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface AdminResponse {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  permissions: string[];
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminLoginResponse {
  token: string;
  admin: AdminResponse;
}

export interface JWTPayload {
  id: string;
  role: string;
  permissions: string[];
}

export interface TokenPayload {
  id: string;
  adminemail: string;
  adminrole: string;
  profilePic?: string;
  tokenVersion: number;
}
