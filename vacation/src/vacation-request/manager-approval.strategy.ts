// src/vacation-requests/strategies/manager-approval.strategy.ts
import { Injectable } from '@nestjs/common';
import { VacationRequestEntity } from 'src/entities/vacation-request.entity';

export interface VacationApprovalStrategy {
  shouldAutoApprove(request: VacationRequestEntity): boolean;
}

@Injectable()
export class AutoApprovalStrategy implements VacationApprovalStrategy {
  shouldAutoApprove(request: VacationRequestEntity): boolean {
    // Example: auto-approve short requests
    const days =
      (new Date(request.endDate).getTime() -
        new Date(request.startDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return days <= 1;
  }
}

@Injectable()
export class ManagerApprovalStrategy implements VacationApprovalStrategy {
  shouldAutoApprove(_request: VacationRequestEntity): boolean {
    return false;
  }
}
