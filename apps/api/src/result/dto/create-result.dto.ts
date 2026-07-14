import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateResultDto {
  @ApiProperty({ example: 1, description: 'Test request item id' })
  @Type(() => Number)
  @IsInt()
  requestItemId: number;

  @ApiPropertyOptional({ example: 3, description: 'Analyzer device id' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  deviceId?: number;

  @ApiProperty({ example: '5.6' })
  @IsString()
  value: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;
}
