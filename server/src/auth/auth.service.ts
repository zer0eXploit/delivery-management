import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { TwoFactorService } from './two-factor/two-factor.service';
import { DeliveryPersonsService } from '../delivery-persons/delivery-persons.service';

import { RegisterInput } from './dto/auth.register';
import { JWTPayload } from './dto/auth.jwt-payload';

import { Role } from '../enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private twoFactorService: TwoFactorService,
    private deliveryPersonsService: DeliveryPersonsService,
  ) {}

  generateJWT(user: User) {
    const payload: JWTPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
    };

    return { access_token: this.jwtService.sign(payload, { expiresIn: '7d' }) };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      // Generate and send 2FA token
      await this.twoFactorService.generateAndSendToken(user);
      return user;
    }

    return null;
  }

  async findUserForVerification(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return user;
    }
    return null;
  }

  async verifyTwoFactor(user: User, code: string) {
    const isValid = await this.twoFactorService.verifyToken(user, code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }
    return this.generateJWT(user);
  }

  async register(user: RegisterInput) {
    const password_hash = await bcrypt.hash(user.password, 10);
    const createdUser = await this.usersService.create({
      ...user,
      password_hash,
    });

    if (user.role === Role.Deliverer) {
      await this.deliveryPersonsService.createDeliveryPerson(createdUser);
    }

    return this.generateJWT(createdUser);
  }

  async getUserInfo(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If user is a deliverer, load delivery person info
    // if (user.role === Role.Deliverer) {
    //   const deliveryPerson =
    //     await this.deliveryPersonsService.findByUserId(userId);
    //   return {
    //     ...user,
    //     delivery_person: deliveryPerson,
    //   };
    // }

    return user;
  }
}
