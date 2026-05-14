/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/auth/domain/user.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from 'src/enums/role.enum';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: Role, default: Role.EMPLOYEE })
  role!: Role;
}
