import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { User } from '../users/entities/user.entity';
import { DeliveryJob } from './entities/delivery-job.entity';
import { DeliveryPerson } from './entities/delivery-person.entity';

import { JobType } from '../enums/job-type.enum';
import { JobStatus } from '../enums/delivery-job-status.enum';
import { AvailabilityStatus } from '../enums/availability-status.enum';

@Injectable()
export class DeliveryPersonsService {
  constructor(
    @InjectRepository(DeliveryPerson)
    private deliveryPersonRepository: Repository<DeliveryPerson>,
    @InjectRepository(DeliveryJob)
    private deliveryJobRepository: Repository<DeliveryJob>,
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
      where: { id: userId },
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
    // TODO: reject if a request has already been assigned to a delivery person

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

    // Send Telegram notification if telegram_id exists
    if (person.telegram_id) {
      const deliveryJob = await this.deliveryJobRepository.findOne({
        where: { id: savedJob.id },
        relations: {
          delivery_request: {
            pickup_address: { township: true },
          },
        },
      });

      if (!deliveryJob) throw new NotFoundException('Delivery job not found');

      // const jobTypeText = jobType === JobType.PICKUP ? 'Pickup' : 'Delivery';
      // const message =
      //   `New ${jobTypeText} Job Assigned!\n\n` +
      //   `Type: ${jobTypeText}\n` +
      //   `Status: Pending\n\n` +
      //   `Customer Contact: ${deliveryJob.delivery_request.pickup_address.contact_number}\n` +
      //   `Pickup Address: ${deliveryJob.delivery_request.pickup_address.address_line}, ${deliveryJob.delivery_request.pickup_address.township.name}, ${deliveryJob.delivery_request.pickup_address.township.zipcode}`;

      // await this.telegramService.sendMessage(person.telegram_id, message);
    }

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
    if (!job) throw new NotFoundException('Job not found');

    job.status = status;
    if (signatureUrl) {
      job.signature_url = signatureUrl;
    }

    if (status === JobStatus.COMPLETED) {
      // Calculate earnings (0.6% of delivery cost)
      const cost =
        job.job_type === JobType.PICKUP
          ? job.delivery_request.pickup_cost
          : job.delivery_request.delivery_cost;
      job.earning = cost * 0.006;
    }

    return this.deliveryJobRepository.save(job);
  }

  async getStatistics(
    deliveryPersonId: string,
    startDate?: Date,
    endDate?: Date,
    jobType?: JobType,
    status?: JobStatus,
  ) {
    const query = this.deliveryJobRepository
      .createQueryBuilder('job')
      .where('job.delivery_person_id = :deliveryPersonId', {
        deliveryPersonId,
      });

    if (startDate && endDate) {
      query.andWhere('job.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (jobType) {
      query.andWhere('job.job_type = :jobType', { jobType });
    }

    if (status) {
      query.andWhere('job.status = :status', { status });
    }

    const jobs = await query.getMany();

    return {
      total_jobs: jobs.length,
      completed_jobs: jobs.filter((job) => job.status === JobStatus.COMPLETED)
        .length,
      total_earnings: jobs.reduce((sum, job) => sum + Number(job.earning), 0),
      jobs,
    };
  }
}
