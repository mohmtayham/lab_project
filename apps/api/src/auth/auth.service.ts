// import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import type { ConfigType } from '@nestjs/config';
// import { hash, verify } from 'argon2';
// import { UserService } from '../user/user.service';
// import { CreateUserDto } from '../user/dto/create-user.dto';
// import refreshConfig from './config/refresh.config';
// import type { AuthJwtPayload, CurrentUserData } from './types/auth-jwtPayload';

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly userService: UserService,
//     private readonly jwtService: JwtService,
//     @Inject(refreshConfig.KEY)
//     private refreshTokenConfig: ConfigType<typeof refreshConfig>,
//   ) {}

//   /** Self-service registration — defaults to no roles (assigned later by an admin). */
//   async registerUser(dto: CreateUserDto) {
//     return this.userService.create(dto);
//   }

//   /** Used by LocalStrategy: verify credentials, return public projection. */
//   async validateLocalUser(email: string, password: string) {
//     const user = await this.userService.findByEmailRaw(email);
//     if (!user) throw new UnauthorizedException('Invalid credentials');
//     if (!user.isActive) throw new UnauthorizedException('Account is disabled');

//     const matched = await verify(user.password, password);
//     if (!matched) throw new UnauthorizedException('Invalid credentials');

//     return this.userService.toPublic(user);
//   }

//   /** Used by JwtStrategy: rebuild the current-user context from the token subject. */
//   async validateJwtUser(userId: number): Promise<CurrentUserData> {
//     const user = await this.userService.findByIdRaw(userId);
//     if (!user || !user.isActive) throw new UnauthorizedException('User not found or disabled');
//     const pub = this.userService.toPublic(user);
//     return {
//       id: pub.id,
//       email: pub.email,
//       name: pub.name,
//       roles: pub.roles,
//       permissions: pub.permissions,
//     };
//   }

//   async validateRefreshToken(userId: number, refreshToken: string) {
//     const user = await this.userService.findByIdRaw(userId);
//     if (!user || !user.hashedRefreshToken) throw new UnauthorizedException('Invalid refresh token');
//     const matched = await verify(user.hashedRefreshToken, refreshToken);
//     if (!matched) throw new UnauthorizedException('Invalid refresh token');
//     return { id: userId };
//   }

//   async login(user: { id: number; name: string; roles: string[] }) {
//     const { accessToken, refreshToken } = await this.generateTokens(user.id);
//     await this.userService.updateHashedRefreshToken(user.id, await hash(refreshToken));
//     return { id: user.id, name: user.name, roles: user.roles, accessToken, refreshToken };
//   }

//   async refreshToken(userId: number) {
//     const user = await this.userService.findByIdRaw(userId);
//     const pub = this.userService.toPublic(user);
//     const { accessToken, refreshToken } = await this.generateTokens(userId);
//     await this.userService.updateHashedRefreshToken(userId, await hash(refreshToken));
//     return { id: userId, name: pub.name, roles: pub.roles, accessToken, refreshToken };
//   }

//   async signOut(userId: number) {
//     await this.userService.updateHashedRefreshToken(userId, null);
//     return { success: true };
//   }

//   private async generateTokens(userId: number) {
//     const payload: AuthJwtPayload = { sub: userId };
//     const [accessToken, refreshToken] = await Promise.all([
//       this.jwtService.signAsync(payload),
//       this.jwtService.signAsync(payload, {
//         secret: this.refreshTokenConfig.secret,
//         expiresIn: this.refreshTokenConfig.expiresIn,
//       }),
//     ]);
//     return { accessToken, refreshToken };
//   }
// }

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import { hash, verify } from 'argon2';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import refreshConfig from './config/refresh.config';
import type { AuthJwtPayload, CurrentUserData } from './types/auth-jwtPayload';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
  ) {}

  /**
   * validateJwtUser runs on EVERY authenticated request (it's called from
   * JwtStrategy). The underlying query joins user -> userRoles -> role ->
   * rolePermissions -> permission, which is expensive to repeat on every
   * single API call a page makes. Cache the result briefly so navigating
   * between pages (which fires several requests at once) doesn't redo this
   * deep join for each one. TTL is short so role/permission edits still
   * take effect quickly; it's also invalidated explicitly on user update.
   */
  private readonly userCache = new Map<number, { value: CurrentUserData; expires: number }>();
  private readonly USER_CACHE_TTL_MS = 30_000;

  invalidateUserCache(userId: number) {
    this.userCache.delete(userId);
  }

  /** Self-service registration — defaults to no roles (assigned later by an admin). */
  async registerUser(dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  /** Used by LocalStrategy: verify credentials, return public projection. */
  async validateLocalUser(email: string, password: string) {
    const user = await this.userService.findByEmailRaw(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is disabled');

    const matched = await verify(user.password, password);
    if (!matched) throw new UnauthorizedException('Invalid credentials');

    return this.userService.toPublic(user);
  }

  /** Used by JwtStrategy: rebuild the current-user context from the token subject. */
  async validateJwtUser(userId: number): Promise<CurrentUserData> {
    const cached = this.userCache.get(userId);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }

    const user = await this.userService.findByIdRaw(userId);
    if (!user || !user.isActive) throw new UnauthorizedException('User not found or disabled');
    const pub = this.userService.toPublic(user);
    const value: CurrentUserData = {
      id: pub.id,
      email: pub.email,
      name: pub.name,
      roles: pub.roles,
      permissions: pub.permissions,
    };

    this.userCache.set(userId, { value, expires: Date.now() + this.USER_CACHE_TTL_MS });
    return value;
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findByIdRaw(userId);
    if (!user || !user.hashedRefreshToken) throw new UnauthorizedException('Invalid refresh token');
    const matched = await verify(user.hashedRefreshToken, refreshToken);
    if (!matched) throw new UnauthorizedException('Invalid refresh token');
    return { id: userId };
  }

  async login(user: { id: number; name: string; roles: string[] }) {
    const { accessToken, refreshToken } = await this.generateTokens(user.id);
    await this.userService.updateHashedRefreshToken(user.id, await hash(refreshToken));
    return { id: user.id, name: user.name, roles: user.roles, accessToken, refreshToken };
  }

  async refreshToken(userId: number) {
    const user = await this.userService.findByIdRaw(userId);
    const pub = this.userService.toPublic(user);
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    await this.userService.updateHashedRefreshToken(userId, await hash(refreshToken));
    return { id: userId, name: pub.name, roles: pub.roles, accessToken, refreshToken };
  }

  async signOut(userId: number) {
    await this.userService.updateHashedRefreshToken(userId, null);
    return { success: true };
  }

  private async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.refreshTokenConfig.secret,
        expiresIn: this.refreshTokenConfig.expiresIn,
      }),
    ]);
    return { accessToken, refreshToken };
  }
}