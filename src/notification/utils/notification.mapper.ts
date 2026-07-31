import { NotificationEntity } from '../entities/notification.entity';
import { NotificationDto } from '../dto/notification.dto';
import { PaginatedResultDto } from '../dto/paginated-result.dto';

export function mapNotificationEntityToDto(notification: NotificationEntity): NotificationDto {
  const dto = new NotificationDto();

  dto.id = notification.id;
  dto.recipient = notification.recipient;
  dto.type = notification.type;
  dto.message = notification.message;
  dto.status = notification.status;
  dto.createdAt = notification.createdAt;

  if (notification.subject != null) {
    dto.subject = notification.subject;
  }

  if (notification.scheduledAt != null) {
    dto.scheduledAt = notification.scheduledAt;
  }

  if (notification.sentAt != null) {
    dto.sentAt = notification.sentAt;
  }

  return dto;
}

export function mapNotificationEntitiesToDtos(notifications: NotificationEntity[]): NotificationDto[] {
  return notifications.map(mapNotificationEntityToDto);
}

export function mapPaginatedNotificationsToDto(
  paginatedResult: PaginatedResultDto<NotificationEntity>,
): PaginatedResultDto<NotificationDto> {
  return {
    data: mapNotificationEntitiesToDtos(paginatedResult.data),
    meta: paginatedResult.meta,
  };
}