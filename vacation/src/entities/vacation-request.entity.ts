/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/vacation-requests/domain/vacation-request.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { VacationRequestStatus } from 'src/enums/vacation-request-status.enum';

@Entity('vacation_requests')
export class VacationRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UserEntity, { eager: true })
  employee!: UserEntity;

  @Column({ type: 'date' })
  startDate!: string;

  @Column({ type: 'date' })
  endDate!: string;

  @Column({ nullable: true })
  reason?: string;

  @Column({ nullable: true })
  type?: string; // 'ANNUAL' | 'SICK' | 'UNPAID' etc.

  @Column({
    type: 'enum',
    enum: VacationRequestStatus,
    default: VacationRequestStatus.PENDING,
  })
  status!: VacationRequestStatus;

  @Column({ nullable: true })
  managerComment?: string;
}
