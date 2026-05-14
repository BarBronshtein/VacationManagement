// src/auth/zod/auth.schemas.ts
import { email, z } from 'zod';

export const requestRegistrationSchema = z.object({
  email:z.string().email(),
  name:z.string(),
  role:z.enum(['EMPLOYEE','MANAGER'])
})

export type RequestRegistrationDto = z.infer<typeof requestRegistrationSchema>;

export const requestOtpSchema = z.object({
  email: z.string().email(),
});

export type RequestOtpDto = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;