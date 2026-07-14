import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { PaginationQueryDto, paginate } from '../common/dto/pagination-query.dto';

@Injectable()
export class TestService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTestDto) {
    return this.prisma.test.create({ data: dto });
  }

  async findAll(query: PaginationQueryDto) {
    const { page, limit, search } = query;
    const where = search
      ? { OR: [{ name: { contains: search } }, { category: { contains: search } }] }
      : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.test.findMany({ where, orderBy: { name: 'asc' }, ...paginate(page, limit) }),
      this.prisma.test.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const test = await this.prisma.test.findUnique({ where: { id } });
    if (!test) throw new NotFoundException('Test not found');
    return test;
  }

  async update(id: number, dto: UpdateTestDto) {
    await this.findOne(id);
    return this.prisma.test.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.test.delete({ where: { id } });
    return { id, deleted: true };
  }
}
