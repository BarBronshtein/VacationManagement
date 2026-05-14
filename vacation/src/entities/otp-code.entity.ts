/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/auth/domain/otp-code.entity.ts
import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('otp_codes')
export class OtpCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  email!: string;

  @Column()
  code!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ default: false })
  used!: boolean;
}