import { webhookCallback } from 'grammy';
import { Request, Response } from 'express';
import { Injectable } from '@nestjs/common';

import { TelegramService } from '../telegram/telegram.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class WebhookService {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async handleTelegramWebhook(req: Request, res: Response) {
    const handleUpdate = webhookCallback(this.telegramService.bot, 'express');
    await handleUpdate(req, res);
  }

  async handleStripeWebhook(signature: string, payload: Buffer) {
    return this.paymentsService.handleWebhook(signature, payload);
  }
}
