import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaginationQueryDto, paginate } from '../common/dto/pagination-query.dto';

const paymentInclude = {
  patient: true,
  order: true,
  items: { include: { requestItem: { include: { test: true } } } },
} satisfies Prisma.PaymentInclude;

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { requests: { include: { items: { include: { test: true } } } } },
    });
    if (!order) throw new BadRequestException('Order not found');

    // Flatten every request item on the order, then optionally filter to the requested subset.
    let items = order.requests.flatMap((r) => r.items);
    if (dto.requestItemIds?.length) {
      const wanted = new Set(dto.requestItemIds);
      items = items.filter((i) => wanted.has(Number(i.id)));
    }
    if (items.length === 0) throw new BadRequestException('No billable items found for this order');

    const discount = dto.discountPercentage ?? 0;
    const factor = (100 - discount) / 100;

    const lineItems = items.map((i) => ({
      requestItemId: i.id,
      price: new Prisma.Decimal(i.test.price).mul(factor),
    }));
    const total = lineItems.reduce((sum, li) => sum.add(li.price), new Prisma.Decimal(0));

    return this.prisma.payment.create({
      data: {
        orderId: order.id,
        patientId: order.patientId,
        totalAmount: total,
        items: { create: lineItems },
      },
      include: paymentInclude,
    });
  }

  async findAll(query: PaginationQueryDto & { status?: PaymentStatus }) {
    const { page, limit, status } = query;
    const where: Prisma.PaymentWhereInput = status ? { status } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({ where, include: paymentInclude, orderBy: { createdAt: 'desc' }, ...paginate(page, limit) }),
      this.prisma.payment.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({ where: { id }, include: paymentInclude });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async setStatus(id: number, status: PaymentStatus) {
    await this.findOne(id);
    return this.prisma.payment.update({ where: { id }, data: { status }, include: paymentInclude });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.payment.delete({ where: { id } });
    return { id, deleted: true };
  }
}
