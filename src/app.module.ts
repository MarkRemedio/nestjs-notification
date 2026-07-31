import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationModule } from './notification/notification.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { typeOrmConfig } from './database/typeorm.config';

@Module({
  controllers: [],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    NotificationModule,
    TypeOrmModule.forRoot(typeOrmConfig),
  ]
})
export class AppModule {}
