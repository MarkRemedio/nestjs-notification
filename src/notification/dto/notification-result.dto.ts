import { ApiProperty } from "@nestjs/swagger";
import { NotificationType } from "../enums/notification-type.enum";

export class NotificationResult {
  @ApiProperty({description:'Indicates whether the notification was sent successfully'})
  success!: boolean;

  @ApiProperty({description:'Provider of the notification', required:false})
  provider?: NotificationType;

  @ApiProperty({description:'Message content of the notification', required:false})
  message?: string;

  @ApiProperty({description:'Error message if the notification failed', required:false})
  error?: string;
}