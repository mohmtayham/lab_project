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
import { SampleStatus } from '@prisma/client';
import { SampleService } from './sample.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleStatusDto } from './dto/update-sample.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Samples')
@ApiBearerAuth()
@Controller('samples')
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Get()
  @RequirePermissions('samples.read')
  @ApiQuery({ name: 'status', enum: SampleStatus, required: false })
  findAll(@Query() query: PaginationQueryDto, @Query('status') status?: SampleStatus) {
    return this.sampleService.findAll({ ...query, status });
  }

  @Get(':id')
  @RequirePermissions('samples.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sampleService.findOne(id);
  }

  @Post()
  @RequirePermissions('samples.write')
  create(@Body() dto: CreateSampleDto, @CurrentUser('id') userId: number) {
    return this.sampleService.create(dto, userId);
  }

  @Patch(':id/status')
  @RequirePermissions('samples.write')
  setStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSampleStatusDto) {
    return this.sampleService.setStatus(id, dto.status);
  }

  @Delete(':id')
  @RequirePermissions('samples.write')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sampleService.remove(id);
  }
}
