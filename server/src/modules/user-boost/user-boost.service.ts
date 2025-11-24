import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { UserBoost } from './user-boost.entity';
import { CreateUserBoostDto } from './dtos/create-user-boost.dto';
import { UpdateUserBoostDto } from './dtos/update-user-boost.dto';
import { UserBoostType } from './enums/user-boost-type.enum';

@Injectable()
export class UserBoostService {
  constructor(
    @InjectRepository(UserBoost)
    private readonly userBoostRepository: Repository<UserBoost>,
  ) {}

  async findByUserId(userId: number): Promise<UserBoost[]> {
    return this.userBoostRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async findActiveByUserId(userId: number): Promise<UserBoost[]> {
    const now = new Date();
    return this.userBoostRepository.find({
      where: {
        user: { id: userId },
        end_time: MoreThan(now),
      },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async findLastByUserIdAndType(
    userId: number,
    type: UserBoostType,
  ): Promise<UserBoost | null> {
    return this.userBoostRepository.findOne({
      where: {
        user: { id: userId },
        type,
      },
      order: { created_at: 'DESC' },
    });
  }

  async checkAndCompleteExpiredShieldBoosts(
    userId: number,
    shieldEndTime: Date | null,
  ): Promise<void> {
    if (!shieldEndTime || shieldEndTime > new Date()) {
      return;
    }
    const now = new Date();
    const activeShieldBoosts = await this.userBoostRepository.find({
      where: {
        user: { id: userId },
        type: UserBoostType.SHIELD,
        end_time: MoreThan(now),
      },
    });

    for (const boost of activeShieldBoosts) {
      boost.end_time = new Date();
      await this.userBoostRepository.save(boost);
    }
  }

  async create(createUserBoostDto: CreateUserBoostDto): Promise<UserBoost> {
    const { user_id, ...rest } = createUserBoostDto;
    const userBoost = this.userBoostRepository.create({
      ...rest,
      user: { id: user_id } as any,
    });
    return this.userBoostRepository.save(userBoost);
  }

  async update(
    id: number,
    updateUserBoostDto: UpdateUserBoostDto,
  ): Promise<UserBoost> {
    const userBoost = await this.userBoostRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!userBoost) {
      throw new NotFoundException(`UserBoost with ID ${id} not found`);
    }

    Object.assign(userBoost, updateUserBoostDto);
    return this.userBoostRepository.save(userBoost);
  }

  async complete(id: number): Promise<UserBoost> {
    const userBoost = await this.userBoostRepository.findOne({
      where: { id },
    });

    if (!userBoost) {
      throw new NotFoundException(`UserBoost with ID ${id} not found`);
    }

    userBoost.end_time = new Date();
    return this.userBoostRepository.save(userBoost);
  }
}
