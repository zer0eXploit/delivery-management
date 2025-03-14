import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsNumber, Min, IsEnum } from 'class-validator';

import { PaymentMethod } from '../../enums/payment-methods.enum';

@InputType()
export class CreateDeliveryRequestInput {
  @Field()
  @IsUUID()
  pickup_address_id: string;

  @Field()
  @IsUUID()
  delivery_address_id: string;

  @Field()
  @IsNumber()
  @Min(0.1)
  weight: number;

  @Field()
  @IsEnum(PaymentMethod)
  payment_method: string;
}
