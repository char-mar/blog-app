import { apiRequest } from "./api";
import type {
  AuthFormData,
  AuthResponse,
  MeResponse,
  RegisterFormData,
} from "../types/auth";

export const authService = {
  register(data: RegisterFormData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  login(data: AuthFormData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  me(): Promise<MeResponse> {
    return apiRequest<MeResponse>("/auth/me");
  },

  logout(): Promise<{ success: boolean; message?: string }> {
    return apiRequest("/auth/logout", {
      method: "POST",
    });
  },
};
