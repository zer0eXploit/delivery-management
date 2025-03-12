import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Address } from './entities/address.entity';

import { UsersModule } from 'src/users/users.module';
import { TownshipsModule } from '../townships/townships.module';

import { AddressesService } from './addresses.service';
import { AddressesResolver } from './addresses.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Address]), TownshipsModule, UsersModule],
  providers: [AddressesResolver, AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
