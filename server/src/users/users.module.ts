import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { DeliveryPersonsModule } from '../delivery-persons/delivery-persons.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), DeliveryPersonsModule],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
