/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// src/auth/auth.controller.ts
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { AuthFacade } from './auth.facade';
import {
  requestOtpSchema,
  verifyOtpSchema,
  requestRegistrationSchema,
} from './auth.schmas';
import type {
  RequestOtpDto,
  VerifyOtpDto,
  RequestRegistrationDto,
} from './auth.schmas';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly facade: AuthFacade) {}
  @Post('register')
  @UsePipes(new ZodValidationPipe(requestRegistrationSchema))
  async register(@Body() body: RequestRegistrationDto): Promise<void> {
    await this.facade.register(body);
  }

  @Post('request-otp')
  @UsePipes(new ZodValidationPipe(requestOtpSchema))
  async requestOtp(@Body() body: RequestOtpDto): Promise<void> {
    await this.facade.requestOtp(body.email);
  }

  @Post('verify-otp')
  @UsePipes(new ZodValidationPipe(verifyOtpSchema))
  async verifyOtp(@Body() body: VerifyOtpDto): Promise<{ token: string }> {
    return this.facade.verifyOtp(body.email, body.otp);
  }
}
