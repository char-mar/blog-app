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
import type { User, Profile } from "../types/models";
import type { JwtPayload } from "../types/jwt";

const { users, profiles } = schema;

export class AuthService {
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await db.query.users!.findFirst();

    if (existing && existing.email === dto.email) {
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
    const user = await db.query.users!.findFirst();

    if (!user || user.email !== dto.email) {
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

  async me(_userId: string): Promise<UserMeDto> {
    const user = await db.query.users!.findFirst({
      with: {
        profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const { passwordHash, ...rest } = user as unknown as User & {
      profile?: Profile | null;
    };

    return rest as UserMeDto;
  }
}

export const authService = new AuthService();
