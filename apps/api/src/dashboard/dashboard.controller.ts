import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  stats() {
    return this.dashboardService.stats();
  }

  @Get('orders-trend')
  ordersTrend() {
    return this.dashboardService.ordersTrend();
  }

  @Get('results-by-status')
  resultsByStatus() {
    return this.dashboardService.resultsByStatus();
  }

  @Get('recent-activity')
  recentActivity() {
    return this.dashboardService.recentActivity();
  }
}
