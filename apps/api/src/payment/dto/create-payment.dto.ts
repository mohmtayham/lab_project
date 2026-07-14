import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  orderId: number;

  @ApiPropertyOptional({
    type: [Number],
    description: 'Specific request-item ids to bill. Omit to bill every item on the order.',
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  requestItemIds?: number[];

  @ApiPropertyOptional({ example: 10, description: 'Discount percentage (0-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  discountPercentage?: number;
}
