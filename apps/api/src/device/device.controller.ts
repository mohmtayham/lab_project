import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Devices')
@ApiBearerAuth()
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  @RequirePermissions('devices.read')
  findAll() {
    return this.deviceService.findAll();
  }

  @Get(':id')
  @RequirePermissions('devices.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deviceService.findOne(id);
  }

  @Post()
  @RequirePermissions('devices.write')
  create(@Body() dto: CreateDeviceDto) {
    return this.deviceService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('devices.write')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDeviceDto) {
    return this.deviceService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('devices.write')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deviceService.remove(id);
  }
}
