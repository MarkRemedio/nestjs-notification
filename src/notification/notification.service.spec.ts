/// <reference types="jest" />
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationFactory } from './factory/notification.factory';
import { NotificationService } from './notification.service';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationStatus } from './enums/notification-status.enum';
import { NotificationType } from './enums/notification-type.enum';

jest.mock('./utils/notification.mapper', () => ({
  mapNotificationEntitiesToDtos: jest.fn((notifications) => notifications.map((notification: any) => ({ id: notification.id }))),
  mapNotificationEntityToDto: jest.fn((notification) => ({ id: notification.id })),
  mapPaginatedNotificationsToDto: jest.fn((paginatedResult) => ({
    data: paginatedResult.data.map((notification: any) => ({ id: notification.id })),
    meta: paginatedResult.meta,
  })),
}));

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepository: any;
  let factory: any;

  beforeEach(async () => {
    notificationRepository = {
      findOneBy: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
    };

    factory = {
      getNotificationStrategy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(NotificationEntity),
          useValue: notificationRepository,
        },
        {
          provide: NotificationFactory,
          useValue: factory,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should throw when the notification is not found', async () => {
      notificationRepository.findOneBy.mockResolvedValue(null);

      await expect(service.sendNotification('missing')).rejects.toThrow(NotFoundException);
      expect(notificationRepository.findOneBy).toHaveBeenCalledWith({ id: 'missing' });
    });

    it('should throw when the notification was cancelled', async () => {
      notificationRepository.findOneBy.mockResolvedValue({ id: '1', status: NotificationStatus.CANCELLED });

      await expect(service.sendNotification('1')).rejects.toThrow(BadRequestException);
      expect(notificationRepository.update).not.toHaveBeenCalled();
    });

    it('should throw when the notification was already processed', async () => {
      notificationRepository.findOneBy.mockResolvedValue({ id: '1', status: NotificationStatus.DELIVERED });

      await expect(service.sendNotification('1')).rejects.toThrow(BadRequestException);
      expect(notificationRepository.update).not.toHaveBeenCalled();
    });

    it('should mark the notification as delivered when the strategy succeeds', async () => {
      const strategy = { send: jest.fn().mockResolvedValue({ success: true, provider: NotificationType.PUSH }) };
      notificationRepository.findOneBy.mockResolvedValue({ id: '1', status: NotificationStatus.PENDING, type: NotificationType.PUSH });
      factory.getNotificationStrategy.mockReturnValue(strategy);

      const result = await service.sendNotification('1');

      expect(result).toEqual({ success: true, provider: NotificationType.PUSH });
      expect(factory.getNotificationStrategy).toHaveBeenCalledWith(NotificationType.PUSH);
      expect(strategy.send).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
      expect(notificationRepository.update).toHaveBeenCalledWith(
        { id: '1' },
        { status: NotificationStatus.DELIVERED, sentAt: expect.any(Date) },
      );
    });

    it('should mark the notification as failed when the strategy fails', async () => {
      const strategy = { send: jest.fn().mockResolvedValue({ success: false, provider: NotificationType.PUSH, error: 'failed' }) };
      notificationRepository.findOneBy.mockResolvedValue({ id: '1', status: NotificationStatus.PENDING, type: NotificationType.PUSH });
      factory.getNotificationStrategy.mockReturnValue(strategy);

      const result = await service.sendNotification('1');

      expect(result).toEqual({ success: false, provider: NotificationType.PUSH, error: 'failed' });
      expect(notificationRepository.update).toHaveBeenCalledWith(
        { id: '1' },
        { status: NotificationStatus.FAILED },
      );
    });
  });

  describe('saveNotification', () => {
    it('should save and send immediately when no schedule is provided', async () => {
      const dto = {
        recipient: 'user@example.com',
        type: NotificationType.EMAIL,
        message: 'Hello',
      };
      const entity = { id: '1', ...dto, scheduledAt: undefined };
      notificationRepository.create.mockReturnValue(entity);
      notificationRepository.save.mockResolvedValue(entity);
      jest.spyOn(service, 'sendNotification').mockResolvedValue({ success: true } as never);
      jest.spyOn(service, 'getNotificationById').mockResolvedValue({ id: '1' } as never);

      const result = await service.saveNotification(dto as never);

      expect(notificationRepository.create).toHaveBeenCalledWith({
        recipient: dto.recipient,
        type: dto.type,
        message: dto.message,
        subject: undefined,
        scheduledAt: undefined,
      });
      expect(service.sendNotification).toHaveBeenCalledWith('1');
      expect(result).toEqual({ id: '1' });
    });

    it('should return the saved notification when a schedule is provided', async () => {
      const scheduledAt = new Date('2026-08-01T10:00:00.000Z');
      const dto = {
        recipient: 'user@example.com',
        type: NotificationType.SMS,
        message: 'Hello',
        subject: 'Subject',
        scheduledAt,
      };
      const entity = { id: '2', ...dto };
      notificationRepository.create.mockReturnValue(entity);
      notificationRepository.save.mockResolvedValue(entity);

      const result = await service.saveNotification(dto as never);

      expect(notificationRepository.create).toHaveBeenCalledWith({
        recipient: dto.recipient,
        type: dto.type,
        message: dto.message,
        subject: dto.subject,
        scheduledAt,
      });
      expect(result).toEqual({ id: '2' });
    });
  });

  describe('processScheduledNotifications', () => {
    it('should send all pending notifications whose schedule time has arrived', async () => {
      const dueNotifications = [
        { id: '1', status: NotificationStatus.PENDING, scheduledAt: new Date('2026-08-01T10:00:00.000Z') },
        { id: '2', status: NotificationStatus.PENDING, scheduledAt: new Date('2026-07-31T10:00:00.000Z') },
      ];
      notificationRepository.find.mockResolvedValue(dueNotifications);
      jest.spyOn(service, 'sendNotification').mockResolvedValue({ success: true } as never);

      await service.processScheduledNotifications();

      expect(notificationRepository.find).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          status: NotificationStatus.PENDING,
          scheduledAt: expect.anything(),
        }),
      }));
      expect(service.sendNotification).toHaveBeenCalledTimes(2);
      expect(service.sendNotification).toHaveBeenCalledWith('1');
      expect(service.sendNotification).toHaveBeenCalledWith('2');
    });
  });

  it('should return a paginated result', async () => {
    notificationRepository.findAndCount.mockResolvedValue([[{ id: '1' }, { id: '2' }], 5]);

    const result = await service.getAllNotifications({ page: 2, limit: 2 } as never);

    expect(notificationRepository.findAndCount).toHaveBeenCalledWith({ skip: 2, take: 2 });
    expect(result).toEqual({
      data: [{ id: '1' }, { id: '2' }],
      meta: {
        totalItems: 5,
        itemCount: 2,
        itemsPerPage: 2,
        totalPages: 3,
        currentPage: 2,
      },
    });
  });

  describe('getNotificationById', () => {
    it('should throw when the notification is not found', async () => {
      notificationRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getNotificationById('missing')).rejects.toThrow(NotFoundException);
    });

    it('should return the mapped notification', async () => {
      notificationRepository.findOneBy.mockResolvedValue({ id: '1' });

      await expect(service.getNotificationById('1')).resolves.toEqual({ id: '1' });
    });
  });

  describe('cancelNotification', () => {
    it('should throw when the notification is not found', async () => {
      notificationRepository.findOneBy.mockResolvedValue(null);

      await expect(service.cancelNotification('missing')).rejects.toThrow(NotFoundException);
    });

    it('should throw when the notification has already been processed', async () => {
      notificationRepository.findOneBy.mockResolvedValue({ id: '1', status: NotificationStatus.DELIVERED });

      await expect(service.cancelNotification('1')).rejects.toThrow(BadRequestException);
      expect(notificationRepository.save).not.toHaveBeenCalled();
    });

    it('should cancel and return the notification', async () => {
      const notification = { id: '1', status: NotificationStatus.PENDING };
      notificationRepository.findOneBy.mockResolvedValue(notification);
      notificationRepository.save.mockResolvedValue({ ...notification, status: NotificationStatus.CANCELLED });

      await expect(service.cancelNotification('1')).resolves.toEqual({ id: '1' });
      expect(notificationRepository.save).toHaveBeenCalledWith({ id: '1', status: NotificationStatus.CANCELLED });
    });
  });

  describe('getNotificationsByStatus', () => {
    it('should throw when the status is invalid', async () => {
      await expect(service.getNotificationsByStatus('INVALID', { page: 1, limit: 10 } as never)).rejects.toThrow(BadRequestException);
    });

    it('should return notifications for a valid status', async () => {
      notificationRepository.findAndCount.mockResolvedValue([[{ id: '1' }], 1]);

      await expect(service.getNotificationsByStatus(NotificationStatus.PENDING, { page: 1, limit: 10 } as never)).resolves.toEqual({
        data: [{ id: '1' }],
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      });
      expect(notificationRepository.findAndCount).toHaveBeenCalledWith({
        where: { status: NotificationStatus.PENDING },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('getNotificationsByType', () => {
    it('should throw when the type is invalid', async () => {
      await expect(service.getNotificationsByType('INVALID', { page: 1, limit: 10 } as never)).rejects.toThrow(BadRequestException);
    });

    it('should return notifications for a valid type', async () => {
      notificationRepository.findAndCount.mockResolvedValue([[{ id: '1' }], 1]);

      await expect(service.getNotificationsByType(NotificationType.EMAIL, { page: 1, limit: 10 } as never)).resolves.toEqual({
        data: [{ id: '1' }],
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      });
      expect(notificationRepository.findAndCount).toHaveBeenCalledWith({
        where: { type: NotificationType.EMAIL },
        skip: 0,
        take: 10,
      });
    });
  });
});
