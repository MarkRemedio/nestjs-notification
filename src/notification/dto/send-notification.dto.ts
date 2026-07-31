import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, MinDate } from 'class-validator';
import { NotificationType } from '../enums/notification-type.enum';

export class SendNotificationDto {
    @ApiProperty({ enum: NotificationType , description: 'Type of notification to send' })
    @IsEnum(NotificationType)
    type!: NotificationType;

    @ApiProperty({ description: 'Recipient of the notification' })
    @IsString()
    recipient!: string;

    @ApiProperty({ description: 'Message content of the notification' })
    @IsString()
    message!: string;

    @ApiProperty({ required: false, description: 'Subject of the notification' })
    @IsOptional()
    @IsString()
    subject?:string;

    @ApiProperty({ required: false, description: 'Scheduled time for the notification in ISO 8601 date or datetime format' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    /*@MinDate(() => new Date(), {
        message: 'Date must be after the current time',
    })*/
    scheduledAt?: Date;
}