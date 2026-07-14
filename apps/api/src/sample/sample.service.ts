import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SampleStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { PaginationQueryDto, paginate } from '../common/dto/pagination-query.dto';

const sampleInclude = {
  request: { include: { order: { include: { patient: true } } } },
  collector: { select: { id: true, name: true } },
} satisfies Prisma.SampleInclude;

@Injectable()
export class SampleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSampleDto, collectedBy?: number) {
    const request = await this.prisma.testRequest.findUnique({ where: { id: dto.requestId } });
    if (!request) throw new BadRequestException('Request not found');

    return this.prisma.sample.create({
      data: {
        requestId: dto.requestId,
        collectedBy,
        sampleType: dto.sampleType,
        qrCode: `SMP-${randomUUID().slice(0, 8).toUpperCase()}`,
        collectedAt: new Date(),
        status: SampleStatus.collected,
      },
      include: sampleInclude,
    });
  }

  async findAll(query: PaginationQueryDto & { status?: SampleStatus }) {
    const { page, limit, status } = query;
    const where: Prisma.SampleWhereInput = status ? { status } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.sample.findMany({ where, include: sampleInclude, orderBy: { createdAt: 'desc' }, ...paginate(page, limit) }),
      this.prisma.sample.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const sample = await this.prisma.sample.findUnique({ where: { id }, include: sampleInclude });
    if (!sample) throw new NotFoundException('Sample not found');
    return sample;
  }

  async setStatus(id: number, status: SampleStatus) {
    await this.findOne(id);
    return this.prisma.sample.update({ where: { id }, data: { status }, include: sampleInclude });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.sample.delete({ where: { id } });
    return { id, deleted: true };
  }
}
