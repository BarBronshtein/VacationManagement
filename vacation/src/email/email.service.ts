import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendMailOptions } from './mailOptions.interface';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailDto } from './emailDto';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Send a generic email from a validated DTO.
   * Called by the controller after NestJS ValidationPipe has already
   * enforced all class-validator rules on the DTO.
   */
  async sendMail(dto: SendMailDto): Promise<{ messageId: string }> {
    // Additional runtime validation beyond what class-validator covers
    this.validateMailOptions(dto);

    const options: SendMailOptions = {
      to: dto.to,
      cc: dto.cc,
      bcc: dto.bcc,
      replyTo: dto.replyTo,
      subject: dto.subject,
      priority: dto.priority,
    };

    if (dto.template) {
      options.template = dto.template;
      options.context = dto.context ?? {};
    } else if (dto.html) {
      options.html = dto.html;
    } else {
      options.text = dto.text;
    }

    return this.dispatch(options);
  }

  /**
   * Send a pre-built welcome email using the welcome.hbs template.
   * Convenience method for the auth flow.
   */
  async sendWelcome(to: string, name: string): Promise<{ messageId: string }> {
    this.assertValidEmail(to);
    return this.dispatch({
      to,
      subject: `Welcome to ${this.configService.get('APP_NAME')}!`,
      template: 'welcome',
      context: {
        name,
        appName: this.configService.get('APP_NAME'),
        appUrl: this.configService.get('APP_URL'),
      },
    });
  }

  /**
   * Send a password-reset link email.
   */
  async sendPasswordReset(
    to: string,
    resetLink: string,
    expiresInMinutes = 30,
  ): Promise<{ messageId: string }> {
    this.assertValidEmail(to);
    return this.dispatch({
      to,
      subject: 'Reset your password',
      template: 'reset-password',
      context: {
        resetLink,
        expiresInMinutes,
        appName: this.configService.get('APP_NAME'),
      },
    });
  }

  /**
   * Send an email-verification OTP.
   */
  async sendEmailVerification(
    to: string,
    otp: string,
    name?: string,
  ): Promise<{ messageId: string }> {
    this.assertValidEmail(to);
    return this.dispatch({
      to,
      subject: 'Verify your email address',
      // template: './templates/verify-email',
      html:this.getVerifyEmailHtml(otp,name ?? 'there',this.configService.get('APP_NAME') ?? 'appName'),
      priority: 'high',
    });
  }

  // ── Internal ──────────────────────────────────────────────────────────────
  private getVerifyEmailHtml(
    otp: string,
    name: string,
    appName: string,
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Verify your email</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; }
    .wrapper { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .header { background: #01696f; padding: 28px 40px; }
    .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 600; }
    .body { padding: 32px 40px; color: #28251d; }
    .body p { margin: 0 0 16px; line-height: 1.6; font-size: 15px; }
    .otp-box { font-size: 36px; font-weight: 700; letter-spacing: 10px; text-align: center; color: #01696f; padding: 20px; background: #cedcd8; border-radius: 6px; margin: 24px 0; font-family: monospace; }
    .footer { padding: 20px 40px; background: #f9f8f5; border-top: 1px solid #edeae5; font-size: 12px; color: #7a7974; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>Verify your email</h1></div>
    <div class="body">
      <p>Hi ${name},</p>
      <p>Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
      <div class="otp-box">${otp}</div>
      <p style="font-size:13px;color:#7a7974">If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div class="footer">© ${appName}</div>
  </div>
</body>
</html>`
}
  /** Core dispatch — wraps MailerService.sendMail with logging & error handling */
  private async dispatch(
    options: SendMailOptions,
  ): Promise<{ messageId: string }> {
    try {
      this.logger.log(
        `Sending "${options.subject}" → ${JSON.stringify(options.to)}`,
      );

      const result = await this.mailerService.sendMail(options as any);
      const messageId: string = result.messageId ?? 'unknown';

      this.logger.log(`✓ Email sent [messageId=${messageId}]`);
      return { messageId };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown mailer error';
      this.logger.error(`✗ Failed to send email: ${message}`, error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException(
        `Failed to send email: ${message}`,
      );
    }
  }

  /** Runtime email format guard (supplements class-validator for programmatic calls) */
  private assertValidEmail(email: string): void {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException(`"${email}" is not a valid email address.`);
    }
  }

  /** Cross-field validation not easily expressible in class-validator */
  private validateMailOptions(dto: SendMailDto): void {
    if (!dto.text && !dto.html && !dto.template) {
      throw new BadRequestException(
        'Email must have at least one of: text, html, or template.',
      );
    }

    // Prevent overlap between to / cc / bcc
    const allRecipients = [
      ...(dto.to ?? []),
      ...(dto.cc ?? []),
      ...(dto.bcc ?? []),
    ];
    const unique = new Set(allRecipients);
    if (unique.size !== allRecipients.length) {
      throw new BadRequestException(
        'Duplicate email addresses found across to, cc, and bcc fields.',
      );
    }
  }
}
