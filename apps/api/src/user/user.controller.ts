// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   ParseIntPipe,
//   Patch,
//   Post,
//   Query,
// } from '@nestjs/common';
// import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// import { UserService } from './user.service';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
// import { RequirePermissions } from '../auth/decorators/permissions.decorator';
// import { CurrentUser } from '../common/decorators/current-user.decorator';
// import { CurrentUserData } from '../auth/types/auth-jwtPayload';

// @ApiTags('Users')
// @ApiBearerAuth()
// @Controller('users')
// export class UserController {
//   constructor(private readonly userService: UserService) {}

//   @Get('me')
//   me(@CurrentUser() user: CurrentUserData) {
//     return user;
//   }

//   @Get()
//   @RequirePermissions('users.read')
//   findAll(@Query() query: PaginationQueryDto) {
//     return this.userService.findAll(query);
//   }

//   @Get(':id')
//   @RequirePermissions('users.read')
//   findOne(@Param('id', ParseIntPipe) id: number) {
//     return this.userService.findOne(id);
//   }

//   @Post()
//   @RequirePermissions('users.write')
//   create(@Body() dto: CreateUserDto) {
//     return this.userService.create(dto);
//   }

//   @Patch(':id')
//   @RequirePermissions('users.write')
//   update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
//     return this.userService.update(id, dto);
//   }

//   @Delete(':id')
//   @RequirePermissions('users.write')
//   remove(@Param('id', ParseIntPipe) id: number) {
//     return this.userService.remove(id);
//   }
// }
// {
//   "name": "labsphere-api",
//   "version": "1.0.0",
//   "description": "LabSphere - Laboratory Information System API (NestJS + Prisma)",
//   "private": true,
//   "scripts": {
//     "build": "nest build",
//     "format": "prettier --write \"src/**/*.ts\"",
//     "start": "nest start",
//     "start:dev": "nest start --watch",
//     "start:debug": "nest start --debug --watch",
//     "start:prod": "node dist/main",
//     "lint": "eslint \"{src,test}/**/*.ts\" --fix",
//     "prisma:generate": "prisma generate",
//     "prisma:migrate": "prisma migrate dev",
//     "prisma:deploy": "prisma migrate deploy",
//     "prisma:studio": "prisma studio",
//     "db:seed": "ts-node prisma/seed.ts"
//   },
//   "prisma": {
//     "seed": "ts-node prisma/seed.ts"
//   },
//   "dependencies": {
//     "@nestjs/common": "^10.4.4",
//     "@nestjs/config": "^3.2.3",
//     "@nestjs/core": "^10.4.4",
//     "@nestjs/jwt": "^10.2.0",
//     "@nestjs/passport": "^10.0.3",
//     "@nestjs/platform-express": "^10.4.4",
//     "@nestjs/swagger": "^7.4.2",
//     "@nestjs/throttler": "^6.2.1",
//     "@prisma/client": "^5.20.0",
//     "argon2": "^0.41.1",
//     "class-transformer": "^0.5.1",
//     "class-validator": "^0.14.1",
//     "helmet": "^8.0.0",
//     "passport": "^0.7.0",
//     "passport-jwt": "^4.0.1",
//     "passport-local": "^1.0.0",
//     "reflect-metadata": "^0.2.2",
//     "rxjs": "^7.8.1"
//   },
//   "devDependencies": {
//     "@nestjs/cli": "^10.4.5",
//     "@nestjs/schematics": "^10.1.4",
//     "@types/express": "^5.0.0",
//     "@types/node": "^22.7.4",
//     "@types/passport-jwt": "^4.0.1",
//     "@types/passport-local": "^1.0.38",
//     "prisma": "^5.20.0",
//     "ts-node": "^10.9.2",
//     "typescript": "^5.6.2"
//   }
// }

import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentUserData } from '../auth/types/auth-jwtPayload';
import { AuthService } from '../auth/auth.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @Get('me')
  me(@CurrentUser() user: CurrentUserData) {
    return user;
  }

  @Get()
  @RequirePermissions('users.read')
  findAll(@Query() query: PaginationQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('users.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  @RequirePermissions('users.write')
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('users.write')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    const result = await this.userService.update(id, dto);
    // Role/permission changes must take effect immediately, not after the cache TTL.
    this.authService.invalidateUserCache(id);
    return result;
  }

  @Delete(':id')
  @RequirePermissions('users.write')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.userService.remove(id);
    this.authService.invalidateUserCache(id);
    return result;
  }
}