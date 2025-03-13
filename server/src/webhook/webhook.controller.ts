import { Request, Response } from 'express';
import { Controller, Post, RawBodyRequest, Res, Req } from '@nestjs/common';

import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('telegram')
  async telegram(@Req() req: Request, @Res() res: Response) {
    await this.webhookService.handleTelegramWebhook(req, res);
    return { success: true, message: 'Should not reach here...' };
  }

  @Post('stripe')
  async stripe(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
    const signature = req.headers['stripe-signature'] as string;
    const payload = req.rawBody as Buffer;
    await this.webhookService.handleStripeWebhook(signature, payload);
    res.status(200).json({ received: true });
  }
}
