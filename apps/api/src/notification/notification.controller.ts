import { Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findMine(@CurrentUser('id') userId: number) {
    return this.notificationService.findForUser(userId);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser('id') userId: number) {
    return this.notificationService.unreadCount(userId);
  }

  @Patch(':id/read')
  markRead(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.notificationService.markRead(id, userId);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser('id') userId: number) {
    return this.notificationService.markAllRead(userId);
  }
}
