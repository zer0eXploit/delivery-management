import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  controllers: [WebhookController],
  providers: [WebhookService],
  imports: [TelegramModule],
})
export class WebhookModule {}
