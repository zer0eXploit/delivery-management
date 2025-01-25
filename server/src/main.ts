import { NestFactory } from '@nestjs/core';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { TypeOrmExceptionFilter } from './typeorm-exception.filter';
import { CatchAllExceptionFilter } from './catch-all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({ json: false }),
  });
  app.useGlobalFilters(new CatchAllExceptionFilter());
  app.useGlobalFilters(new TypeOrmExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ disableErrorMessages: false }));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch(() => {});
