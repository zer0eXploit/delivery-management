import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsUUID, IsOptional, IsPhoneNumber } from 'class-validator';

@InputType()
export class UpdateAddressInput {
  @Field()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  address_line?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  township_id?: string;

  @Field()
  @IsPhoneNumber('MM', {
    message: 'Please provide a valid myanmar phone number',
  })
  contact_number: string;
}
