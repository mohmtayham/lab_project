import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateResultDto {
  @ApiPropertyOptional({ example: '6.1' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;
}

export class RejectResultDto {
  @ApiPropertyOptional({ example: 'Sample haemolysed, please recollect' })
  @IsOptional()
  @IsString()
  reason?: string;
}
