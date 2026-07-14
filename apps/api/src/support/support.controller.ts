import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SupportStatus } from '@prisma/client';
import { SupportService } from './support.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Support Requests')
@ApiBearerAuth()
@Controller('support-requests')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  @RequirePermissions('support.read')
  @ApiQuery({ name: 'status', enum: SupportStatus, required: false })
  findAll(@Query() query: PaginationQueryDto, @Query('status') status?: SupportStatus) {
    return this.supportService.findAll({ ...query, status });
  }

  @Get(':id')
  @RequirePermissions('support.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supportService.findOne(id);
  }

  @Post()
  @RequirePermissions('support.write')
  create(@Body() dto: CreateSupportDto) {
    return this.supportService.create(dto);
  }

  @Patch(':id/approve')
  @RequirePermissions('support.write')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.supportService.setStatus(id, SupportStatus.approved);
  }

  @Patch(':id/reject')
  @RequirePermissions('support.write')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.supportService.setStatus(id, SupportStatus.rejected);
  }
}
