import {
  IsEnum,
  IsEmail,
  MinLength,
  MaxLength,
  IsStrongPassword,
} from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

import { Role } from '../../enums/role.enum';

@InputType()
export class RegisterInput {
  @Field()
  @MinLength(4)
  @MaxLength(10)
  name: string;

  @Field()
  @IsEmail({}, { message: 'email must be a valid address' })
  email: string;

  @Field()
  @IsStrongPassword(
    {
      minLength: 8,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message:
        'password must be at least 8 characters in length with a mix of upper and lower case letters and special characters',
    },
  )
  password: string;

  @Field()
  @IsEnum(Role)
  role: string;
}
