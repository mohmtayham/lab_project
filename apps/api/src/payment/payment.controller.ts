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
import { PaymentStatus } from '@prisma/client';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @RequirePermissions('payments.read')
  @ApiQuery({ name: 'status', enum: PaymentStatus, required: false })
  findAll(@Query() query: PaginationQueryDto, @Query('status') status?: PaymentStatus) {
    return this.paymentService.findAll({ ...query, status });
  }

  @Get(':id')
  @RequirePermissions('payments.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findOne(id);
  }

  @Post()
  @RequirePermissions('payments.write')
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentService.create(dto);
  }

  @Patch(':id/pay')
  @RequirePermissions('payments.write')
  pay(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.setStatus(id, PaymentStatus.paid);
  }

  @Patch(':id/refund')
  @RequirePermissions('payments.write')
  refund(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.setStatus(id, PaymentStatus.refunded);
  }

  @Patch(':id/cancel')
  @RequirePermissions('payments.write')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.setStatus(id, PaymentStatus.cancelled);
  }

  @Delete(':id')
  @RequirePermissions('payments.write')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.remove(id);
  }
}
