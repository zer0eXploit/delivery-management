import { Bot } from 'grammy';
import { toSql } from 'pgvector';
import { isUUID } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { CohereClient, CohereClientV2 } from 'cohere-ai';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

import { Message } from '../chat/entities/message.entity';
import { KnowledgeEmbedding } from '../chat/entities/knowledge-embedding.entity';
import { DeliveryPerson } from '../delivery-persons/entities/delivery-person.entity';

import { DeliveryRequestsService } from '../delivery-requests/delivery-requests.service';

type CohereMessage = {
  content: string;
  role: 'user' | 'assistant';
};

@Injectable()
export class TelegramService implements OnModuleInit {
  public bot: Bot;
  private cohere: CohereClient;
  private cohereV2: CohereClientV2;
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly deliveryService: DeliveryRequestsService,
    @InjectRepository(DeliveryPerson)
    private readonly deliveryPersonRepository: Repository<DeliveryPerson>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(KnowledgeEmbedding)
    private readonly knowledgeEmbeddingRepository: Repository<KnowledgeEmbedding>,
  ) {
    this.bot = new Bot(this.configService.get('TELEGRAM_BOT_TOKEN') as string);
    this.cohere = new CohereClient({
      token: this.configService.get('COHERE_API_KEY'),
    });
    this.cohereV2 = new CohereClientV2({
      token: this.configService.get('COHERE_API_KEY'),
    });
    this.registerHandlers();
  }

  async onModuleInit() {
    const commands = [{ command: 'start', description: 'Start the bot' }];
    const ep = this.configService.get('TELEGRAM_WEBHOOK_ENDPOINT') as string;

    await this.bot.api.setMyCommands(commands);
    await this.bot.api.deleteWebhook();
    await this.bot.api.setWebhook(ep, { drop_pending_updates: true });
    this.logger.log(`Webhook set to ${ep}`);

    await this.seedEmbeddings();
  }

  private registerHandlers() {
    this.bot.command('start', async (ctx) => {
      /**
       * User need to come to the bot via the following URL:
       * https://t.me/username_bot?start=uuidv4
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

    this.bot.on('message', async (ctx) => {
      try {
        const message = ctx.message?.text;
        const telegram_id = ctx.from?.id?.toString();

        await ctx.replyWithChatAction('typing');

        if (!telegram_id || !message) return;
        if (!message || message.startsWith('/')) return;

        // Save message to database
        const newMessage = this.messageRepository.create({
          telegram_id,
          role: 'user',
          content: message,
        });
        await this.messageRepository.save(newMessage);

        const messages = ((await this.getMessages(telegram_id)) ?? []).map(
          (m) => ({
            content: m.content as string,
            role: m.role as 'user' | 'assistant',
          }),
        );

        // Classify intent
        const orderTrackingIntent = await this.isAboutOrderTracking(message);

        if (orderTrackingIntent) {
          const deliveryStatus = await this.handleDeliveryQuery(
            messages,
            telegram_id,
          );
          await ctx.reply(deliveryStatus);
        } else {
          const ragResponse = await this.handleRAGQuery(
            message,
            telegram_id,
            messages,
          );
          await ctx.reply(ragResponse);
        }
      } catch (error) {
        this.logger.error(error);
        await ctx.reply('Sorry, there was an error processing your request.');
      }
    });
  }

  private async isAboutOrderTracking(message: string): Promise<boolean> {
    const response = await this.cohere.classify({
      inputs: [message],
      // custom fine-tuned model
      model: 'cdc70cef-af9f-455c-af4e-5f1cd529795d-ft',
    });
    return response.classifications[0].predictions[0] === 'delivery';
  }

  private async handleRAGQuery(
    message: string,
    telegram_id: string,
    messages: CohereMessage[] | [],
  ): Promise<string> {
    // Generate query embeddings
    const embedding = await this.cohereV2.embed({
      inputType: 'search_document',
      texts: [message],
      model: 'embed-english-v3.0',
      embeddingTypes: ['float'],
    });

    const query = embedding.embeddings.float?.[0];

    if (!query) return "Sorry, I couldn't understand your query.";

    const convertedQuery = toSql(query) as string;

    // Vector similarity search
    const results = await this.knowledgeEmbeddingRepository
      .createQueryBuilder()
      .select()
      .where('embedding <-> :query < 0.8')
      .orderBy('embedding <-> :query', 'ASC')
      .setParameters({ query: convertedQuery })
      .limit(3)
      .getMany();

    // Generate response using conversation history
    const response = await this.cohereV2.chat({
      model: 'command-r-plus-08-2024',
      messages,
      documents: results.map((r) => ({
        id: r.id,
        data: { text: r.original_text },
      })),
    });

    const responseText = response.message.content?.[0].text;

    if (responseText) {
      // Save message to database
      const newMessage = this.messageRepository.create({
        telegram_id,
        role: 'assistant',
        content: responseText,
      });
      await this.messageRepository.save(newMessage);
    }
    return responseText ?? "Sorry, I couldn't find an answer to your question.";
  }

  private async handleDeliveryQuery(
    messages: CohereMessage[],
    telegram_id: string,
  ): Promise<string> {
    const response = await this.cohereV2.chat({
      model: 'command-r-plus-08-2024',
      tools: [
        {
          type: 'function',
          function: {
            name: 'fetch_delivery_job_status',
            description:
              'Provided a delivery tracking code, returns the status of the delivery job.',
            parameters: {
              type: 'object',
              properties: {
                trackingCode: {
                  description: 'The tracking code of the delivery job.',
                  type: 'string',
                },
              },
            },
          },
        },
      ],
      messages,
    });

    if (response.message.toolCalls?.length) {
      const toolCall = response.message.toolCalls[0];

      const args = JSON.parse(toolCall.function?.arguments as string) as {
        trackingCode: string;
      };

      if (args.trackingCode) {
        const deliveryRequest =
          await this.deliveryService.findOneByTrackingCode(args.trackingCode);

        if (!deliveryRequest)
          return `No delivery request found for the given tracking code.`;

        return `Your delivery status is ${deliveryRequest.status}`;
      }
    }

    if (response.message?.content?.[0].text) {
      // Save message to database
      const newMessage = this.messageRepository.create({
        telegram_id,
        role: 'assistant',
        content: response.message.content[0].text,
      });
      await this.messageRepository.save(newMessage);
      return response.message.content[0].text;
    }

    return "Sorry, I couldn't find the delivery status for that tracking code.";
  }

  private async getMessages(telegram_id: string): Promise<Message[] | []> {
    const existing = await this.messageRepository.find({
      where: {
        telegram_id,
        // Get messages from the last 24 hours
        created_at: MoreThanOrEqual(new Date(Date.now() - 24 * 60 * 60 * 1000)),
      },
      order: {
        created_at: 'ASC',
      },
    });

    if (existing) return existing;

    return [];
  }

  private async seedEmbeddings(): Promise<void> {
    try {
      const hasAtLeastOneEmbedding =
        await this.knowledgeEmbeddingRepository.find({ take: 1 });

      if (hasAtLeastOneEmbedding.length) return;

      const faqTexts = [
        'What is SnapDeli? SnapDeli is a fast and reliable delivery service that connects customers with local businesses and delivery partners.',
        'How do I track my delivery? You can track your delivery by using the tracking code provided in your order confirmation. Simply enter the code in our chat interface.',
        'What are the delivery hours? We operate 24/7, ensuring you can get your deliveries whenever you need them.',
        'How long does delivery usually take? Standard deliveries typically take 30-45 minutes within city limits, depending on distance and traffic conditions.',
        "What if my delivery is late? If your delivery is running late, you'll receive real-time updates. You can also contact our support for assistance.",
        'How do I become a delivery partner? To become a delivery partner, register through our website and complete the verification process.',
        'What payment methods do you accept? We accept all major credit cards, digital wallets, and cash on delivery.',
        "Is there a minimum order value? Minimum order values vary by merchant. Check the specific merchant's page for details.",
        'How do I report an issue with my delivery? You can report delivery issues through our chat interface or contact our 24/7 customer support.',
        'Do you offer contactless delivery? Yes, we offer contactless delivery options. Just select this preference when placing your order.',
      ];

      for (const text of faqTexts) {
        const embedding = await this.cohereV2.embed({
          inputType: 'search_document',
          texts: [text],
          model: 'embed-english-v3.0',
          embeddingTypes: ['float'],
        });

        if (!embedding.embeddings.float) {
          throw new Error('Failed to generate embedding for text: ' + text);
        }

        await this.knowledgeEmbeddingRepository.query(
          `INSERT INTO knowledge_embedding (original_text, embedding) VALUES ($1, $2)`,
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          [text, `[${embedding.embeddings.float[0]}]`],
        );
      }

      this.logger.log(
        `Successfully seeded ${faqTexts.length} knowledge embeddings`,
      );
    } catch (error) {
      this.logger.error('Error seeding knowledge embeddings:', error);
      throw error;
    }
  }

  public async sendMessage(
    telegram_id: string,
    message: string,
  ): Promise<boolean> {
    try {
      await this.bot.api.sendMessage(telegram_id, message);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send message to ${telegram_id}:`, error);
      return false;
    }
  }
}
