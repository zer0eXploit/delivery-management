import { Catch, Logger, ExceptionFilter } from '@nestjs/common';

@Catch()
export class CatchAllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CatchAllExceptionFilter.name);

  catch(exception: Error): void {
    this.logger.error(exception);

    throw exception;
  }
}
