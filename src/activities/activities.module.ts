import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Activity } from './entities/activity.entity';

/**
 * Activities Module
 * 
 * Encapsulates all activity-related functionality including:
 * - REST API endpoints for CRUD operations
 * - Activity service for business logic
 * - Database access layer via TypeORM
 * - CO2 emission calculations
 * 
 * Requires JWT authentication for all endpoints.
 * 
 * @module ActivitiesModule
 */
@Module({
  imports: [TypeOrmModule.forFeature([Activity])],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
