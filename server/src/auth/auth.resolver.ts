import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';

import { User } from '../users/entities/user.entity';

import { AuthService } from './auth.service';

import { LoginInput } from './dto/auth.login';
import { AuthResponse } from './dto/auth.response';
import { RegisterInput } from './dto/auth.register';

import { GqlAuthGuard } from './gql-auth.guard';
import { CurrentUser } from './current-user.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async login(@Args('loginInput') loginInput: LoginInput) {
    const user = await this.authService.validateUser(
      loginInput.email,
      loginInput.password,
    );

    if (!user) throw new UnauthorizedException();

    return this.authService.generateJWT(user);
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
