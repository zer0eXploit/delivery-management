import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Township } from './entities/township.entity';

import { TownshipsService } from './townships.service';
import { TownshipsResolver } from './townships.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Township])],
  providers: [TownshipsResolver, TownshipsService],
  exports: [TownshipsService],
})
export class TownshipsModule {}
