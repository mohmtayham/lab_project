import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto, paginate } from '../common/dto/pagination-query.dto';

/** Selects a user together with its roles and flattened permissions. */
const userWithRoles = {
  userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
} as const;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private strip<T extends { password?: string; hashedRefreshToken?: string | null }>(user: T) {
    const { password, hashedRefreshToken, ...rest } = user;
    return rest;
  }

  /** Resolve role names → role ids, throwing if any name is unknown. */
  private async resolveRoleIds(roleNames: string[]) {
    const roles = await this.prisma.role.findMany({ where: { name: { in: roleNames } } });
    if (roles.length !== roleNames.length) {
      const found = new Set(roles.map((r) => r.name));
      const missing = roleNames.filter((n) => !found.has(n));
      throw new BadRequestException(`Unknown role(s): ${missing.join(', ')}`);
    }
    return roles.map((r) => r.id);
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const roleIds = dto.roles?.length ? await this.resolveRoleIds(dto.roles) : [];

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: await hash(dto.password),
        userRoles: { create: roleIds.map((roleId) => ({ roleId })) },
      },
      include: userWithRoles,
    });
    return this.toPublic(user);
  }

  async findAll(query: PaginationQueryDto) {
    const { page, limit, search } = query;
    const where = search
      ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
      : {};
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ where, include: userWithRoles, orderBy: { createdAt: 'desc' }, ...paginate(page, limit) }),
      this.prisma.user.count({ where }),
    ]);
    return {
      data: rows.map((u) => this.toPublic(u)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: userWithRoles });
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }

  /** Raw record (with password) — used internally by auth. */
  async findByEmailRaw(email: string) {
    return this.prisma.user.findUnique({ where: { email }, include: userWithRoles });
  }

  async findByIdRaw(id: number) {
    return this.prisma.user.findUnique({ where: { id }, include: userWithRoles });
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    const data: any = { name: dto.name, phone: dto.phone, email: dto.email, isActive: dto.isActive };
    if (dto.password) data.password = await hash(dto.password);

    if (dto.roles) {
      const roleIds = await this.resolveRoleIds(dto.roles);
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      data.userRoles = { create: roleIds.map((roleId) => ({ roleId })) };
    }

    const user = await this.prisma.user.update({ where: { id }, data, include: userWithRoles });
    return this.toPublic(user);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { id, deleted: true };
  }

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string | null) {
    return this.prisma.user.update({ where: { id: userId }, data: { hashedRefreshToken } });
  }

  /** Public projection: no secrets, roles + permissions flattened. */
  toPublic(user: any) {
    const roles: string[] = user.userRoles?.map((ur: any) => ur.role.name) ?? [];
    const permissions = Array.from(
      new Set(
        user.userRoles?.flatMap((ur: any) =>
          ur.role.rolePermissions?.map((rp: any) => rp.permission.name) ?? [],
        ) ?? [],
      ),
    ) as string[];
    return {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      roles,
      permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
