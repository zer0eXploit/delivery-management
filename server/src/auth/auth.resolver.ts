import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';

import { User } from '../users/entities/user.entity';

import { AuthService } from './auth.service';

import { LoginInput } from './dto/auth.login';
import { AuthResponse } from './dto/auth.response';
import { RegisterInput } from './dto/auth.register';

import { GqlAuthGuard } from './gql-auth.guard';
import { CurrentUser } from './current-user.decorator';

import {
  TwoFactorResponse,
  TwoFactorVerifyInput,
} from './two-factor/dto/two-factor.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => TwoFactorResponse)
  async login(@Args('loginInput') loginInput: LoginInput) {
    const user = await this.authService.validateUser(
      loginInput.email,
      loginInput.password,
    );

    if (!user) throw new UnauthorizedException();

    return { success: true };
  }

  @Mutation(() => AuthResponse)
  async verifyTwoFactor(
    @Args('loginInput') loginInput: LoginInput,
    @Args('twoFactorInput') twoFactorInput: TwoFactorVerifyInput,
  ) {
    const user = await this.authService.findUserForVerification(
      loginInput.email,
      loginInput.password,
    );

    if (!user) throw new UnauthorizedException('Invalid credentials');

    return this.authService.verifyTwoFactor(user, twoFactorInput.code);
  }

  @Mutation(() => AuthResponse)
  async register(@Args('registerInput') registerInput: RegisterInput) {
    return this.authService.register(registerInput);
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User) {
    return this.authService.getUserInfo(user.id);
  }
}
