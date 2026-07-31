import { Module } from '@nestjs/common';
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
    NotificationModule,
    TypeOrmModule.forRoot(typeOrmConfig),
  ]
})
export class AppModule {}
