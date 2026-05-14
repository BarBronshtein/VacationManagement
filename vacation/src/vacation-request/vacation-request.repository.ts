// src/vacation-requests/repositories/vacation-request.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VacationRequestEntity } from 'src/entities/vacation-request.entity';
import { VacationRequestStatus } from 'src/enums/vacation-request-status.enum';

export interface IVacationRequestRepository {
  createAndSave(
    request: Partial<VacationRequestEntity>,
  ): Promise<VacationRequestEntity>;
  findPendingForManager(managerId: string): Promise<VacationRequestEntity[]>;
  findById(id: string): Promise<VacationRequestEntity | null>;
  save(entity: VacationRequestEntity): Promise<VacationRequestEntity>;
}

@Injectable()
export class VacationRequestRepository implements IVacationRequestRepository {
  constructor(
    @InjectRepository(VacationRequestEntity)
    private readonly repo: Repository<VacationRequestEntity>,
  ) {}

  createAndSave(request: Partial<VacationRequestEntity>) {
    const entity = this.repo.create(request);
    console.log('createAndSave:entity - ', entity);
    return this.repo.save(entity);
  }

  findPendingForManager(_managerId: string) {
    // minimal: all pending; later filter by manager/team
    return this.repo.find({
      // where: { status: VacationRequestStatus.PENDING, id: _managerId },
      where: { status: VacationRequestStatus.PENDING },
    });
  }

  findEmployeeRequests(_employeeId: string) {
    // minimal: all pending; later filter by manager/team
    return this.repo.find({
      where: { employee: { id: _employeeId } },
    });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  save(entity: VacationRequestEntity) {
    return this.repo.save(entity);
  }
}
