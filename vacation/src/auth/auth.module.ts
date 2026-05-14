// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthFacade } from './auth.facade';
import { UserEntity } from 'src/entities/user.entity';
import { OtpCodeEntity } from 'src/entities/otp-code.entity';
import { UserRepository } from 'src/repositories/user.repository';
import { OtpRepository } from 'src/repositories/otp.repository';
import { EmailService } from 'src/services/email.service';
import { MockEmailService } from 'src/services/email.mock.service';
import { AuthTokenService } from 'src/services/token.service';
import { OtpFactory } from 'src/factories/otp.factory';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailService } from 'src/email/email.service';
import { MailModule } from 'src/email/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, OtpCodeEntity]),
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'some-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthFacade,
    UserRepository,
    OtpRepository,
    OtpFactory,
    AuthTokenService,
    JwtService,
    // { provide: EmailService, useClass: MailService },
  ],
  exports: [TypeOrmModule, AuthTokenService, UserRepository],
})
export class AuthModule {}
