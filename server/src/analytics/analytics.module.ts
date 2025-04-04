import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Payment } from '../payments/entities/payment.entity';
import { Township } from '../townships/entities/township.entity';
import { DeliveryJob } from '../delivery-persons/entities/delivery-job.entity';
import { DeliveryRequest } from '../delivery-requests/entities/delivery-request.entity';

import { AnalyticsService } from './analytics.service';
import { AnalyticsResolver } from './analytics.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryRequest, DeliveryJob, Payment, Township]),
  ],
  providers: [AnalyticsResolver, AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
