import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DeviceService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateDeviceDto) {
    return this.prisma.device.create({
      data: {
        name: dto.name,
        status: dto.status,
        calibratedAt: dto.calibratedAt ? new Date(dto.calibratedAt) : undefined,
      },
    });
  }

  findAll() {
    return this.prisma.device.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const device = await this.prisma.device.findUnique({ where: { id } });
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  async update(id: number, dto: UpdateDeviceDto) {
    await this.findOne(id);
    return this.prisma.device.update({
      where: { id },
      data: {
        name: dto.name,
        status: dto.status,
        calibratedAt: dto.calibratedAt ? new Date(dto.calibratedAt) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.device.delete({ where: { id } });
    return { id, deleted: true };
  }
}
