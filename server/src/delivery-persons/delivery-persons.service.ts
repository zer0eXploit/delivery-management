import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';
import { DeliveryJob } from './entities/delivery-job.entity';
import { TelegramService } from '../telegram/telegram.service';
import { DeliveryPerson } from './entities/delivery-person.entity';
import { Timeline } from '../delivery-requests/entities/timeline.entity';
import { DeliveryRequest } from '../delivery-requests/entities/delivery-request.entity';

import { Role } from '../enums/role.enum';
import { JobType } from '../enums/job-type.enum';
import { JobStatus } from '../enums/delivery-job-status.enum';
import { DeliveryStatus } from '../enums/delivery-status.enum';
import { AvailabilityStatus } from '../enums/availability-status.enum';

@Injectable()
export class DeliveryPersonsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(DeliveryPerson)
    private deliveryPersonRepository: Repository<DeliveryPerson>,
    @InjectRepository(DeliveryJob)
    private deliveryJobRepository: Repository<DeliveryJob>,
    @InjectRepository(DeliveryRequest)
    private deliveryRequestRepository: Repository<DeliveryRequest>,
    @InjectRepository(Timeline)
    private timelineRepository: Repository<Timeline>,
    private emailService: EmailService,
    private telegramService: TelegramService,
  ) {}

  async createDeliveryPerson(user: User) {
    const deliveryPerson = this.deliveryPersonRepository.create({
      user: { id: user.id },
      availability_status: AvailabilityStatus.AVAILABLE,
    });

    return this.deliveryPersonRepository.save(deliveryPerson);
  }

  async findByUserId(userId: string) {
    return this.deliveryPersonRepository.findOne({
      where: { user: { id: userId } },
      relations: ['delivery_jobs'],
    });
  }

  async linkTelegram(userId: string, telegramId: string) {
    const person = await this.deliveryPersonRepository.findOne({
      where: { id: userId },
    });
    if (!person) throw new NotFoundException('Delivery person not found');

    person.telegram_id = telegramId;
    return this.deliveryPersonRepository.save(person);
  }

  async updateAvailability(userId: string, status: AvailabilityStatus) {
    const person = await this.deliveryPersonRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!person) throw new NotFoundException('Delivery person not found');

    person.availability_status = status;
    return this.deliveryPersonRepository.save(person);
  }

  async assignJob(
    deliveryPersonId: string,
    deliveryRequestId: string,
    jobType: JobType,
  ) {
    const existingJob = await this.deliveryJobRepository.findOne({
      where: {
        job_type: jobType,
        status: JobStatus.ASSIGNED,
        delivery_request: { id: deliveryRequestId },
      },
    });

    if (existingJob) {
      throw new Error(
        'This delivery request has already been assigned to a delivery person',
      );
    }

    const person = await this.deliveryPersonRepository.findOne({
      where: { id: deliveryPersonId },
      relations: ['user'],
    });

    if (!person) throw new NotFoundException('Delivery person not found');

    const job = this.deliveryJobRepository.create({
      delivery_person: { id: deliveryPersonId },
      delivery_request: { id: deliveryRequestId },
      job_type: jobType,
      earning: 0,
    });

    const savedJob = await this.deliveryJobRepository.save(job);

    const deliveryRequest = await this.deliveryRequestRepository.findOne({
      where: { id: deliveryRequestId },
      relations: {
        customer: true,
        pickup_address: { township: true },
        delivery_address: { township: true },
      },
    });

    if (!deliveryRequest) {
      throw new NotFoundException('Delivery request not found');
    }

    deliveryRequest.status =
      jobType === JobType.PICKUP
        ? DeliveryStatus.PICKUP_ASSIGNED
        : DeliveryStatus.OUT_FOR_DELIVERY;

    await this.deliveryRequestRepository.save(deliveryRequest);

    // Send Telegram notification if telegram_id exists
    if (person.telegram_id) {
      const deliveryJob = await this.deliveryJobRepository.findOne({
        where: { id: savedJob.id },
        relations: {
          delivery_request: {
            pickup_address: { township: true },
            delivery_address: { township: true },
          },
        },
      });

      if (!deliveryJob) throw new NotFoundException('Delivery job not found');

      const jobTypeText = jobType === JobType.PICKUP ? 'Pickup' : 'Delivery';
      const jobTypeKey =
        jobType === JobType.PICKUP ? 'pickup_address' : 'delivery_address';

      const message =
        `New Job has been Assigned!\n\n` +
        `Type: ${jobTypeText}\n` +
        `Status: Pending\n\n` +
        `Customer Name: ${deliveryJob.delivery_request[jobTypeKey].contact_name}\n` +
        `Customer Phone: ${deliveryJob.delivery_request[jobTypeKey].contact_number}\n\n` +
        `Address: ${deliveryJob.delivery_request[jobTypeKey].address_line}, ${deliveryJob.delivery_request[jobTypeKey].township.name}, ${deliveryJob.delivery_request[jobTypeKey].township.zipcode}`;

      await this.telegramService.sendMessage(person.telegram_id, message);
    }

    await this.timelineRepository.save({
      delivery_request: deliveryRequest,
      status: deliveryRequest.status,
      description:
        jobType === JobType.PICKUP
          ? 'Delivery request assigned for pickup'
          : 'Delivery request assigned for delivery',
    });

    await this.emailService.sendDeliveryStatusUpdate(deliveryRequest);

    return savedJob;
  }

  async updateJobStatus(
    jobId: string,
    status: JobStatus,
    signatureUrl?: string,
  ) {
    const job = await this.deliveryJobRepository.findOne({
      where: { id: jobId },
      relations: ['delivery_request'],
    });
    if (!job) throw new NotFoundException('Delivery Job not found');

    if (
      job.status === JobStatus.COMPLETED ||
      job.status === JobStatus.CANCELLED
    ) {
      throw new Error('Job cannot be updated after completion or cancellation');
    }

    job.status = status;
    if (signatureUrl) job.signature_url = signatureUrl;

    if (status === JobStatus.COMPLETED) {
      if (!job.signature_url) {
        throw new Error('Customer signature is required for a completed job');
      }

      // Update delivery request status
      const deliveryRequest = await this.deliveryRequestRepository.findOne({
        where: { id: job.delivery_request.id },
        relations: {
          customer: true,
          pickup_address: { township: true },
          delivery_address: { township: true },
        },
      });

      if (!deliveryRequest) {
        throw new NotFoundException('Delivery request not found');
      }

      if (job.job_type === JobType.PICKUP) {
        deliveryRequest.status = DeliveryStatus.PICKED_UP;
      } else {
        deliveryRequest.status = DeliveryStatus.DELIVERED;
      }

      await this.timelineRepository.save({
        delivery_request: deliveryRequest,
        status: deliveryRequest.status,
        description:
          job.job_type === JobType.PICKUP
            ? 'Package picked up by the delivery person'
            : 'Package delivered to the customer',
      });

      await this.deliveryRequestRepository.save(deliveryRequest);

      // Calculate earnings (40% of the cost)
      const cost =
        job.job_type === JobType.PICKUP
          ? job.delivery_request.pickup_cost
          : job.delivery_request.delivery_cost;
      job.earning = Number((cost * deliveryRequest.weight * 0.4).toFixed(2));

      await this.emailService.sendDeliveryStatusUpdate(deliveryRequest);
    }

    return this.deliveryJobRepository.save(job);
  }

  async getStatistics(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    jobType?: JobType,
    status?: JobStatus,
  ) {
    const person = await this.deliveryPersonRepository.findOne({
      where: { user: { id: userId } },
      select: ['id'],
    });

    if (!person) throw new NotFoundException('Delivery person not found');

    const deliveryPersonId = person.id;
    const query = this.deliveryJobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.delivery_request', 'delivery_request')
      .leftJoinAndSelect('delivery_request.customer', 'customer')
      .leftJoinAndSelect('delivery_request.pickup_address', 'pickup_address')
      .leftJoinAndSelect(
        'delivery_request.delivery_address',
        'delivery_address',
      )
      .leftJoinAndSelect('pickup_address.township', 'pickup_township')
      .leftJoinAndSelect('delivery_address.township', 'delivery_township')
      .where('job.delivery_person_id = :deliveryPersonId', {
        deliveryPersonId,
      });

    if (startDate && endDate) {
      query.andWhere('job.created_at BETWEEN :startDate AND :endDate', {
        endDate,
        startDate,
      });
    }

    if (jobType) query.andWhere('job.job_type = :jobType', { jobType });
    if (status) query.andWhere('job.status = :status', { status });

    const jobs = await query.orderBy('job.created_at', 'DESC').getMany();

    return {
      total_jobs: jobs.length,
      completed_jobs: jobs.filter((job) => job.status === JobStatus.COMPLETED)
        .length,
      total_earnings: jobs.reduce((sum, job) => sum + Number(job.earning), 0),
      jobs,
    };
  }

  async getAssignedJobs(userId: string, status?: JobStatus) {
    const person = await this.deliveryPersonRepository.findOne({
      where: { user: { id: userId } },
      select: ['id'],
    });

    if (!person) throw new NotFoundException('Delivery person not found');

    const deliveryPersonId = person.id;

    const query = this.deliveryJobRepository
      .createQueryBuilder('job')
      .where('job.delivery_person_id = :deliveryPersonId', { deliveryPersonId })
      .leftJoinAndSelect('job.delivery_request', 'delivery_request')
      .leftJoinAndSelect('delivery_request.customer', 'customer')
      .leftJoinAndSelect('delivery_request.pickup_address', 'pickup_address')
      .leftJoinAndSelect(
        'delivery_request.delivery_address',
        'delivery_address',
      )
      .leftJoinAndSelect('pickup_address.township', 'pickup_township')
      .leftJoinAndSelect('delivery_address.township', 'delivery_township')
      .orderBy('job.created_at', 'DESC');

    if (status) {
      query.andWhere('job.status = :status', { status });
    }

    return query.getMany();
  }

  async getJobById(userId: string, jobId: string) {
    const job = await this.deliveryJobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.delivery_person', 'delivery_person')
      .leftJoinAndSelect('job.delivery_request', 'delivery_request')
      .leftJoinAndSelect('delivery_request.customer', 'customer')
      .leftJoinAndSelect('delivery_request.pickup_address', 'pickup_address')
      .leftJoinAndSelect(
        'delivery_request.delivery_address',
        'delivery_address',
      )
      .leftJoinAndSelect('pickup_address.township', 'pickup_township')
      .leftJoinAndSelect('delivery_address.township', 'delivery_township')
      .where('job.id = :jobId', { jobId })
      .andWhere('delivery_person.user_id = :userId', { userId })
      .getOne();

    if (!job) throw new NotFoundException('Job not found or unauthorized');

    return job;
  }

  async cancelJob(userId: string, jobId: string) {
    const job = await this.deliveryJobRepository.findOne({
      where: {
        id: jobId,
        delivery_person: { user: { id: userId } },
      },
      relations: ['delivery_request', 'delivery_person.user'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status === JobStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed job');
    }

    job.status = JobStatus.CANCELLED;

    if (job.job_type === JobType.PICKUP) {
      job.delivery_request.status = DeliveryStatus.PENDING;
    } else if (job.job_type === JobType.DELIVERY) {
      job.delivery_request.status = DeliveryStatus.PICKED_UP;
    }

    await this.deliveryRequestRepository.save(job.delivery_request);
    await this.deliveryJobRepository.save(job);

    const admins = await this.userRepository.find({
      where: { role: Role.Admin },
    });

    for (const admin of admins) {
      await this.emailService.sendAdminNotification(admin.email, {
        jobId: job.id,
        jobType: job.job_type,
        deliveryPerson: job.delivery_person.user.name,
        trackingCode: job.delivery_request.tracking_code,
        adminName: admin.name,
        cancellationTime: new Date().toLocaleString(),
      });
    }

    return job;
  }

  async getAllDeliverers() {
    return this.deliveryPersonRepository.find({
      relations: ['user', 'delivery_jobs'],
      order: { user: { name: 'ASC' } },
    });
  }
}
