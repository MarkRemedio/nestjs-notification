import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationFactory } from './factory/notification.factory';
import { EmailStrategy } from './strategy/implementation/email.strategy';
import { SmsStrategy } from './strategy/implementation/sms.strategy';
import { PushStrategy } from './strategy/implementation/push.strategy';
import { NotificationEntity } from './entities/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports:[
    TypeOrmModule.forFeature([NotificationEntity])
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationFactory, EmailStrategy, SmsStrategy, PushStrategy]
})
export class NotificationModule {}
