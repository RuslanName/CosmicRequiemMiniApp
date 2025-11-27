import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationStatus } from './enums/notification-status.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(
    userId: number,
    title: string,
    description: string,
    type: NotificationType,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      user_id: userId,
      title,
      description,
      type,
      status: NotificationStatus.SENT,
    });

    return this.notificationRepository.save(notification);
  }

  async createForUsers(
    userIds: number[],
    title: string,
    description: string,
    type: NotificationType,
  ): Promise<void> {
    const notifications = userIds.map((userId) =>
      this.notificationRepository.create({
        user_id: userId,
        title,
        description,
        type,
        status: NotificationStatus.SENT,
      }),
    );

    await this.notificationRepository.save(notifications);
  }

  async findByUserId(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        user_id: userId,
        status: NotificationStatus.SENT,
      },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(notificationId: number, userId: number): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user_id: userId },
    });

    if (notification) {
      notification.status = NotificationStatus.READ;
      await this.notificationRepository.save(notification);
    }
  }
}
