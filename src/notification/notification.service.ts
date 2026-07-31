import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationFactory } from './factory/notification.factory';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationResult } from './dto/notification-result.dto';
import { NotificationEntity } from './entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationStatus } from './enums/notification-status.enum';
import { NotificationType } from './enums/notification-type.enum';
import { PaginationDto } from './dto/pagination-request.dto';
import { PaginatedResultDto } from './dto/paginated-result.dto';
import { NotificationDto } from './dto/notification.dto';
import { mapNotificationEntitiesToDtos, mapNotificationEntityToDto, mapPaginatedNotificationsToDto } from './utils/notification.mapper';

@Injectable()
export class NotificationService {
    private notificationRepository: Repository<NotificationEntity>;
    private factory: NotificationFactory;

    constructor(
        @InjectRepository(NotificationEntity)
        notificationRepository: Repository<NotificationEntity>,
        factory: NotificationFactory
    ) {
        this.notificationRepository = notificationRepository;
        this.factory = factory;
    }

    async sendNotification(id: string) : Promise<NotificationResult> {
        const notification = await this.notificationRepository.findOneBy({ id });

        if(!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        if(notification.status === NotificationStatus.CANCELLED) {
            throw new BadRequestException(`Notification with ID ${id} has been cancelled`);
        }

        if(notification.status !== NotificationStatus.PENDING) {
            throw new BadRequestException(`Notification with ID ${id} has already been processed`);
        }

        if(notification.scheduledAt && notification.scheduledAt > new Date()) {
            throw new BadRequestException(`Notification with ID ${id} is scheduled for a future time and cannot be sent yet`);
        }

        const strategy = this.factory.getNotificationStrategy(notification.type);
        const notificationResult: NotificationResult = await strategy.send(notification);
          

        if(notificationResult.success) {
            await this.notificationRepository.update({ id }, { status: NotificationStatus.DELIVERED, sentAt: new Date() });
        } else {
            await this.notificationRepository.update({ id }, { status: NotificationStatus.FAILED });
        }

        return notificationResult;
    }

    async saveNotification(entity:SendNotificationDto) : Promise<NotificationDto> {
        const notificationEntity = this.notificationRepository.create({
            recipient: entity.recipient,
            type: entity.type,
            message: entity.message,
            subject: entity.subject,
            scheduledAt: entity.scheduledAt ? new Date(entity.scheduledAt) : undefined,
        });

        const savedNotification = await this.notificationRepository.save(notificationEntity);

        if(!savedNotification.scheduledAt || savedNotification.scheduledAt <= new Date()) {
            await this.sendNotification(savedNotification.id);
            return this.getNotificationById(savedNotification.id);
        }
        
        return mapNotificationEntityToDto(savedNotification);
    }

    async getAllNotifications(paginationDto : PaginationDto) : Promise<PaginatedResultDto<NotificationDto>> {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const [data, total] = await this.notificationRepository.findAndCount({
            skip: skip,
            take: limit,
        });

        const totalPages = Math.ceil(total / limit);

        return mapPaginatedNotificationsToDto({
            data,
            meta: {
                totalItems: total,
                itemCount: data.length,
                itemsPerPage: limit,
                totalPages,
                currentPage: page,
            },
        });
    }

    async getNotificationById(id: string) : Promise<NotificationDto> {
        const notification = await this.notificationRepository.findOneBy({ id });

        if(!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        return mapNotificationEntityToDto(notification);
    }

    async cancelNotification(id: string) : Promise<NotificationDto> {
        const notification = await this.notificationRepository.findOneBy({ id });

        if(!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        if(notification.status !== NotificationStatus.PENDING) {
            throw new BadRequestException(`Notification with ID ${id} cannot be cancelled as it has already been processed`);
        }

        notification.status = NotificationStatus.CANCELLED;
        return mapNotificationEntityToDto(await this.notificationRepository.save(notification));
    }

    async getNotificationsByStatus(status: string, paginationDto : PaginationDto) : Promise<PaginatedResultDto<NotificationDto>> {
        if(!Object.values(NotificationStatus).includes(status as NotificationStatus)) {
            throw new BadRequestException(`Invalid status: ${status}`);
        }

        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const [data, total] = await this.notificationRepository.findAndCount({
            where: { status: status as NotificationStatus },
            skip: skip,
            take: limit,
        });

        const totalPages = Math.ceil(total / limit);

        return mapPaginatedNotificationsToDto({
            data,
            meta: {
                totalItems: total,
                itemCount: data.length,
                itemsPerPage: limit,
                totalPages,
                currentPage: page,
            },
        });
    }

    async getNotificationsByType(type: string, paginationDto : PaginationDto) : Promise<PaginatedResultDto<NotificationDto>> {
        if(!Object.values(NotificationType).includes(type as NotificationType)) {
            throw new BadRequestException(`Invalid type: ${type}`);
        }

        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const [data, total] = await this.notificationRepository.findAndCount({
            where: { type: type as NotificationType },
            skip: skip,
            take: limit,
        });

        const totalPages = Math.ceil(total / limit);

        return mapPaginatedNotificationsToDto({
            data,
            meta: {
                totalItems: total,
                itemCount: data.length,
                itemsPerPage: limit,
                totalPages,
                currentPage: page,
            },
        });
    }
}
