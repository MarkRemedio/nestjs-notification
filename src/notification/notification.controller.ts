import { Body, Controller, Post, Param, Get, Patch, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PaginatedResultDto } from './dto/paginated-result.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationService } from './notification.service';
import { ApiStandardErrors } from './decorators/api-errors.decorator';
import { NotificationResult } from './dto/notification-result.dto';
import { PaginationDto } from './dto/pagination-request.dto';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationStatus } from './enums/notification-status.enum';
import { NotificationDto } from './dto/notification.dto';

@ApiTags('Notification')
@Controller('notification')
@ApiStandardErrors()
export class NotificationController {

    private notificationService: NotificationService;

    constructor(notificationService: NotificationService) {
        this.notificationService = notificationService;
    }

    @Post('send/:id')
    @ApiOperation({summary:'Send notification'})
    @ApiOkResponse({ type: NotificationResult, description: 'Notification sent successfully.' })
    send(@Param('id') id: string) : Promise<NotificationResult> {
        return this.notificationService.sendNotification(id);        
    }

    @Post()
    @ApiOperation({summary:'Save notification'})
    @ApiCreatedResponse({ type: NotificationDto, description: 'Notification saved successfully.' })
    save(@Body() dto:SendNotificationDto) : Promise<NotificationDto> {
        return this.notificationService.saveNotification(dto);        
    }

    @Get()
    @ApiOperation({summary:'Get all notifications paginated result'})
    @ApiOkResponse({ type: PaginatedResultDto, description: 'List of all notifications.' })
    async getAll(@Query() paginationDto : PaginationDto) : Promise<PaginatedResultDto<NotificationDto>> {
        return await this.notificationService.getAllNotifications(paginationDto);
    }

    @Get('status/:status')
    @ApiOperation({summary:'Get notifications by status'})
    @ApiParam({ name: 'status', enum: NotificationStatus, enumName: 'NotificationStatus', description: 'Notification status to filter by' })
    @ApiOkResponse({ type: [NotificationDto], description: 'List of notifications with the specified status.' })
    async getByStatus(@Param('status') status: string, @Query() paginationDto : PaginationDto) : Promise<PaginatedResultDto<NotificationDto>> {
        return this.notificationService.getNotificationsByStatus(status, paginationDto);
    }

    @Get('type/:type')
    @ApiOperation({summary:'Get notifications by type'})
    @ApiParam({ name: 'type', enum: NotificationType, enumName: 'NotificationType', description: 'Notification type to filter by' })
    @ApiOkResponse({ type: [NotificationDto], description: 'List of notifications with the specified type.' })
    async getByType(@Param('type') type: string, @Query() paginationDto : PaginationDto) : Promise<PaginatedResultDto<NotificationDto>> {
        return this.notificationService.getNotificationsByType(type, paginationDto);
    }

    @Get(':id')
    @ApiOperation({summary:'Get notification by ID'})
    @ApiOkResponse({ type: NotificationDto, description: 'Notification found successfully.' })
    async getById(@Param('id') id: string) : Promise<NotificationDto> {
        return this.notificationService.getNotificationById(id);
    }

    @Patch('cancel/:id')
    @ApiOperation({summary:'Cancel notification'})
    @ApiOkResponse({ type: NotificationDto, description: 'Notification cancelled successfully.' })
    async cancel(@Param('id') id: string) : Promise<NotificationDto> {
        return this.notificationService.cancelNotification(id);
    }
}
