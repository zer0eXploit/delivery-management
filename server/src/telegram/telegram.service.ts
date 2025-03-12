import { Bot } from 'grammy';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

import { User } from '../users/entities/user.entity';
import { DeliveryPerson } from '../delivery-persons/entities/delivery-person.entity';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  public bot: Bot;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DeliveryPerson)
    private readonly deliveryPersonRepository: Repository<DeliveryPerson>,
  ) {
    this.bot = new Bot(this.configService.get('TELEGRAM_BOT_TOKEN') as string);
    this.registerHandlers();
  }

  async onModuleInit() {
    const commands = [{ command: 'start', description: 'Start the bot' }];
    const ep = this.configService.get('TELEGRAM_WEBHOOK_ENDPOINT') as string;

    await this.bot.api.setMyCommands(commands);
    await this.bot.api.deleteWebhook();
    await this.bot.api.setWebhook(ep, { drop_pending_updates: true });
    this.logger.log(`Webhook set to ${ep}`);
  }

  private registerHandlers() {
    this.bot.command('start', async (ctx) => {
      /**
       * User need to come to the bot via the following URL:
       * https://t.me/username_bot?start=uuidv4
       * https://t.me/zer0eXploit_noti_bot?start=81ce46ad-2cd8-4c75-a5f9-80f3f150db4d
       */

      try {
        const userId = ctx.match;
        const telegram_id = ctx?.from?.id?.toString();

        // Find the delivery person by telegram id. If found greet them back.
        const deliveryPerson = await this.deliveryPersonRepository.findOne({
          where: { telegram_id },
          relations: ['user'],
        });

        if (deliveryPerson) {
          await ctx.reply(`Welcome back ${deliveryPerson.user.name}!`);
          return;
        }

        if (isUUID(userId)) {
          const deliveryPerson = await this.deliveryPersonRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
          });

          if (deliveryPerson && !deliveryPerson.telegram_id) {
            if (telegram_id) {
              deliveryPerson.telegram_id = telegram_id;
              await this.deliveryPersonRepository.save(deliveryPerson);

              await ctx.reply(
                `Dear ${deliveryPerson.user.name}, your telegram account has been linked successfully.`,
              );
              return;
            }
          }

          await ctx.reply(
            `There has been an error linking your telegram ID. It could be that your account is not found on our system. Please try again.`,
          );
          return;
        }

        // Default response
        await ctx.reply('Hello! Welcome to the delivery management bot!');
      } catch (error) {
        this.logger.error(error);
        await ctx.reply(
          'There has been an error linking your telegram ID. Please try again.',
        );
      }
    });
  }
}
