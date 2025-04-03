import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from '../../email/email.module';
import { TwoFactorService } from './two-factor.service';
import { TwoFactorToken } from './entities/two-factor-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TwoFactorToken]), EmailModule],
  providers: [TwoFactorService],
  exports: [TwoFactorService],
})
export class TwoFactorModule {}
