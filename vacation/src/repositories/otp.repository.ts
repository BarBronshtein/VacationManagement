// src/auth/repositories/otp.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { OtpCodeEntity } from 'src/entities/otp-code.entity';

export interface IOtpRepository {
  createAndSave(email: string, code: string, expiresAt: Date): Promise<OtpCodeEntity>;
  findValid(email: string, code: string, now: Date): Promise<OtpCodeEntity | null>;
  markUsed(otp: OtpCodeEntity): Promise<void>;
  deleteExpired(now: Date): Promise<void>;
}

@Injectable()
export class OtpRepository implements IOtpRepository {
  constructor(
    @InjectRepository(OtpCodeEntity)
    private readonly repo: Repository<OtpCodeEntity>,
  ) {}

  async createAndSave(email: string, code: string, expiresAt: Date) {
    const entity = this.repo.create({ email, code, expiresAt });
    return this.repo.save(entity);
  }

  findValid(email: string, code: string, now: Date) {
    return this.repo.findOne({
      where: { email, code, used: false, expiresAt: MoreThan(now) },
    });
  }

  async markUsed(otp: OtpCodeEntity) {
    otp.used = true;
    await this.repo.save(otp);
  }

  async deleteExpired(now: Date) {
    await this.repo.delete({ expiresAt: LessThan(now) });
    return;
  }
}
