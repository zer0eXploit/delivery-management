import { randomInt } from 'crypto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { EmailService } from '../../email/email.service';
import { User } from '../../users/entities/user.entity';
import { TwoFactorToken } from './entities/two-factor-token.entity';

@Injectable()
export class TwoFactorService {
  constructor(
    private emailService: EmailService,
    @InjectRepository(TwoFactorToken)
    private twoFactorTokenRepository: Repository<TwoFactorToken>,
  ) {}

  private generateToken(): string {
    return randomInt(100000, 999999).toString();
  }

  async generateAndSendToken(user: User): Promise<void> {
    const token = this.generateToken();
    const expires_at = new Date();
    expires_at.setMinutes(expires_at.getMinutes() + 10);

    await this.twoFactorTokenRepository.save({
      token,
      expires_at,
      user_id: user.id,
      user,
    });

    await this.emailService.send2FACode(user.email, {
      name: user.name,
      code: token,
    });
  }

  async verifyToken(user: User, token: string): Promise<boolean> {
    const twoFactorToken = await this.twoFactorTokenRepository.findOne({
      where: {
        user: { id: user.id },
        token,
        is_used: false,
      },
      order: { created_at: 'DESC' },
    });

    if (!twoFactorToken) {
      throw new UnauthorizedException('Invalid verification code');
    }

    if (twoFactorToken.expires_at < new Date()) {
      throw new UnauthorizedException('Verification code has expired');
    }

    await this.twoFactorTokenRepository.update(twoFactorToken.id, {
      is_used: true,
    });

    return true;
  }
}
