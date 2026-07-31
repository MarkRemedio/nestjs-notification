import { DataSource } from 'typeorm';
import { migrationDataSourceConfig } from './typeorm.config';

export default new DataSource(migrationDataSourceConfig);
