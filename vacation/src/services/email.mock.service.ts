// src/auth/services/email.mock.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';

@Injectable()
export class MockEmailService extends EmailService {
  private readonly logger = new Logger(MockEmailService.name);

  async sendOtp(email: string, code: string) {
    this.logger.log(`Mock send OTP ${code} to ${email}`);
  }
}
