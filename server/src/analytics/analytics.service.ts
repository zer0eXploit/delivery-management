/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Repository, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

import { Township } from '../townships/entities/township.entity';
import { DeliveryJob } from '../delivery-persons/entities/delivery-job.entity';
import { DeliveryRequest } from '../delivery-requests/entities/delivery-request.entity';

import { DeliveryStatus } from '../enums/delivery-status.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Township)
    private townshipRepository: Repository<Township>,
    @InjectRepository(DeliveryJob)
    private deliveryJobRepoRepository: Repository<DeliveryJob>,
    @InjectRepository(DeliveryRequest)
    private deliveryRequestRepository: Repository<DeliveryRequest>,
  ) {}

  async getDeliveryTrends(months: number = 6) {
    const data: { month: string; deliveries: number }[] = [];
    for (let i = 0; i < months; i++) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const count = await this.deliveryRequestRepository.count({
        where: { created_at: Between(start, end) },
      });

      data.unshift({
        deliveries: count,
        month: start.toLocaleString('default', { month: 'short' }),
      });
    }
    return data;
  }

  async getDeliveryStatusDistribution(startDate?: Date, endDate?: Date) {
    const statuses = Object.values(DeliveryStatus);
    const data: { status: string; total: number }[] = [];

    for (const status of statuses) {
      const where: any = { status };
      if (startDate && endDate) where.created_at = Between(startDate, endDate);

      const count = await this.deliveryRequestRepository.count({ where });

      data.push({ status, total: count });
    }

    return data;
  }

  async getRevenueByTownship(startDate?: Date, endDate?: Date) {
    const townships = await this.townshipRepository.find();
    const data: { township: string; revenue: number }[] = [];

    for (const township of townships) {
      const where: any = {
        status: DeliveryStatus.DELIVERED,
        delivery_address: { township: { id: township.id } },
      };

      if (startDate && endDate) where.created_at = Between(startDate, endDate);

      const deliveries = await this.deliveryRequestRepository.find({ where });

      const revenue = deliveries.reduce((sum, delivery) => {
        return sum + (Number(delivery.total_cost) || 0);
      }, 0);

      data.push({
        township: township.name,
        revenue: Number(revenue.toFixed(2)),
      });
    }

    return data;
  }

  async getDeliveryPerformanceMetrics(startDate?: Date, endDate?: Date) {
    const where: any = {};
    const completedWhere: any = { status: DeliveryStatus.DELIVERED };

    if (startDate && endDate) {
      where.created_at = Between(startDate, endDate);
      completedWhere.created_at = Between(startDate, endDate);
    }

    const completedDeliveries = await this.deliveryRequestRepository.count({
      where: completedWhere,
    });
    const totalDeliveries = await this.deliveryRequestRepository.count({
      where,
    });

    const completionRate = (completedDeliveries / totalDeliveries) * 100;

    return {
      totalDeliveries,
      completionRate: isNaN(completionRate) ? 0 : completionRate,
    };
  }

  async getTopDeliveryPersons(startDate?: Date, endDate?: Date) {
    const queryBuilder = this.deliveryJobRepoRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.delivery_person', 'person')
      .leftJoinAndSelect('person.user', 'user')
      .where('job.status = :status', { status: 'COMPLETED' });

    if (startDate && endDate) {
      queryBuilder.andWhere('job.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const deliveryPersons = await queryBuilder
      .select([
        'user.name as name',
        'user.id as userId',
        'COUNT(job.id) as completed_deliveries',
      ])
      .groupBy('userId')
      .orderBy('completed_deliveries', 'DESC')
      .limit(10)
      .getRawMany();

    return deliveryPersons.map((person) => {
      const completedDeliveries = Number(person.completed_deliveries as string);

      return {
        name: person.name as string,
        total: isNaN(completedDeliveries) ? 0 : completedDeliveries,
      };
    });
  }

  async getTotalRevenue(startDate?: Date, endDate?: Date) {
    const where: any = { status: DeliveryStatus.DELIVERED };

    if (startDate && endDate) where.created_at = Between(startDate, endDate);

    const deliveries = await this.deliveryRequestRepository.find({ where });

    const totalRevenue = deliveries.reduce((sum, delivery) => {
      return sum + (Number(delivery.total_cost) || 0);
    }, 0);

    return Number((isNaN(totalRevenue) ? 0 : totalRevenue).toFixed(2));
  }
}
