import {
  Controller,
  Post,
  Headers,
  RawBodyRequest,
  Req,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';

import { PaymentsService } from './payments.service';

@Controller('webhooks')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      if (!signature) {
        throw new HttpException(
          'Missing stripe-signature header',
          HttpStatus.BAD_REQUEST,
        );
      }

      const response = await this.paymentsService.handleWebhook(
        signature,
        request.rawBody!,
      );

      return response;
    } catch (error) {
      throw new HttpException(
        `Webhook Error: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
