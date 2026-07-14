import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RequestItemStatus, ResultStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { PaginationQueryDto, paginate } from '../common/dto/pagination-query.dto';

const resultInclude = {
  requestItem: { include: { test: true, request: { include: { order: { include: { patient: true } } } } } },
  device: true,
  enteredByUser: { select: { id: true, name: true } },
  reviewedByUser: { select: { id: true, name: true } },
  approvedByUser: { select: { id: true, name: true } },
  history: { include: { changedByUser: { select: { id: true, name: true } } }, orderBy: { changedAt: 'desc' } },
} satisfies Prisma.ResultInclude;

@Injectable()
export class ResultService {
  constructor(private readonly prisma: PrismaService) {}

  /** Enter a new result value for a request item and move the item into analysis→completed. */
  async create(dto: CreateResultDto, enteredBy?: number) {
    const item = await this.prisma.testRequestItem.findUnique({ where: { id: dto.requestItemId } });
    if (!item) throw new BadRequestException('Request item not found');

    return this.prisma.$transaction(async (tx) => {
      const result = await tx.result.create({
        data: {
          requestItemId: dto.requestItemId,
          deviceId: dto.deviceId,
          value: dto.value,
          comments: dto.comments,
          status: ResultStatus.entered,
          enteredBy,
        },
      });
      await tx.resultHistory.create({
        data: { resultId: result.id, oldValue: null, newValue: dto.value, changedBy: enteredBy },
      });
      await tx.testRequestItem.update({
        where: { id: dto.requestItemId },
        data: { status: RequestItemStatus.in_analysis },
      });
      return tx.result.findUnique({ where: { id: result.id }, include: resultInclude });
    });
  }

  async findAll(query: PaginationQueryDto & { status?: ResultStatus }) {
    const { page, limit, status } = query;
    const where: Prisma.ResultWhereInput = status ? { status } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.result.findMany({ where, include: resultInclude, orderBy: { createdAt: 'desc' }, ...paginate(page, limit) }),
      this.prisma.result.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const result = await this.prisma.result.findUnique({ where: { id }, include: resultInclude });
    if (!result) throw new NotFoundException('Result not found');
    return result;
  }

  /** Correct a result value; any change is recorded in result_history. */
  async update(id: number, dto: UpdateResultDto, changedBy?: number) {
    const current = await this.findOne(id);
    if (current.status === ResultStatus.approved) {
      throw new BadRequestException('Approved results cannot be edited');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.value !== undefined && dto.value !== current.value) {
        await tx.resultHistory.create({
          data: { resultId: id, oldValue: current.value, newValue: dto.value, changedBy },
        });
      }
      await tx.result.update({
        where: { id },
        data: { value: dto.value ?? current.value, comments: dto.comments ?? current.comments },
      });
      return tx.result.findUnique({ where: { id }, include: resultInclude });
    });
  }

  async review(id: number, reviewedBy?: number) {
    const current = await this.findOne(id);
    if (current.status !== ResultStatus.entered) {
      throw new BadRequestException('Only entered results can be reviewed');
    }
    return this.prisma.result.update({
      where: { id },
      data: { status: ResultStatus.reviewed, reviewedBy },
      include: resultInclude,
    });
  }

  async approve(id: number, approvedBy?: number) {
    const current = await this.findOne(id);
    if (current.status !== ResultStatus.reviewed && current.status !== ResultStatus.entered) {
      throw new BadRequestException('Only reviewed/entered results can be approved');
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.result.update({
        where: { id },
        data: { status: ResultStatus.approved, approvedBy, approvedAt: new Date() },
      });
      await tx.testRequestItem.update({
        where: { id: updated.requestItemId },
        data: { status: RequestItemStatus.completed },
      });
      return tx.result.findUnique({ where: { id }, include: resultInclude });
    });
  }

  async reject(id: number, reason?: string, reviewedBy?: number) {
    const current = await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.result.update({
        where: { id },
        data: {
          status: ResultStatus.rejected,
          reviewedBy,
          comments: reason ? `${current.comments ?? ''}\n[Rejected] ${reason}`.trim() : current.comments,
        },
      });
      await tx.testRequestItem.update({
        where: { id: updated.requestItemId },
        data: { status: RequestItemStatus.rejected },
      });
      return tx.result.findUnique({ where: { id }, include: resultInclude });
    });
  }
}
