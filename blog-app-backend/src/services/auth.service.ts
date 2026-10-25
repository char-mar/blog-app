import { eq } from "drizzle-orm";

import { db } from "../config/db";
import * as schema from "../db/schema";
import { ConflictError, UnauthorizedError } from "../errors/app-error";
import { comparePassword, hashPassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import type {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UserMeDto,
} from "../dto/auth.dto";
import type { User } from "../types/models";
import type { JwtPayload } from "../types/jwt";

const { users, profiles } = schema;

export class AuthService {
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existing) {
      throw new ConflictError("Email already exists");
    }

    const passwordHash = await hashPassword(dto.password);

    const result = await db.transaction(
      async (tx): Promise<Pick<User, "id" | "email" | "role">> => {
        const [user] = await tx
          .insert(users)
          .values({
            name: dto.name,
            email: dto.email,
            passwordHash,
          })
          .returning({
            id: users.id,
            email: users.email,
            role: users.role,
          });

        if (!user) {
          throw new Error("Failed to create user");
        }

        await tx.insert(profiles).values({
          userId: user.id,
          displayName: dto.name,
        });

        return user;
      },
    );

    const token = generateToken({
      id: result.id,
      email: result.email,
      role: result.role,
    } satisfies JwtPayload);

    return { user: result, token };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isMatch = await comparePassword(dto.password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    } satisfies JwtPayload);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async me(userId: string): Promise<UserMeDto> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    const { passwordHash, ...rest } = user;

    return {
      ...rest,
      profile: profile ?? null,
    };
  }
}

export const authService = new AuthService();
