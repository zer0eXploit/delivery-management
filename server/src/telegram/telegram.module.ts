import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramService } from './telegram.service';

import { Message } from '../chat/entities/message.entity';
import { DeliveryPerson } from '../delivery-persons/entities/delivery-person.entity';
import { KnowledgeEmbedding } from '../chat/entities/knowledge-embedding.entity';
import { DeliveryRequestsModule } from 'src/delivery-requests/delivery-requests.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryPerson, Message, KnowledgeEmbedding]),
    DeliveryRequestsModule,
  ],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
