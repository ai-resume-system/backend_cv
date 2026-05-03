import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, MoreThanOrEqual } from 'typeorm';
import { IOtpCodeEntity } from 'src/domain/entities/otp-code.entity';
import {
  IOtpCodeRepository,
  ICreateOtpCodeData,
} from 'src/domain/repositories/otp-code.repository.interface';
import { OtpCodeOrmEntity } from '../entities/otp-code.orm-entity';

@Injectable()
export class OtpCodeTypeormRepository implements IOtpCodeRepository {
  private readonly logger = new Logger(OtpCodeTypeormRepository.name);

  constructor(
    @InjectRepository(OtpCodeOrmEntity)
    private readonly ormRepository: Repository<OtpCodeOrmEntity>,
  ) {}

  async create(data: ICreateOtpCodeData): Promise<IOtpCodeEntity> {
    await this.markActiveAsUsedByEmailType(data.email, data.type);

    const entity = this.ormRepository.create({
      email: data.email,
      codeHash: data.codeHash,
      type: data.type,
      expiresAt: data.expiresAt,
    });
    const saved = await this.ormRepository.save(entity);
    return this.toDomain(saved);
  }

  async findValid(email: string, type: string): Promise<IOtpCodeEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: {
        email,
        type,
        usedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });

    if (!orm) return null;
    if (new Date() > orm.expiresAt) return null;

    return this.toDomain(orm);
  }

  async markUsed(id: string): Promise<void> {
    await this.ormRepository.update({ id }, { usedAt: new Date() });
  }

  async markActiveAsUsedByEmailType(
    email: string,
    type: string,
  ): Promise<void> {
    await this.ormRepository.update(
      { email, type, usedAt: IsNull() },
      { usedAt: new Date() },
    );
  }

  async countRecentByEmailType(
    email: string,
    type: string,
    since: Date,
  ): Promise<number> {
    return this.ormRepository.count({
      where: {
        email,
        type,
        createdAt: MoreThanOrEqual(since),
      },
    });
  }

  async deleteByEmailType(email: string, type: string): Promise<void> {
    await this.ormRepository.delete({ email, type });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.ormRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected || 0;
  }

  private toDomain(orm: OtpCodeOrmEntity): IOtpCodeEntity {
    return {
      id: orm.id,
      email: orm.email,
      codeHash: orm.codeHash,
      type: orm.type,
      expiresAt: orm.expiresAt,
      usedAt: orm.usedAt,
      createdAt: orm.createdAt,
    };
  }
}
