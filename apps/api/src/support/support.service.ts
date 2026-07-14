import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SupportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { PaginationQueryDto, paginate } from '../common/dto/pagination-query.dto';

const supportInclude = {
  patient: true,
  request: true,
} satisfies Prisma.SupportRequestInclude;

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSupportDto) {
    return this.prisma.supportRequest.create({
      data: {
        patientId: dto.patientId,
        requestId: dto.requestId,
        discountPercentage: dto.discountPercentage,
      },
      include: supportInclude,
    });
  }

  async findAll(query: PaginationQueryDto & { status?: SupportStatus }) {
    const { page, limit, status } = query;
    const where: Prisma.SupportRequestWhereInput = status ? { status } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.supportRequest.findMany({ where, include: supportInclude, orderBy: { createdAt: 'desc' }, ...paginate(page, limit) }),
      this.prisma.supportRequest.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const support = await this.prisma.supportRequest.findUnique({ where: { id }, include: supportInclude });
    if (!support) throw new NotFoundException('Support request not found');
    return support;
  }

  async setStatus(id: number, status: SupportStatus) {
    await this.findOne(id);
    return this.prisma.supportRequest.update({ where: { id }, data: { status }, include: supportInclude });
  }
}
