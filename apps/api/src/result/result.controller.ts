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
import { ResultStatus } from '@prisma/client';
import { ResultService } from './result.service';
import { CreateResultDto } from './dto/create-result.dto';
import { RejectResultDto, UpdateResultDto } from './dto/update-result.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Results')
@ApiBearerAuth()
@Controller('results')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Get()
  @RequirePermissions('results.read')
  @ApiQuery({ name: 'status', enum: ResultStatus, required: false })
  findAll(@Query() query: PaginationQueryDto, @Query('status') status?: ResultStatus) {
    return this.resultService.findAll({ ...query, status });
  }

  @Get(':id')
  @RequirePermissions('results.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.resultService.findOne(id);
  }

  @Post()
  @RequirePermissions('results.write')
  create(@Body() dto: CreateResultDto, @CurrentUser('id') userId: number) {
    return this.resultService.create(dto, userId);
  }

  @Patch(':id')
  @RequirePermissions('results.write')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResultDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.resultService.update(id, dto, userId);
  }

  @Patch(':id/review')
  @RequirePermissions('results.review')
  review(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.resultService.review(id, userId);
  }

  @Patch(':id/approve')
  @RequirePermissions('results.approve')
  approve(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.resultService.approve(id, userId);
  }

  @Patch(':id/reject')
  @RequirePermissions('results.review')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectResultDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.resultService.reject(id, dto.reason, userId);
  }
}
