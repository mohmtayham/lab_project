import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateSampleDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  requestId: number;

  @ApiPropertyOptional({ example: 'Blood' })
  @IsOptional()
  @IsString()
  sampleType?: string;
}
