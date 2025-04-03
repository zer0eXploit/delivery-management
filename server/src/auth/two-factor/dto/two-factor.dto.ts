import { IsString, Length } from 'class-validator';
import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class TwoFactorVerifyInput {
  @Field()
  @IsString()
  @Length(6, 6)
  code: string;
}

@ObjectType()
export class TwoFactorResponse {
  @Field()
  success: boolean;

  @Field(() => String, { nullable: true })
  access_token?: string;
}
