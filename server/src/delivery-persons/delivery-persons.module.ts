import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeliveryJob } from './entities/delivery-job.entity';
import { DeliveryPerson } from './entities/delivery-person.entity';

import { DeliveryPersonsService } from './delivery-persons.service';
import { DeliveryPersonsResolver } from './delivery-persons.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryPerson, DeliveryJob])],
  providers: [DeliveryPersonsService, DeliveryPersonsResolver],
  exports: [DeliveryPersonsService],
})
export class DeliveryPersonsModule {}
