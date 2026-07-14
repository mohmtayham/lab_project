import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CacheHeader } from 'src/common/decorators/cache-header.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions('roles.read')
  @CacheHeader(60)

  findAll() {
    return this.prisma.role.findMany({
      include: { rolePermissions: { include: { permission: true } } },
      orderBy: { name: 'asc' },
    });
  }

  @Get('permissions')
  @RequirePermissions('roles.read')
   @CacheHeader(300)
  permissions() {
    return this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
  }
}
