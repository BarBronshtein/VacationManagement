// src/auth/services/email.service.ts
export abstract class EmailService {
  abstract sendOtp(email: string, code: string): Promise<void>;
}
