import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { PaginationQueryDto, paginate } from '../common/dto/pagination-query.dto';

const requestInclude = {
  order: { include: { patient: true } },
  creator: { select: { id: true, name: true } },
  items: { include: { test: true, results: true } },
  samples: true,
} satisfies Prisma.TestRequestInclude;

@Injectable()
export class RequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRequestDto, createdBy?: number) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new BadRequestException('Order not found');

    const tests = await this.prisma.test.findMany({ where: { id: { in: dto.testIds } } });
    if (tests.length !== dto.testIds.length) throw new BadRequestException('One or more tests not found');

    return this.prisma.testRequest.create({
      data: {
        orderId: dto.orderId,
        createdBy,
        items: { create: tests.map((t) => ({ testId: t.id })) },
      },
      include: requestInclude,
    });
  }

  async findAll(query: PaginationQueryDto & { status?: RequestStatus }) {
    const { page, limit, status } = query;
    const where: Prisma.TestRequestWhereInput = status ? { status } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.testRequest.findMany({ where, include: requestInclude, orderBy: { createdAt: 'desc' }, ...paginate(page, limit) }),
      this.prisma.testRequest.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const request = await this.prisma.testRequest.findUnique({ where: { id }, include: requestInclude });
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  async setStatus(id: number, status: RequestStatus) {
    await this.findOne(id);
    return this.prisma.testRequest.update({ where: { id }, data: { status }, include: requestInclude });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.testRequest.delete({ where: { id } });
    return { id, deleted: true };
  }
}
