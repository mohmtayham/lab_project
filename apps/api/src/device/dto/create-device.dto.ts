import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty({ example: 'Sysmex XN-1000 Analyzer' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: DeviceStatus, default: DeviceStatus.active })
  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @ApiPropertyOptional({ example: '2026-07-01T09:00:00Z' })
  @IsOptional()
  @IsDateString()
  calibratedAt?: string;
}
