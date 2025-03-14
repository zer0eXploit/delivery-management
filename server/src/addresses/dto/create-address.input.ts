import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsUUID, IsNumber, IsPhoneNumber } from 'class-validator';

@InputType()
export class CreateAddressInput {
  @Field()
  @IsString()
  address_line: string;

  @Field()
  @IsUUID()
  township_id: string;

  @Field()
  @IsString()
  zip_code: string;

  @Field({ nullable: false })
  @IsPhoneNumber('MM', {
    message: 'Please provide a valid myanmar phone number',
  })
  contact_number: string;

  @Field()
  @IsString()
  contact_name: string;

  @Field()
  @IsNumber()
  latitude: number;

  @Field()
  @IsNumber()
  longitude: number;
}
