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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Tests')
@ApiBearerAuth()
@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  @RequirePermissions('tests.read')
  findAll(@Query() query: PaginationQueryDto) {
    return this.testService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('tests.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.testService.findOne(id);
  }

  @Post()
  @RequirePermissions('tests.write')
  create(@Body() dto: CreateTestDto) {
    return this.testService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('tests.write')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTestDto) {
    return this.testService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('tests.write')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.testService.remove(id);
  }
}
