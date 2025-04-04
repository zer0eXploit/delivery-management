import {
  Int,
  Args,
  Query,
  Field,
  Float,
  Resolver,
  ObjectType,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Roles } from '../auth/roles.decorater';
import { RolesGuard } from '../auth/roles.guard';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { AnalyticsService } from './analytics.service';

import { Role } from '../enums/role.enum';

@ObjectType()
class DeliveryTrend {
  @Field()
  month: string;

  @Field(() => Int)
  deliveries: number;
}

@ObjectType()
class StatusDistribution {
  @Field()
  status: string;

  @Field(() => Int)
  total: number;
}

@ObjectType()
class TownshipRevenue {
  @Field()
  township: string;

  @Field(() => Float)
  revenue: number;
}

@ObjectType()
class PerformanceMetrics {
  @Field(() => Int)
  totalDeliveries: number;

  @Field(() => Float)
  completionRate: number;
}

@ObjectType()
class TopDeliveryPerson {
  @Field()
  name: string;

  @Field(() => Int)
  total: number;
}

@Resolver('Analytics')
@Roles(Role.Admin)
@UseGuards(GqlAuthGuard, RolesGuard)
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Query(() => [DeliveryTrend])
  async deliveryTrends() {
    return this.analyticsService.getDeliveryTrends();
  }

  @Query(() => [StatusDistribution])
  async deliveryStatusDistribution(
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    return this.analyticsService.getDeliveryStatusDistribution(
      startDate,
      endDate,
    );
  }

  @Query(() => [TownshipRevenue])
  async revenueByTownship(
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    return this.analyticsService.getRevenueByTownship(startDate, endDate);
  }

  @Query(() => PerformanceMetrics)
  async deliveryPerformanceMetrics(
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    return this.analyticsService.getDeliveryPerformanceMetrics(
      startDate,
      endDate,
    );
  }

  @Query(() => Float)
  async totalRevenue(
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    return this.analyticsService.getTotalRevenue(startDate, endDate);
  }

  @Query(() => [TopDeliveryPerson])
  async topDeliveryPersons(
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    return this.analyticsService.getTopDeliveryPersons(startDate, endDate);
  }
}
