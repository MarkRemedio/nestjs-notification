import { NotificationResult } from '../dto/notification-result.dto';
import { SendNotificationDto } from '../dto/send-notification.dto';

export interface NotificationStrategy {

 send(dto: SendNotificationDto): Promise<NotificationResult>;

}