export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    role: "user" | "admin";
  };
  token: string;
}

export interface UserMeDto {
  id: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
  profile?: {
    userId: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
}
