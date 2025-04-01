import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { DeliveryJob } from './entities/delivery-job.entity';
import { DeliveryPerson } from './entities/delivery-person.entity';
import { Timeline } from '../delivery-requests/entities/timeline.entity';
import { DeliveryRequest } from '../delivery-requests/entities/delivery-request.entity';

import { EmailModule } from '../email/email.module';
import { TelegramModule } from '../telegram/telegram.module';
import { DeliveryPersonsService } from './delivery-persons.service';
import { DeliveryPersonsResolver } from './delivery-persons.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Timeline,
      DeliveryJob,
      DeliveryPerson,
      DeliveryRequest,
    ]),
    EmailModule,
    TelegramModule,
  ],
  providers: [DeliveryPersonsService, DeliveryPersonsResolver],
  exports: [DeliveryPersonsService],
})
export class DeliveryPersonsModule {}
