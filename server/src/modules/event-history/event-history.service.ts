import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventHistory } from './event-history.entity';
import { EventHistoryType } from './event-history-type.enum';
import { StolenItem } from '../clan-war/entities/stolen-item.entity';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@Injectable()
export class EventHistoryService {
  constructor(
    @InjectRepository(EventHistory)
    private readonly eventHistoryRepository: Repository<EventHistory>,
  ) {}

  async create(
    userId: number,
    type: EventHistoryType,
    stolenItems: StolenItem[],
  ): Promise<EventHistory> {
    const eventHistory = this.eventHistoryRepository.create({
      user_id: userId,
      type,
      stolen_items: stolenItems,
    });
    return this.eventHistoryRepository.save(eventHistory);
  }

  async findByUserId(
    userId: number,
    paginationDto?: PaginationDto,
  ): Promise<{
    data: EventHistory[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto || {};
    const skip = (page - 1) * limit;

    const [data, total] = await this.eventHistoryRepository.findAndCount({
      where: { user_id: userId },
      relations: [
        'user',
        'stolen_items',
        'stolen_items.thief',
        'stolen_items.victim',
      ],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
