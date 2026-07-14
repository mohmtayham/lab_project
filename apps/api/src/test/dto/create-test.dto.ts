import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTestDto {
  @ApiProperty({ example: 'Complete Blood Count (CBC)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Hematology' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Blood' })
  @IsOptional()
  @IsString()
  sampleType?: string;

  @ApiProperty({ example: 25.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: '58410-2' })
  @IsOptional()
  @IsString()
  loincCode?: string;

  @ApiPropertyOptional({ example: 'cells/µL' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: '4.5-11.0 x10^3' })
  @IsOptional()
  @IsString()
  referenceRange?: string;
}
