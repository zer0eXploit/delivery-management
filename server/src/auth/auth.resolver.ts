import { UnauthorizedException } from '@nestjs/common';
import { Resolver, Mutation, Args } from '@nestjs/graphql';

import { AuthService } from './auth.service';

import { LoginInput } from './dto/auth.login';
import { AuthResponse } from './dto/auth.response';
import { RegisterInput } from './dto/auth.register';

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
}
