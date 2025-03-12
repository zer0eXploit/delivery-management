import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args } from '@nestjs/graphql';

import { Payment } from './entities/payment.entity';

import { PaymentsService } from './payments.service';

import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver(() => Payment)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Mutation(() => Payment)
  @UseGuards(GqlAuthGuard)
  createPaymentIntent(
    @Args('deliveryRequestId', { type: () => String })
    deliveryRequestId: string,
  ) {
    return this.paymentsService.createPaymentIntent(deliveryRequestId);
  }
}
