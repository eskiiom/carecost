import { Request } from 'express';

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface RegisterDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ResetPasswordDTO {
  email: string;
}

export interface UpdatePasswordDTO {
  currentPassword: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
    loginAttempts: number;
    lastLoginAttempt: Date | null;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
} 