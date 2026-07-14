import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions('roles.read')
  findAll() {
    return this.prisma.role.findMany({
      include: { rolePermissions: { include: { permission: true } } },
      orderBy: { name: 'asc' },
    });
  }

  @Get('permissions')
  @RequirePermissions('roles.read')
  permissions() {
    return this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
  }
}
