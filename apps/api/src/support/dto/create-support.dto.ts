import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreateSupportDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  patientId: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  requestId?: number;

  @ApiProperty({ example: 25, description: 'Requested discount percentage (0-100)' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  discountPercentage: number;
}
