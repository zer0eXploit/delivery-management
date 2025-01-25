/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction) {
    if (req.method !== 'GET') {
      const { query, ...rest } = req.body;
      this.logger.log({ query: query.replace(/\n/g, ''), ...rest });
    }

    next();
  }
}
