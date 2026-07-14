import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PatientModule } from './patient/patient.module';
import { TestModule } from './test/test.module';
import { OrderModule } from './order/order.module';
import { RequestModule } from './request/request.module';
import { SampleModule } from './sample/sample.module';
import { DeviceModule } from './device/device.module';
import { ResultModule } from './result/result.module';
import { PaymentModule } from './payment/payment.module';
import { SupportModule } from './support/support.module';
import { NotificationModule } from './notification/notification.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { PermissionsGuard } from './auth/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    UserModule,
    RoleModule,
    PatientModule,
    TestModule,
    OrderModule,
    RequestModule,
    SampleModule,
    DeviceModule,
    ResultModule,
    PaymentModule,
    SupportModule,
    NotificationModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    // Global guard order: authenticate → role check → permission check → rate-limit.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
