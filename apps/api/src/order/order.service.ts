import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationQueryDto, paginate } from '../common/dto/pagination-query.dto';

const orderInclude = {
  patient: true,
  doctor: { select: { id: true, name: true, email: true } },
  requests: { include: { items: { include: { test: true } } } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto, createdBy?: number) {
    const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });
    if (!patient) throw new BadRequestException('Patient not found');

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: { patientId: dto.patientId, doctorId: dto.doctorId, notes: dto.notes },
      });

      // Optionally spin up a test request with items in the same transaction.
      if (dto.testIds?.length) {
        const tests = await tx.test.findMany({ where: { id: { in: dto.testIds } } });
        if (tests.length !== dto.testIds.length) throw new BadRequestException('One or more tests not found');

        await tx.testRequest.create({
          data: {
            orderId: order.id,
            createdBy,
            items: { create: tests.map((t) => ({ testId: t.id })) },
          },
        });
      }

      return tx.order.findUnique({ where: { id: order.id }, include: orderInclude });
    });
  }

  async findAll(query: PaginationQueryDto & { status?: OrderStatus }) {
    const { page, limit, search, status } = query;
    const where: Prisma.OrderWhereInput = {
      ...(status ? { status } : {}),
      ...(search ? { patient: { is: { name: { contains: search } } } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({ where, include: orderInclude, orderBy: { createdAt: 'desc' }, ...paginate(page, limit) }),
      this.prisma.order.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: orderInclude });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: number, dto: UpdateOrderDto) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { doctorId: dto.doctorId, notes: dto.notes, status: dto.status },
      include: orderInclude,
    });
  }

  async setStatus(id: number, status: OrderStatus) {
    await this.findOne(id);
    return this.prisma.order.update({ where: { id }, data: { status }, include: orderInclude });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.order.delete({ where: { id } });
    return { id, deleted: true };
  }
}
