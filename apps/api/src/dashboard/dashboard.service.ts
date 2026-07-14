import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus, ResultStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Headline counters shown on the dashboard cards. */
  async stats() {
    const [
      patients,
      pendingOrders,
      inProgressRequests,
      pendingResults,
      paidAgg,
      devices,
    ] = await this.prisma.$transaction([
      this.prisma.patient.count(),
      this.prisma.order.count({ where: { status: OrderStatus.pending } }),
      this.prisma.testRequest.count({ where: { status: 'in_progress' } }),
      this.prisma.result.count({ where: { status: { in: [ResultStatus.entered, ResultStatus.reviewed] } } }),
      this.prisma.payment.aggregate({ _sum: { totalAmount: true }, where: { status: PaymentStatus.paid } }),
      this.prisma.device.count({ where: { status: 'active' } }),
    ]);

    return {
      patients,
      pendingOrders,
      inProgressRequests,
      pendingResults,
      revenue: Number(paidAgg._sum.totalAmount ?? 0),
      activeDevices: devices,
    };
  }

  /** Orders created per day for the last 7 days — feeds the dashboard chart. */
  async ordersTrend() {
    const days = 7;
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    const buckets: { date: string; count: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      buckets.push({ date: key, count: 0 });
    }
    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      const bucket = buckets.find((b) => b.date === key);
      if (bucket) bucket.count++;
    }
    return buckets;
  }

  /** Distribution of results by status — feeds the donut chart. */
  async resultsByStatus() {
    const grouped = await this.prisma.result.groupBy({ by: ['status'], _count: { _all: true } });
    return grouped.map((g) => ({ status: g.status, count: g._count._all }));
  }

  async recentActivity() {
    const [orders, results] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { patient: { select: { name: true } } },
      }),
      this.prisma.result.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { requestItem: { include: { test: { select: { name: true } } } } },
      }),
    ]);
    return { orders, results };
  }
}
