import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationStatus } from './enums/notification-status.enum';
import { NotificationService } from './notification.service';

describe('NotificationController', () => {
  let controller: NotificationController;
  let notificationService: {
    sendNotification: jest.Mock;
    saveNotification: jest.Mock;
    getAllNotifications: jest.Mock;
    getNotificationById: jest.Mock;
    getNotificationsByStatus: jest.Mock;
    getNotificationsByType: jest.Mock;
    cancelNotification: jest.Mock;
  };

  beforeEach(async () => {
    notificationService = {
      sendNotification: jest.fn(),
      saveNotification: jest.fn(),
      getAllNotifications: jest.fn(),
      getNotificationById: jest.fn(),
      getNotificationsByStatus: jest.fn(),
      getNotificationsByType: jest.fn(),
      cancelNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: notificationService,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate send to the service', async () => {
    notificationService.sendNotification.mockResolvedValue({ success: true });

    await expect(controller.send('123')).resolves.toEqual({ success: true });
    expect(notificationService.sendNotification).toHaveBeenCalledWith('123');
  });

  it('should delegate save to the service', async () => {
    const payload = {
      type: NotificationType.PUSH,
      recipient: 'user@example.com',
      message: 'Hello',
    };
    notificationService.saveNotification.mockResolvedValue({ id: '1' });

    await expect(controller.save(payload as never)).resolves.toEqual({ id: '1' });
    expect(notificationService.saveNotification).toHaveBeenCalledWith(payload);
  });

  it('should delegate getAll to the service', async () => {
    const pagination = { page: 2, limit: 5 };
    notificationService.getAllNotifications.mockResolvedValue({ data: [], meta: {} });

    await expect(controller.getAll(pagination as never)).resolves.toEqual({ data: [], meta: {} });
    expect(notificationService.getAllNotifications).toHaveBeenCalledWith(pagination);
  });

  it('should delegate getById to the service', async () => {
    notificationService.getNotificationById.mockResolvedValue({ id: '1' });

    await expect(controller.getById('1')).resolves.toEqual({ id: '1' });
    expect(notificationService.getNotificationById).toHaveBeenCalledWith('1');
  });

  it('should delegate getByStatus to the service', async () => {
    const pagination = { page: 1, limit: 10 };
    notificationService.getNotificationsByStatus.mockResolvedValue({ data: [{ id: '1' }], meta: {} });

    await expect(controller.getByStatus(NotificationStatus.PENDING, pagination as never)).resolves.toEqual({ data: [{ id: '1' }], meta: {} });
    expect(notificationService.getNotificationsByStatus).toHaveBeenCalledWith(NotificationStatus.PENDING, pagination);
  });

  it('should delegate getByType to the service', async () => {
    const pagination = { page: 1, limit: 10 };
    notificationService.getNotificationsByType.mockResolvedValue({ data: [{ id: '1' }], meta: {} });

    await expect(controller.getByType(NotificationType.EMAIL, pagination as never)).resolves.toEqual({ data: [{ id: '1' }], meta: {} });
    expect(notificationService.getNotificationsByType).toHaveBeenCalledWith(NotificationType.EMAIL, pagination);
  });

  it('should delegate cancel to the service', async () => {
    notificationService.cancelNotification.mockResolvedValue({ id: '1' });

    await expect(controller.cancel('1')).resolves.toEqual({ id: '1' });
    expect(notificationService.cancelNotification).toHaveBeenCalledWith('1');
  });

  it('should expose the type route param as a Swagger enum', () => {
    const metadata = Reflect.getMetadata('swagger/apiParameters', NotificationController.prototype.getByType);

    expect(metadata).toBeDefined();
    expect(metadata[0].name).toBe('type');
    expect(metadata[0].schema.enum).toEqual(Object.values(NotificationType));
  });

  it('should expose the status route param as a Swagger enum', () => {
    const metadata = Reflect.getMetadata('swagger/apiParameters', NotificationController.prototype.getByStatus);

    expect(metadata).toBeDefined();
    expect(metadata[0].name).toBe('status');
    expect(metadata[0].schema.enum).toEqual(Object.values(NotificationStatus));
  });
});
