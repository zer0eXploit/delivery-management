import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { DeliveryRequest } from '../delivery-requests/entities/delivery-request.entity';

@Injectable()
export class EmailService {
  async sendAdminNotification(email: string, context: Record<string, any>) {
    await this.mailerService.sendMail({
      context,
      to: email,
      subject: 'Job Cancellation Notification',
      template: 'job-cancelled',
    });
  }

  constructor(private mailerService: MailerService) {}

  async sendDeliveryStatusUpdate(deliveryRequest: DeliveryRequest) {
    const { customer, status, pickup_address, delivery_address } =
      deliveryRequest;

    await this.mailerService.sendMail({
      to: customer.email,
      subject: `Delivery Status Update: ${status}`,
      template: 'delivery-status',
      context: {
        name: customer.name,
        status,
        pickup_address: pickup_address.address_line,
        delivery_address: delivery_address.address_line,
        tracking_id: deliveryRequest.tracking_code,
      },
    });
  }

  async sendDeliveryConfirmation(deliveryRequest: DeliveryRequest) {
    const { customer, pickup_address, delivery_address, total_cost } =
      deliveryRequest;

    await this.mailerService.sendMail({
      to: customer.email,
      subject: 'Delivery Request Confirmation',
      template: 'delivery-confirmation',
      context: {
        name: customer.name,
        pickup_address: pickup_address.address_line,
        delivery_address: delivery_address.address_line,
        tracking_id: deliveryRequest.tracking_code,
        total_cost,
      },
    });
  }

  async send2FACode(email: string, context: Record<string, any>) {
    await this.mailerService.sendMail({
      to: email,
      subject: '2FA Verification Code',
      template: 'two-factor-code',
      context,
    });
  }
}
