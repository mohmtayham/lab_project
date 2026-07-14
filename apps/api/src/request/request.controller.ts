import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Test Requests')
@ApiBearerAuth()
@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Get()
  @RequirePermissions('requests.read')
  @ApiQuery({ name: 'status', enum: RequestStatus, required: false })
  findAll(@Query() query: PaginationQueryDto, @Query('status') status?: RequestStatus) {
    return this.requestService.findAll({ ...query, status });
  }

  @Get(':id')
  @RequirePermissions('requests.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestService.findOne(id);
  }

  @Post()
  @RequirePermissions('requests.write')
  create(@Body() dto: CreateRequestDto, @CurrentUser('id') userId: number) {
    return this.requestService.create(dto, userId);
  }

  @Patch(':id/status')
  @RequirePermissions('requests.write')
  setStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRequestStatusDto) {
    return this.requestService.setStatus(id, dto.status);
  }

  @Delete(':id')
  @RequirePermissions('requests.write')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestService.remove(id);
  }
}
