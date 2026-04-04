import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';
import { User } from '../users/entities/user.entity';
import { Activity } from '../activities/entities/activity.entity';
import { EmissionFactor } from '../emissions/entities/emission-factor.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...AppDataSource.options,
      }),
    }),
    TypeOrmModule.forFeature([User, Activity, EmissionFactor]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}