import {
  IsEmail,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  MinLength,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum MailPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

/**
 * DTO for POST /mail/send
 *
 * All validation is handled by class-validator decorators.
 * NestJS ValidationPipe enforces these rules before the
 * request ever reaches the service layer.
 */
export class SendMailDto {
  // ── Recipients ───────────────────────────────────────────────────────────

  /**
   * Primary recipients. Accepts a single email string or an array.
   * Each value is validated with @IsEmail() from class-validator.
   */
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one recipient is required.' })
  @ArrayMaxSize(50, { message: 'Cannot send to more than 50 recipients at once.' })
  @IsEmail({}, { each: true, message: 'Each recipient must be a valid email address.' })
  @Transform(({ value }) =>
    // Accept both a plain string and an array
    typeof value === 'string' ? [value] : value,
  )
  to: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true, message: 'Each CC address must be a valid email.' })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  cc?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true, message: 'Each BCC address must be a valid email.' })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  bcc?: string[];

  @IsOptional()
  @IsEmail({}, { message: 'Reply-to must be a valid email address.' })
  replyTo?: string;

  // ── Content ──────────────────────────────────────────────────────────────

  @IsString()
  @MinLength(3, { message: 'Subject must be at least 3 characters.' })
  @MaxLength(150, { message: 'Subject cannot exceed 150 characters.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  subject: string;

  /**
   * Plain-text body. Required when neither `html` nor `template` is provided.
   */
  @ValidateIf((o) => !o.html && !o.template)
  @IsString()
  @MinLength(1, { message: 'Body text cannot be empty.' })
  text?: string;

  @IsOptional()
  @IsString()
  html?: string;

  /**
   * Handlebars template name (without extension).
   * File must exist in src/mail/templates/<name>.hbs
   */
  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  context?: Record<string, unknown>;

  // ── Options ──────────────────────────────────────────────────────────────

  @IsOptional()
  @IsEnum(MailPriority, {
    message: `Priority must be one of: ${Object.values(MailPriority).join(', ')}.`,
  })
  priority?: MailPriority = MailPriority.NORMAL;
}
