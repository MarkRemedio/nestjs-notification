import { Injectable } from '@nestjs/common';
import { SendNotificationDto } from '../../dto/send-notification.dto';
import { NotificationStrategy } from '../notification.strategy';
import { NotificationResult } from '../../dto/notification-result.dto';
import { request } from 'https';
import { NotificationType } from '../../enums/notification-type.enum';

@Injectable()
export class EmailStrategy implements NotificationStrategy {
    
    async send( dto:SendNotificationDto):Promise<NotificationResult> {
        console.log(`Sending EMAIL to ${dto.recipient}`, dto);

        const success = Math.random() > 0.2;

        if (success) {
            return {
                success: true,
                provider: NotificationType.EMAIL,
                message: `${dto.type} notification delivered`,
            };
        }

        return {
            success: false,
            provider: NotificationType.EMAIL,
            error: 'Simulated provider failure',
        };
    }
}