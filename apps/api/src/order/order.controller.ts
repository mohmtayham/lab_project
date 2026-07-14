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
import { OrderStatus } from '@prisma/client';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @RequirePermissions('orders.read')
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  findAll(@Query() query: PaginationQueryDto, @Query('status') status?: OrderStatus) {
    return this.orderService.findAll({ ...query, status });
  }

  @Get(':id')
  @RequirePermissions('orders.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }

  @Post()
  @RequirePermissions('orders.write')
  create(@Body() dto: CreateOrderDto, @CurrentUser('id') userId: number) {
    return this.orderService.create(dto, userId);
  }

  @Patch(':id')
  @RequirePermissions('orders.write')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) {
    return this.orderService.update(id, dto);
  }

  @Patch(':id/approve')
  @RequirePermissions('orders.write')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.setStatus(id, OrderStatus.approved);
  }

  @Patch(':id/cancel')
  @RequirePermissions('orders.write')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.setStatus(id, OrderStatus.cancelled);
  }

  @Delete(':id')
  @RequirePermissions('orders.write')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.remove(id);
  }
}
