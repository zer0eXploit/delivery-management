import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

import { RegisterInput } from './dto/auth.register';
import { JWTPayload } from './dto/auth.jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  generateJWT(user: User) {
    const payload: JWTPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
    };

    return { access_token: this.jwtService.sign(payload) };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return user;
    }

    return null;
  }

  async register(user: RegisterInput) {
    const password_hash = await bcrypt.hash(user.password, 10);
    const createdUser = await this.usersService.create({
      ...user,
      password_hash,
    });

    return this.generateJWT(createdUser);
  }
}
