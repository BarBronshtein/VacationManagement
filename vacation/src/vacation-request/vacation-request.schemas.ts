// src/vacation-requests/zod/vacation-requests.schemas.ts
import { z } from 'zod';

export const submitVacationRequestSchema = z.object({
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  reason: z.string().max(500).optional(),
  type: z.string().optional(),
});

export type SubmitVacationRequestDto = z.infer<
  typeof submitVacationRequestSchema
>;

export const decideVacationRequestSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  comment: z.string().max(500).optional(),
});

export type DecideVacationRequestDto = z.infer<
  typeof decideVacationRequestSchema
>;
