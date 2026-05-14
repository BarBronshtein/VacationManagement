// src/vacation-requests/vacation-requests.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';

import { CurrentUser } from 'src/auth/current-user.decorator';
import {
  submitVacationRequestSchema,
  decideVacationRequestSchema,
} from './vacation-request.schemas';
import { VacationRequestsFacade } from './vacation-request.facade';

import type {
  SubmitVacationRequestDto,
  DecideVacationRequestDto,
} from './vacation-request.schemas';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { UserEntity } from 'src/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { AuthTokenService } from 'src/services/token.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserRepository } from 'src/repositories/user.repository';

@Controller('vacation-requests')

export class VacationRequestsController {
  constructor(private readonly facade: VacationRequestsFacade,private readonly tokenService: AuthTokenService,private readonly userRepo:UserRepository) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  submit(
    @CurrentUser() user: UserEntity,
    @Body(new ZodValidationPipe(submitVacationRequestSchema)) body: SubmitVacationRequestDto,
  ) {
    return this.facade.submitRequest(user, body);
  }
  @Get('managers')
  getManagers(){
    return this.userRepo.getAllManagers();
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard)
  getRequestsByUser(@CurrentUser() currUser:UserEntity){
    return this.facade.listRequests(currUser);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  listPending(@CurrentUser() manager: UserEntity) {
    return this.facade.listPendingForManager(manager);
  }

  @Post(':id/decision')
  @UseGuards(JwtAuthGuard)
  @UsePipes()
  decide(
    @CurrentUser() manager: UserEntity,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(decideVacationRequestSchema))
    body: DecideVacationRequestDto,
  ) {
    console.log('id: ', id);
    return this.facade.decide(manager, id, body.decision, body.comment);
  }
}
