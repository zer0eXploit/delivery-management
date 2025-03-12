import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNumber, Min } from 'class-validator';

@InputType()
export class CreateTownshipInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  code: string;

  @Field()
  @IsString()
  zipcode: string;

  @Field()
  @IsNumber()
  @Min(0)
  pickup_cost: number;

  @Field()
  @IsNumber()
  @Min(0)
  delivery_cost: number;
}
