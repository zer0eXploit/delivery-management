import { Request, Response } from 'express';
import { Controller, Post, Req, Res } from '@nestjs/common';

import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('telegram')
  async telegram(@Req() req: Request, @Res() res: Response) {
    await this.webhookService.handleTelegramWebhook(req, res);
    return { success: true, message: 'Should not reach here...' };
  }
}
