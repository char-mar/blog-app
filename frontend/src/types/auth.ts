export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: AuthUser;
  };
}

export interface MeResponse {
  success: boolean;
  message?: string;
  data: AuthUser;
}

export interface AuthFormData {
  email: string;
  password: string;
}

export interface RegisterFormData extends AuthFormData {
  name: string;
}
