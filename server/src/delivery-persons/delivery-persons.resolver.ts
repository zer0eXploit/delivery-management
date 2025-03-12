import {
  Int,
  Query,
  Args,
  Field,
  Float,
  Resolver,
  Mutation,
  ObjectType,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { DeliveryJob } from './entities/delivery-job.entity';
import { DeliveryPerson } from './entities/delivery-person.entity';

import { DeliveryPersonsService } from './delivery-persons.service';

import { Roles } from '../auth/roles.decorater';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

import { Role } from '../enums/role.enum';
import { JobType } from '../enums/job-type.enum';
import { JobStatus } from '../enums/delivery-job-status.enum';
import { AvailabilityStatus } from '../enums/availability-status.enum';

@ObjectType()
class Statistics {
  @Field(() => Int)
  total_jobs: number;

  @Field(() => Int)
  completed_jobs: number;

  @Field(() => Float)
  total_earnings: number;

  @Field(() => [DeliveryJob])
  jobs: DeliveryJob[];
}

@Resolver(() => DeliveryPerson)
export class DeliveryPersonsResolver {
  constructor(
    private readonly deliveryPersonsService: DeliveryPersonsService,
  ) {}

  @Mutation(() => DeliveryPerson)
  @UseGuards(GqlAuthGuard)
  @Roles(Role.Deliverer)
  linkTelegram(
    @CurrentUser() user: DeliveryPerson,
    @Args('telegramId') telegramId: string,
  ) {
    return this.deliveryPersonsService.linkTelegram(user.id, telegramId);
  }

  @Mutation(() => DeliveryPerson)
  @UseGuards(GqlAuthGuard)
  @Roles(Role.Deliverer)
  updateAvailability(
    @CurrentUser() user: DeliveryPerson,
    @Args('status', { type: () => AvailabilityStatus })
    status: AvailabilityStatus,
  ) {
    return this.deliveryPersonsService.updateAvailability(user.id, status);
  }

  @Mutation(() => DeliveryJob)
  @UseGuards(GqlAuthGuard)
  @Roles(Role.Admin)
  assignJob(
    @Args('deliveryPersonId') deliveryPersonId: string,
    @Args('deliveryRequestId') deliveryRequestId: string,
    @Args('jobType', { type: () => JobType }) jobType: JobType,
  ) {
    return this.deliveryPersonsService.assignJob(
      deliveryPersonId,
      deliveryRequestId,
      jobType,
    );
  }

  @Mutation(() => DeliveryJob)
  @UseGuards(GqlAuthGuard)
  @Roles(Role.Deliverer)
  updateJobStatus(
    @Args('jobId') jobId: string,
    @Args('status', { type: () => JobStatus }) status: JobStatus,
    @Args('signatureUrl', { nullable: true }) signatureUrl?: string,
  ) {
    return this.deliveryPersonsService.updateJobStatus(
      jobId,
      status,
      signatureUrl,
    );
  }

  @Query(() => Statistics)
  @UseGuards(GqlAuthGuard)
  @Roles(Role.Deliverer)
  getMyStatistics(
    @CurrentUser() user: DeliveryPerson,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @Args('jobType', { type: () => JobType, nullable: true }) jobType?: JobType,
    @Args('status', { type: () => JobStatus, nullable: true })
    status?: JobStatus,
  ) {
    return this.deliveryPersonsService.getStatistics(
      user.id,
      startDate,
      endDate,
      jobType,
      status,
    );
  }
}
