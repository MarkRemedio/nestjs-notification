import { Injectable } from "@nestjs/common";
import { NotificationStrategy } from "../notification.strategy";
import { SendNotificationDto } from "../../dto/send-notification.dto";
import { NotificationResult } from "../../dto/notification-result.dto";
import { NotificationType } from "../../enums/notification-type.enum";

@Injectable()
export class PushStrategy implements NotificationStrategy {
    async send(dto: SendNotificationDto): Promise<NotificationResult> {
        console.log(`Sending PUSH notification to ${dto.recipient}`, dto);
        const success = Math.random() > 0.2;

        if (success) {
            return {
                success: true,
                provider: NotificationType.PUSH,
                message: `${dto.type} notification delivered`,
            };
        }

        return {
            success: false,
            provider: NotificationType.PUSH,
            error: 'Simulated provider failure',
        };
    }
}