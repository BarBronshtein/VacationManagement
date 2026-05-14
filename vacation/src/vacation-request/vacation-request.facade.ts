// src/vacation-requests/vacation-requests.facade.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VacationRequestRepository } from './vacation-request.repository';
import { VacationRequestFactory } from 'src/factories/vaction-request.factory';
import { AutoApprovalStrategy } from './manager-approval.strategy';

import { VacationRequestStatus } from 'src/enums/vacation-request-status.enum';
import { UserEntity } from 'src/entities/user.entity';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class VacationRequestsFacade {
  constructor(
    private readonly repo: VacationRequestRepository,
    private readonly factory: VacationRequestFactory,
    private readonly approvalStrategy: AutoApprovalStrategy,
  ) {}

  async listRequests(employee: UserEntity){
    return await this.repo.findEmployeeRequests(employee.id);
  }

  async submitRequest(
    employee: UserEntity,
    input: {
      startDate: string;
      endDate: string;
      reason?: string;
      type?: string;
    },
  ) {
    const partial = this.factory.create(
      employee,
      input.startDate,
      input.endDate,
      input.reason,
      input.type,
    );
    console.log('input: ', input);
    const entity = await this.repo.createAndSave(partial);
    if (await this.approvalStrategy.shouldAutoApprove(entity)) {
      entity.status = VacationRequestStatus.APPROVED;
      await this.repo.save(entity);
    }
    return entity;
  }

  async listPendingForManager(manager: UserEntity) {
    if (manager.role !== Role.MANAGER) {
      throw new ForbiddenException('Only managers can list pending requests');
    }
    return this.repo.findPendingForManager(manager.id);
  }

  async decide(
    manager: UserEntity,
    id: string,
    decision: 'APPROVE' | 'REJECT',
    comment?: string,
  ) {
    if (manager.role !== Role.MANAGER) {
      throw new ForbiddenException('Only managers can approve or reject');
    }

    const entity = await this.repo.findById(id);
    if (!entity) throw new NotFoundException('Vacation request not found');

    entity.status =
      decision === 'APPROVE'
        ? VacationRequestStatus.APPROVED
        : VacationRequestStatus.REJECTED;
    entity.managerComment = comment;
    return this.repo.save(entity);
  }
}
