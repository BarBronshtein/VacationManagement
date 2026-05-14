/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/auth/auth.facade.ts
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';
import { OtpRepository } from 'src/repositories/otp.repository';
import { OtpFactory } from 'src/factories/otp.factory';
import { MailService } from 'src/email/email.service';
import { AuthTokenService } from 'src/services/token.service';
import { UserEntity } from 'src/entities/user.entity';
import { RequestRegistrationDto } from './auth.schmas';

@Injectable()
export class AuthFacade {
  constructor(
    private readonly users: UserRepository,
    private readonly otps: OtpRepository,
    private readonly otpFactory: OtpFactory,
    private readonly emailService: MailService,
    private readonly tokens: AuthTokenService,
  ) {}

  async requestOtp(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      // Up to you: auto-register employee or fail
      throw new UnauthorizedException('Unknown email');
    }

    const { code, expiresAt } = this.otpFactory.createCode();
    console.log(await this.otps.createAndSave(email, code, expiresAt));
    await this.emailService.sendEmailVerification(email, code);
  }

  async verifyOtp(email: string, otp: string): Promise<{ token: string }> {
    const now = new Date();
    const record = await this.otps.findValid(email, otp, now);
    if (!record) throw new UnauthorizedException('Invalid OTP');

    await this.otps.markUsed(record);
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Unknown user');

    const token = this.tokens.createForUser(user);
    return { token };
  }

  async register(user: RequestRegistrationDto): Promise<UserEntity> {
    if (await this.users.findByEmail(user.email)) {
      throw new BadRequestException('Email already registered.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.users.save(<UserEntity>user);
  }
}
