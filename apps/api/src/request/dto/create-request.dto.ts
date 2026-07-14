import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  orderId: number;

  @ApiProperty({ type: [Number], example: [1, 2] })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  testIds: number[];
}
