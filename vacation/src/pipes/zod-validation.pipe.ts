// src/common/pipes/zod-validation.pipe.ts
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodError } from 'zod';
import type { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema?: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    console.log('schema: ', this.schema);
    if (!this.schema) return value;
    try {
      console.log('value: ', value);
      const parsed = this.schema.parse(value);
      return parsed;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          status: 400,
          message: 'Validation failed',
          issues: error.issues,
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
