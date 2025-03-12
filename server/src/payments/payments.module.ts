import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Payment } from './entities/payment.entity';

import { PaymentsService } from './payments.service';
import { PaymentsResolver } from './payments.resolver';

import { DeliveryRequestsModule } from '../delivery-requests/delivery-requests.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    ConfigModule,
    DeliveryRequestsModule,
  ],
  providers: [PaymentsService, PaymentsResolver],
})
export class PaymentsModule {}
