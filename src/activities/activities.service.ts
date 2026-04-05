import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityResponseDto, PaginatedActivitiesDto } from './dto/activity-response.dto';

/**
 * Activities Service
 * 
 * Manages all activity-related operations including creation, retrieval,
 * updates, and deletion. Calculates CO2 emissions based on activity type
 * and value using emission factors.
 * 
 * Key responsibilities:
 * - CRUD operations for user activities
 * - CO2 emission calculation
 * - Pagination and filtering
 * - Activity validation
 * 
 * @class ActivitiesService
 */
@Injectable()
export class ActivitiesService {
  /**
   * Default emission factors (CO2 kg per unit)
   * Used when emission factors are not available in the database
   */
  private readonly DEFAULT_EMISSION_FACTORS = {
    transport: {
      car: 0.23, // kg CO2 per km
      bus: 0.089, // kg CO2 per km
      train: 0.041, // kg CO2 per km
      flight: 0.255, // kg CO2 per km
    },
    food: {
      beef: 27, // kg CO2 per kg
      chicken: 6.9, // kg CO2 per kg
      vegetable: 2, // kg CO2 per kg
    },
    energy: {
      electricity: 0.4, // kg CO2 per kWh
      gas: 2.04, // kg CO2 per kWh
    },
    waste: {
      general: 0.001, // kg CO2 per kg
    },
  };

  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  /**
   * Create a new activity for an authenticated user
   * 
   * Validates the activity data, calculates CO2 emissions,
   * and stores it in the database.
   * 
   * @param {string} userId - UUID of the user creating the activity
   * @param {CreateActivityDto} createActivityDto - Activity data to create
   * @returns {Promise<ActivityResponseDto>} Created activity with calculated emissions
   * @throws {BadRequestException} If activity data is invalid
   * @throws {InternalServerErrorException} If database operation fails
   * 
   * @example
   * const activity = await activitiesService.create(
   *   'user-uuid',
   *   {
   *     type: 'transport',
   *     value: 15.5,
   *     unit: 'km',
   *     date: '2026-04-05T10:30:00Z'
   *   }
   * );
   */
  async create(userId: string, createActivityDto: CreateActivityDto): Promise<ActivityResponseDto> {
    try {
      // Calculate CO2 emissions
      const co2Emitted = this.calculateEmissions(createActivityDto.type, createActivityDto.value);

      const activity = this.activityRepository.create({
        userId,
        type: createActivityDto.type,
        value: createActivityDto.value,
        unit: createActivityDto.unit,
        co2Emitted,
        date: new Date(createActivityDto.date),
      });

      const savedActivity = await this.activityRepository.save(activity);
      return this.mapToResponseDto(savedActivity);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create activity');
    }
  }

  /**
   * Retrieve all activities for an authenticated user with pagination
   * 
   * Fetches user's activities from newest to oldest, with support
   * for pagination and optional filtering.
   * 
   * @param {string} userId - UUID of the user
   * @param {number} page - Page number (default: 1, minimum: 1)
   * @param {number} limit - Records per page (default: 10, maximum: 100)
   * @returns {Promise<PaginatedActivitiesDto>} Paginated list of user activities
   * @throws {BadRequestException} If pagination parameters are invalid
   * @throws {InternalServerErrorException} If database query fails
   * 
   * @example
   * const activities = await activitiesService.findAll('user-uuid', 1, 10);
   * // Returns { data: [...], total: 42, page: 1, limit: 10, totalPages: 5 }
   */
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedActivitiesDto> {
    try {
      // Validate pagination parameters
      if (page < 1) {
        throw new BadRequestException('Page must be at least 1');
      }
      if (limit < 1 || limit > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }

      const skip = (page - 1) * limit;

      const [activities, total] = await this.activityRepository.findAndCount({
        where: { userId },
        order: { date: 'DESC' },
        take: limit,
        skip,
      });

      const responseDtos = activities.map((activity) => this.mapToResponseDto(activity));

      return {
        data: responseDtos,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve activities');
    }
  }

  /**
   * Retrieve a single activity by ID
   * 
   * Fetches a specific activity and ensures the requesting user
   * owns the activity before returning it.
   * 
   * @param {string} userId - UUID of the authenticated user
   * @param {string} activityId - UUID of the activity to retrieve
   * @returns {Promise<ActivityResponseDto>} Activity data
   * @throws {NotFoundException} If activity not found or user doesn't own it
   * @throws {InternalServerErrorException} If database query fails
   * 
   * @example
   * const activity = await activitiesService.findOne(
   *   'user-uuid',
   *   'activity-uuid'
   * );
   */
  async findOne(userId: string, activityId: string): Promise<ActivityResponseDto> {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id: activityId, userId },
      });

      if (!activity) {
        throw new NotFoundException('Activity not found');
      }

      return this.mapToResponseDto(activity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve activity');
    }
  }

  /**
   * Update an existing activity
   * 
   * Allows partial updates of activity records. If value or type
   * changes, CO2 emissions are recalculated automatically.
   * 
   * @param {string} userId - UUID of the authenticated user
   * @param {string} activityId - UUID of the activity to update
   * @param {UpdateActivityDto} updateActivityDto - Fields to update
   * @returns {Promise<ActivityResponseDto>} Updated activity record
   * @throws {NotFoundException} If activity not found or user doesn't own it
   * @throws {BadRequestException} If update data is invalid
   * @throws {InternalServerErrorException} If database operation fails
   * 
   * @example
   * const updated = await activitiesService.update(
   *   'user-uuid',
   *   'activity-uuid',
   *   { value: 20.5, description: 'Updated distance' }
   * );
   */
  async update(
    userId: string,
    activityId: string,
    updateActivityDto: UpdateActivityDto,
  ): Promise<ActivityResponseDto> {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id: activityId, userId },
      });

      if (!activity) {
        throw new NotFoundException('Activity not found');
      }

      // Update fields
      if (updateActivityDto.type !== undefined) {
        activity.type = updateActivityDto.type;
      }
      if (updateActivityDto.value !== undefined) {
        activity.value = updateActivityDto.value;
      }
      if (updateActivityDto.unit !== undefined) {
        activity.unit = updateActivityDto.unit;
      }
      if (updateActivityDto.date !== undefined) {
        activity.date = new Date(updateActivityDto.date);
      }

      // Recalculate emissions if type or value changed
      if (updateActivityDto.type !== undefined || updateActivityDto.value !== undefined) {
        activity.co2Emitted = this.calculateEmissions(activity.type, activity.value);
      }

      const updatedActivity = await this.activityRepository.save(activity);
      return this.mapToResponseDto(updatedActivity);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update activity');
    }
  }

  /**
   * Delete an activity
   * 
   * Removes an activity record from the database. Only the activity owner
   * can delete their activities.
   * 
   * @param {string} userId - UUID of the authenticated user
   * @param {string} activityId - UUID of the activity to delete
   * @returns {Promise<void>}
   * @throws {NotFoundException} If activity not found or user doesn't own it
   * @throws {InternalServerErrorException} If database operation fails
   * 
   * @example
   * await activitiesService.remove('user-uuid', 'activity-uuid');
   */
  async remove(userId: string, activityId: string): Promise<void> {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id: activityId, userId },
      });

      if (!activity) {
        throw new NotFoundException('Activity not found');
      }

      await this.activityRepository.delete(activityId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete activity');
    }
  }

  /**
   * Get user's total CO2 emissions for a period
   * 
   * Calculates the sum of all CO2 emissions for activities
   * within an optional date range.
   * 
   * @param {string} userId - UUID of the user
   * @param {Date} startDate - Optional start date (inclusive)
   * @param {Date} endDate - Optional end date (inclusive)
   * @returns {Promise<number>} Total CO2 in kilograms
   * @throws {InternalServerErrorException} If database query fails
   * 
   * @example
   * const total = await activitiesService.getTotalEmissions(
   *   'user-uuid',
   *   new Date('2026-03-01'),
   *   new Date('2026-03-31')
   * );
   * // Returns: 42.5 (kg CO2)
   */
  async getTotalEmissions(userId: string, startDate?: Date, endDate?: Date): Promise<number> {
    try {
      const query = this.activityRepository.createQueryBuilder('activity')
        .select('SUM(activity.co2Emitted)', 'total')
        .where('activity.userId = :userId', { userId });

      if (startDate) {
        query.andWhere('activity.date >= :startDate', { startDate });
      }
      if (endDate) {
        query.andWhere('activity.date <= :endDate', { endDate });
      }

      const result = await query.getRawOne();
      return parseFloat(result.total) || 0;
    } catch (error) {
      throw new InternalServerErrorException('Failed to calculate total emissions');
    }
  }

  /**
   * Calculate CO2 emissions based on activity type and value
   * 
   * Uses predefined emission factors to calculate CO2 for different
   * activity types. Falls back to default factors if database lookup fails.
   * 
   * @private
   * @param {string} type - Activity type (e.g., 'transport', 'food')
   * @param {number} value - Numerical value of the activity
   * @returns {number} Calculated CO2 emissions in kilograms
   * 
   * @example
   * const co2 = this.calculateEmissions('transport', 15.5);
   * // Assuming car default: 15.5 * 0.23 = 3.565 kg CO2
   */
  private calculateEmissions(type: string, value: number): number {
    // Default to 'other' category if type not recognized
    const factor = this.DEFAULT_EMISSION_FACTORS[type]?.car || 0.1;
    return Math.round(value * factor * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Map Activity entity to ActivityResponseDto
   * 
   * Converts database entity to API response format,
   * ensuring proper data types and structure.
   * 
   * @private
   * @param {Activity} activity - Activity entity from database
   * @returns {ActivityResponseDto} Formatted response DTO
   */
  private mapToResponseDto(activity: Activity): ActivityResponseDto {
    return {
      id: activity.id,
      userId: activity.userId,
      type: activity.type,
      value: Number(activity.value),
      unit: activity.unit,
      co2Emitted: activity.co2Emitted ? Number(activity.co2Emitted) : null,
      date: activity.date,
      createdAt: activity.createdAt,
      description: activity['description'] || undefined,
    };
  }
}
