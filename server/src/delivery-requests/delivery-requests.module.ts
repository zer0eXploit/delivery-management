import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Timeline } from './entities/timeline.entity';
import { Address } from '../addresses/entities/address.entity';
import { DeliveryRequest } from './entities/delivery-request.entity';

import { EmailModule } from '../email/email.module';

import { TrackingCodeGenerator } from './tracking-code.generator';
import { DeliveryRequestsService } from './delivery-requests.service';
import { DeliveryRequestsResolver } from './delivery-requests.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryRequest, Timeline, Address]),
    EmailModule,
  ],
  providers: [
    DeliveryRequestsResolver,
    DeliveryRequestsService,
    TrackingCodeGenerator,
  ],
  exports: [DeliveryRequestsService],
})
export class DeliveryRequestsModule {}
