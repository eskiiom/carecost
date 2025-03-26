export interface RegisterDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ResetPasswordDTO {
  email: string;
}

export interface UpdatePasswordDTO {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
} 