import { webhookCallback } from 'grammy';
import { Request, Response } from 'express';
import { Injectable } from '@nestjs/common';

import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class WebhookService {
  constructor(private readonly telegramService: TelegramService) {}

  async handleTelegramWebhook(req: Request, res: Response) {
    const handleUpdate = webhookCallback(this.telegramService.bot, 'express');
    await handleUpdate(req, res);
  }
}
