import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Activity } from '../activities/entities/activity.entity';
import { EmissionFactor } from '../emissions/entities/emission-factor.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'ecotrack_user',
  password: process.env.DB_PASSWORD || 'ecotrack_dev_2026',
  database: process.env.DB_NAME || 'ecotrack_db',
  entities: [User, Activity, EmissionFactor],
  migrations: ['dist/src/database/migrations/*.js'],
  synchronize: false, // Use migrations in production
});