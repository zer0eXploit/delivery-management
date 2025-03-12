import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramService } from './telegram.service';

import { User } from '../users/entities/user.entity';
import { DeliveryPerson } from '../delivery-persons/entities/delivery-person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, DeliveryPerson])],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
