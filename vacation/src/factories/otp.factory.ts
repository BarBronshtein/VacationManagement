// src/auth/factories/otp.factory.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpFactory {
  createCode(): { code: string; expiresAt: Date } {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60_000);
    return { code, expiresAt };
  }
}