import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { TelegramModule } from 'src/telegram/telegram.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  controllers: [WebhookController],
  providers: [WebhookService],
  imports: [TelegramModule, PaymentsModule],
})
export class WebhookModule {}
