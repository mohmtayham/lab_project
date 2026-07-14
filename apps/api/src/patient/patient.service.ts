import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationQueryDto, paginate } from '../common/dto/pagination-query.dto';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  /** Generate the next sequential patient number, e.g. P-000123. */
  private async nextPatientNumber(): Promise<string> {
    const last = await this.prisma.patient.findFirst({ orderBy: { id: 'desc' } });
    const nextId = last ? Number(last.id) + 1 : 1;
    return `P-${String(nextId).padStart(6, '0')}`;
  }

async create(dto: CreatePatientDto) {
    // 1. نستخدم المتغير created وننتظر النتيجة بدلاً من الإرجاع المباشر (return)
    const created = await this.prisma.patient.create({
      data: {
        // نمرر قيمة مؤقتة وعشوائية لتجنب خطأ الحقل الإجباري في Prisma
        // patientNumber: `TEMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        gender: dto.gender ?? 'unknown',
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });

    // 2. الآن أصبح لدينا الـ id الحقيقي، نقوم بتوليد الرقم النهائي
    const patientNumber = `P-${String(created.id).padStart(6, '0')}`;

    // 3. نقوم بتحديث المريض بالرقم النهائي ونعيده كاستجابة للمستخدم
    return this.prisma.patient.update({
      where: { id: created.id },
      data: { patientNumber },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const { page, limit, search } = query;
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { patientNumber: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.patient.findMany({ where, orderBy: { createdAt: 'desc' }, ...paginate(page, limit) }),
      this.prisma.patient.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        orders: { orderBy: { createdAt: 'desc' }, take: 10, include: { requests: true } },
        payments: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }
  private async ensureExists(id: number): Promise<void> {
    const exists = await this.prisma.patient.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Patient not found');
  }

  async update(id: number, dto: UpdatePatientDto) {
    await this.ensureExists(id);
    return this.prisma.patient.update({
      where: { id },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);

    await this.prisma.patient.delete({ where: { id } });
    return { id, deleted: true };
  }
}
