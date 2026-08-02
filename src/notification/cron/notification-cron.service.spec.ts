import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationCronService } from './notification-cron.service';
import { NotificationService } from '../notification.service';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationStatus } from '../enums/notification-status.enum';

describe('NotificationCronService', () => {
  let service: NotificationCronService;
  let notificationRepository: { find: jest.Mock };
  let notificationService: { sendNotification: jest.Mock };

  beforeEach(async () => {
    notificationRepository = {
      find: jest.fn(),
    };

    notificationService = {
      sendNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationCronService,
        {
          provide: getRepositoryToken(NotificationEntity),
          useValue: notificationRepository,
        },
        {
          provide: NotificationService,
          useValue: notificationService,
        },
      ],
    }).compile();

    service = module.get<NotificationCronService>(NotificationCronService);
  });

  it('should process all due notifications', async () => {
    const dueNotifications = [
      { id: '1' },
      { id: '2' },
    ];

    notificationRepository.find.mockResolvedValue(dueNotifications);
    notificationService.sendNotification.mockResolvedValue({ success: true });

    await service.processScheduledNotifications();

    expect(notificationRepository.find).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        status: NotificationStatus.PENDING,
        scheduledAt: expect.anything(),
      }),
    }));
    expect(notificationService.sendNotification).toHaveBeenCalledTimes(2);
    expect(notificationService.sendNotification).toHaveBeenCalledWith('1');
    expect(notificationService.sendNotification).toHaveBeenCalledWith('2');
  });
});
