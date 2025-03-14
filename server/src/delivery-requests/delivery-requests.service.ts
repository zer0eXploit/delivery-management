import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { Timeline } from './entities/timeline.entity';
import { Address } from '../addresses/entities/address.entity';
import { DeliveryRequest } from './entities/delivery-request.entity';

import { EmailService } from '../email/email.service';
import { TrackingCodeGenerator } from './tracking-code.generator';

import { PaymentMethod } from '../enums/payment-methods.enum';
import { DeliveryStatus } from '../enums/delivery-status.enum';

import { CreateDeliveryRequestInput } from './dto/create-delivery-request.input';

@Injectable()
export class DeliveryRequestsService {
  constructor(
    @InjectRepository(DeliveryRequest)
    private deliveryRequestRepository: Repository<DeliveryRequest>,
    @InjectRepository(Timeline)
    private timelineRepository: Repository<Timeline>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    private emailService: EmailService,
    private trackingCodeGenerator: TrackingCodeGenerator,
  ) {}

  async create(
    createDeliveryRequestInput: CreateDeliveryRequestInput,
    user: User,
  ) {
    const pickup_address = await this.addressRepository.findOne({
      where: { id: createDeliveryRequestInput.pickup_address_id },
      relations: ['township'],
    });

    if (!pickup_address) {
      throw new NotFoundException('Pickup address not found');
    }

    const delivery_address = await this.addressRepository.findOne({
      where: { id: createDeliveryRequestInput.delivery_address_id },
      relations: ['township'],
    });

    if (!delivery_address) {
      throw new NotFoundException('Delivery address not found');
    }

    const pickup_cost = Number(pickup_address.township.pickup_cost);
    const delivery_cost = Number(delivery_address.township.delivery_cost);

    // always count 1kg as minimum
    if (createDeliveryRequestInput.weight < 1) {
      createDeliveryRequestInput.weight = 1;
    }

    const total_cost = Number(
      (
        (pickup_cost + delivery_cost) *
        createDeliveryRequestInput.weight
      ).toFixed(2),
    );

    const tracking_code = await this.trackingCodeGenerator.generateTrackingCode(
      pickup_address.township.code,
      delivery_address.township.code,
    );

    const deliveryRequest = this.deliveryRequestRepository.create({
      customer: user,
      pickup_address,
      delivery_address,
      weight: createDeliveryRequestInput.weight,
      payment_method:
        createDeliveryRequestInput.payment_method as PaymentMethod,
      pickup_cost,
      delivery_cost,
      total_cost,
      status: DeliveryStatus.PENDING,
      tracking_code,
    });

    const savedRequest =
      await this.deliveryRequestRepository.save(deliveryRequest);

    await this.timelineRepository.save({
      delivery_request: savedRequest,
      status: DeliveryStatus.PENDING,
      description: 'Delivery request created',
    });

    await this.emailService.sendDeliveryConfirmation(savedRequest);

    return savedRequest;
  }

  async updateStatus(id: string, status: DeliveryStatus, description?: string) {
    const deliveryRequest = await this.findOne(id);
    if (!deliveryRequest) {
      throw new NotFoundException('Delivery request not found');
    }

    deliveryRequest.status = status;
    await this.deliveryRequestRepository.save(deliveryRequest);

    await this.timelineRepository.save({
      delivery_request: deliveryRequest,
      status,
      description,
    });

    await this.emailService.sendDeliveryStatusUpdate(deliveryRequest);

    return deliveryRequest;
  }

  findAll() {
    return this.deliveryRequestRepository.find({
      relations: {
        customer: true,
        pickup_address: { township: true },
        delivery_address: { township: true },
      },
      order: { created_at: 'DESC' },
    });
  }

  findAllByUser(userId: string) {
    return this.deliveryRequestRepository.find({
      where: { customer: { id: userId } },
      relations: {
        customer: true,
        pickup_address: { township: true },
        delivery_address: { township: true },
      },
      order: { created_at: 'DESC' },
    });
  }

  findOne(id: string) {
    return this.deliveryRequestRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        pickup_address: { township: true },
        delivery_address: { township: true },
      },
    });
  }

  findOneByTrackingCode(tracking_code: string) {
    return this.deliveryRequestRepository.findOne({
      where: { tracking_code },
      relations: {
        customer: true,
        pickup_address: { township: true },
        delivery_address: { township: true },
      },
    });
  }

  getTimeline(deliveryRequestId: string) {
    return this.timelineRepository.find({
      where: { delivery_request: { id: deliveryRequestId } },
      order: { created_at: 'DESC' },
    });
  }
}
