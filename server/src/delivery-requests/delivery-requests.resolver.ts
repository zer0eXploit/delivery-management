import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';

import { User } from '../users/entities/user.entity';
import { Timeline } from './entities/timeline.entity';
import { DeliveryRequest } from './entities/delivery-request.entity';

import { DeliveryRequestsService } from './delivery-requests.service';

import { Roles } from '../auth/roles.decorater';
import { RolesGuard } from '../auth/roles.guard';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

import { Role } from '../enums/role.enum';
import { DeliveryStatus } from '../enums/delivery-status.enum';

import { CreateDeliveryRequestInput } from './dto/create-delivery-request.input';

@Resolver(() => DeliveryRequest)
export class DeliveryRequestsResolver {
  constructor(
    private readonly deliveryRequestsService: DeliveryRequestsService,
  ) {}

  @Mutation(() => DeliveryRequest)
  @UseGuards(GqlAuthGuard)
  createDeliveryRequest(
    @Args('createDeliveryRequestInput')
    createDeliveryRequestInput: CreateDeliveryRequestInput,
    @CurrentUser() user: User,
  ) {
    return this.deliveryRequestsService.create(
      createDeliveryRequestInput,
      user,
    );
  }

  @Query(() => [DeliveryRequest])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  findAllDeliveryRequests() {
    return this.deliveryRequestsService.findAll();
  }

  @Query(() => [DeliveryRequest])
  @UseGuards(GqlAuthGuard)
  findMyDeliveryRequests(@CurrentUser() user: User) {
    return this.deliveryRequestsService.findAllByUser(user.id);
  }

  @Query(() => DeliveryRequest)
  @UseGuards(GqlAuthGuard)
  findOneDeliveryRequest(@Args('id', { type: () => String }) id: string) {
    return this.deliveryRequestsService.findOne(id);
  }

  @Query(() => [Timeline])
  @UseGuards(GqlAuthGuard)
  getDeliveryTimeline(
    @Args('deliveryRequestId', { type: () => String }) id: string,
  ) {
    return this.deliveryRequestsService.getTimeline(id);
  }

  @Mutation(() => DeliveryRequest)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  updateDeliveryStatus(
    // Update here to use input type dto
    @Args('id', { type: () => String }) id: string,
    @Args('status', { type: () => DeliveryStatus }) status: DeliveryStatus,
    @Args('description', { type: () => String, nullable: true })
    description?: string,
  ) {
    return this.deliveryRequestsService.updateStatus(id, status, description);
  }
}
