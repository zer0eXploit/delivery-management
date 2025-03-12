import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { Payment, PaymentStatus } from './entities/payment.entity';
import { DeliveryRequestsService } from '../delivery-requests/delivery-requests.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private configService: ConfigService,
    private deliveryRequestsService: DeliveryRequestsService,
  ) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY') as string, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createPaymentIntent(deliveryRequestId: string) {
    const deliveryRequest =
      await this.deliveryRequestsService.findOne(deliveryRequestId);

    if (!deliveryRequest) {
      throw new NotFoundException('Delivery request not found');
    }

    const amount = Math.round(deliveryRequest.total_cost * 100); // Convert to cents

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        delivery_request_id: deliveryRequestId,
      },
    });

    const payment = this.paymentRepository.create({
      stripe_payment_intent_id: paymentIntent.id,
      client_secret: paymentIntent.client_secret as string,
      amount: deliveryRequest.total_cost,
      status: PaymentStatus.PENDING,
      delivery_request: deliveryRequest,
    });

    return this.paymentRepository.save(payment);
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get(
      'STRIPE_WEBHOOK_SECRET',
    ) as string;

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        await this.updatePaymentStatus(
          paymentIntent.id,
          PaymentStatus.SUCCEEDED,
        );
      } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        await this.updatePaymentStatus(paymentIntent.id, PaymentStatus.FAILED);
      }

      return { received: true };
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }

  private async updatePaymentStatus(
    stripePaymentIntentId: string,
    status: PaymentStatus,
  ) {
    const payment = await this.paymentRepository.findOne({
      where: { stripe_payment_intent_id: stripePaymentIntentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = status;
    return this.paymentRepository.save(payment);
  }
}
