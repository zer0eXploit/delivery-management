import 'dotenv/config';
import { Bot } from 'grammy';
import { Logger } from '@nestjs/common';

const logger = new Logger('Telegram');
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

bot.command('start', async (ctx) => {
  console.log(ctx.match);
  await ctx.reply('Started...');
});

bot.on('message', async (ctx) => {
  await ctx.reply('Hello');
});

export async function setupTelegramBot() {
  const endpoint = process.env.TELEGRAM_WEBHOOK_ENDPOINT!;
  await bot.api.setMyCommands([
    { command: 'start', description: 'Start the bot' },
  ]);
  await bot.api.deleteWebhook();
  await bot.api.setWebhook(endpoint);
  logger.log(`Webhook set to ${endpoint}`);
}

export default {
  bot,
  setupTelegramBot,
};
