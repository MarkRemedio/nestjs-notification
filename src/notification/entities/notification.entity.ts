import {
 Entity,
 PrimaryGeneratedColumn,
 Column,
 CreateDateColumn,
 UpdateDateColumn
} from 'typeorm';
import { NotificationType } from '../enums/notification-type.enum';
import { NotificationStatus } from '../enums/notification-status.enum';

@Entity('notifications')
export class NotificationEntity {

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column()
    recipient!:string;

    @Column({
        type:'enum',
        enum:NotificationType
    })
    type!:NotificationType;

    @Column()
    message!:string;


    @Column({nullable:true})
    subject?:string;

    @Column({
        type:'enum',
        enum:NotificationStatus,
        default:NotificationStatus.PENDING
    })
    status!:NotificationStatus;

    @Column({nullable:true})
    scheduledAt?:Date;
    
    @Column({nullable:true})
    sentAt?:Date;
    
    @CreateDateColumn()
    createdAt!:Date;

    @UpdateDateColumn()
    updatedAt!:Date;


}