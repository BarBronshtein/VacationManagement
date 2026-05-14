// src/vacation-requests/factories/vacation-request.factory.ts
import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/entities/user.entity';
import { VacationRequestEntity } from 'src/entities/vacation-request.entity';
import { VacationRequestStatus } from 'src/enums/vacation-request-status.enum';

@Injectable()
export class VacationRequestFactory {
  create(
    employee: UserEntity,
    startDate: string,
    endDate: string,
    reason?: string,
    type?: string,
  ): Partial<VacationRequestEntity> {
    // you can enforce invariants here (start <= end, etc.)
    return {
      employee,
      startDate,
      endDate,
      reason,
      type,
      status: VacationRequestStatus.PENDING,
    };
  }
}
