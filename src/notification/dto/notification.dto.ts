import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationStatus } from '../enums/notification-status.enum';
import { NotificationType } from '../enums/notification-type.enum';

export class NotificationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  recipient!: string;

  @ApiProperty({ enum: NotificationType })
  type!: NotificationType;

  @ApiProperty()
  message!: string;

  @ApiProperty({ enum: NotificationStatus })
  status!: NotificationStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional()
  subject?: string;

  @ApiPropertyOptional()
  scheduledAt?: Date;

  @ApiPropertyOptional()
  sentAt?: Date;
}