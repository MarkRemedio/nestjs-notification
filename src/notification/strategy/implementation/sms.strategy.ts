import { NotificationStrategy } from '../notification.strategy';
import { SendNotificationDto } from '../../dto/send-notification.dto';
import { Injectable } from '@nestjs/common';
import { NotificationResult } from '../../dto/notification-result.dto';
import { NotificationType } from '../../enums/notification-type.enum';

@Injectable()       
export class SmsStrategy implements NotificationStrategy {
    async send(dto: SendNotificationDto): Promise<NotificationResult> {
        console.log(`Sending SMS to ${dto.recipient}`, dto);

        const success = Math.random() > 0.2;

        if (success) {
            return {
                success: true,
                provider: NotificationType.SMS,
                message: `${dto.type} notification delivered`,
            };
        }

        return {
            success: false,
            provider: NotificationType.SMS,
            error: 'Simulated provider failure',
        };
    }
}