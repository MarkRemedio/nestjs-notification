import { Injectable } from "@nestjs/common";
import { SmsStrategy } from "../strategy/implementation/sms.strategy";
import { PushStrategy } from "../strategy/implementation/push.strategy";
import { NotificationStrategy } from "../strategy/notification.strategy";
import { NotificationType } from "../enums/notification-type.enum";
import { EmailStrategy } from "../strategy/implementation/email.strategy";

@Injectable()
export class NotificationFactory {
    constructor(
        private email:EmailStrategy,
        private sms:SmsStrategy,
        private push:PushStrategy
    ){}

    getNotificationStrategy(type:NotificationType):NotificationStrategy{
        const strategies: Record<NotificationType, NotificationStrategy> = {
            [NotificationType.EMAIL]: this.email,
            [NotificationType.SMS]: this.sms,
            [NotificationType.PUSH]: this.push
        };

        if (!strategies[type]) {
            throw new Error(`Notification type ${type} not supported`);
        }

        return strategies[type];
    }
}