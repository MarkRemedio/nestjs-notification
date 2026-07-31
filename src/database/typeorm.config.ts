import { config } from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { NotificationEntity } from '../notification/entities/notification.entity';

config();

const migrationFilePattern = __filename.endsWith('.ts')
  ? 'src/database/migrations/*.ts'
  : 'dist/database/migrations/*.js';

const baseTypeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? '5432'),
  username: process.env.DATABASE_USERNAME ?? 'notification_user',
  password: process.env.DATABASE_PASSWORD ?? 'notification_password',
  database: process.env.DATABASE_NAME ?? 'notification_db',
  entities: [NotificationEntity],
  synchronize: false,
};

export const typeOrmConfig: TypeOrmModuleOptions = {
  ...baseTypeOrmConfig,
  autoLoadEntities: true,
};

export const migrationDataSourceConfig: DataSourceOptions = {
  ...baseTypeOrmConfig,
  migrations: [migrationFilePattern],
};