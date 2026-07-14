import { ApiProperty } from '@nestjs/swagger';
import { SampleStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateSampleStatusDto {
  @ApiProperty({ enum: SampleStatus })
  @IsEnum(SampleStatus)
  status: SampleStatus;
}
