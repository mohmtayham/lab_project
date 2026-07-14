import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateRequestStatusDto {
  @ApiPropertyOptional({ enum: RequestStatus })
  @IsEnum(RequestStatus)
  status: RequestStatus;
}

export { RequestStatus };
