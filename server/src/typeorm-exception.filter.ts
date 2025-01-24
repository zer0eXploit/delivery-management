import { TypeORMError } from 'typeorm';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { Catch, ConflictException, Logger } from '@nestjs/common';

@Catch(TypeORMError)
export class TypeOrmExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(TypeOrmExceptionFilter.name);

  catch(exception) {
    this.logger.error(exception);

    if (exception.code) {
      switch (exception.code) {
        case '23505':
          throw new ConflictException('Resource already exists');

        default:
          throw exception;
      }
    }

    throw exception;
  }
}
