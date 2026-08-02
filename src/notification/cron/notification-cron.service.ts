import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationStatus } from '../enums/notification-status.enum';
import { NotificationService } from '../notification.service';

@Injectable()
export class NotificationCronService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    const dueNotifications = await this.notificationRepository.find({
      where: {
        status: NotificationStatus.PENDING,
        scheduledAt: LessThanOrEqual(now),
      },
      order: {
        scheduledAt: 'ASC',
      },
    });

    console.log(
      `Processing ${dueNotifications.length} scheduled notifications at ${now.toISOString()}`,
      dueNotifications.map((notification) => notification.id),
    );

    for (const notification of dueNotifications) {
      await this.notificationService.sendNotification(notification.id);
    }
  }
}
