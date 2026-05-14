// src/vacation-requests/vacation-requests.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacationRequestsController } from './vacation-request.controller';
import { VacationRequestsFacade } from './vacation-request.facade';
import { VacationRequestEntity } from 'src/entities/vacation-request.entity';
import { VacationRequestRepository } from './vacation-request.repository';
import { VacationRequestFactory } from 'src/factories/vaction-request.factory';
import { AutoApprovalStrategy } from './manager-approval.strategy';
import { AuthTokenService } from 'src/services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { UserRepository } from 'src/repositories/user.repository';
import { UserEntity } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VacationRequestEntity,UserEntity]),JwtModule.register({
        secret: process.env.JWT_SECRET || 'some-secret-key',
        signOptions: { expiresIn: '1h' },
      }),],
  controllers: [VacationRequestsController], // ← HTTP endpoints
  providers: [
    VacationRequestsFacade,
    VacationRequestRepository,
    VacationRequestFactory,
    AutoApprovalStrategy,
    AuthTokenService,
    UserRepository,
  ],
  exports:[UserRepository]
})
export class VacationRequestsModule {}
