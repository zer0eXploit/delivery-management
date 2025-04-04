import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { WebhookModule } from './webhook/webhook.module';
import { TelegramModule } from './telegram/telegram.module';
import { PaymentsModule } from './payments/payments.module';
import { AddressesModule } from './addresses/addresses.module';
import { TownshipsModule } from './townships/townships.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TwoFactorModule } from './auth/two-factor/two-factor.module';
import { DeliveryPersonsModule } from './delivery-persons/delivery-persons.module';
import { DeliveryRequestsModule } from './delivery-requests/delivery-requests.module';

import { User } from './users/entities/user.entity';
import { Message } from './chat/entities/message.entity';
import { Payment } from './payments/entities/payment.entity';
import { Address } from './addresses/entities/address.entity';
import { Township } from './townships/entities/township.entity';
import { Timeline } from './delivery-requests/entities/timeline.entity';
import { DeliveryJob } from './delivery-persons/entities/delivery-job.entity';
import { KnowledgeEmbedding } from './chat/entities/knowledge-embedding.entity';
import { DeliveryPerson } from './delivery-persons/entities/delivery-person.entity';
import { TwoFactorToken } from './auth/two-factor/entities/two-factor-token.entity';
import { DeliveryRequest } from './delivery-requests/entities/delivery-request.entity';

import { RequestLoggerMiddleware } from './logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT') || 5432,
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [
          User,
          Payment,
          Address,
          Message,
          Timeline,
          Township,
          DeliveryJob,
          DeliveryPerson,
          TwoFactorToken,
          DeliveryRequest,
          KnowledgeEmbedding,
        ],
        synchronize: configService.get('DATABASE_SYNC') === '1' || false,
        ssl: { rejectUnauthorized: false },
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      sortSchema: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      formatError: (error) => {
        return {
          message: error.message,
          originalError: error.extensions?.originalError,
        };
      },
    }),
    AuthModule,
    UsersModule,
    EmailModule,
    WebhookModule,
    TelegramModule,
    PaymentsModule,
    AnalyticsModule,
    AddressesModule,
    TwoFactorModule,
    TownshipsModule,
    DeliveryPersonsModule,
    DeliveryRequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('graphql');
  }
}
