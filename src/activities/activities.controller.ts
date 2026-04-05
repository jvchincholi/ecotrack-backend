import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityResponseDto, PaginatedActivitiesDto } from './dto/activity-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

/**
 * Activities Controller
 * 
 * Provides REST API endpoints for managing user activities and carbon emissions tracking.
 * All endpoints require JWT authentication and operate on the authenticated user's activities.
 * 
 * Routes:
 * - POST /api/activities - Create new activity
 * - GET /api/activities - List user's activities with pagination
 * - GET /api/activities/:id - Get specific activity
 * - PUT /api/activities/:id - Update activity
 * - DELETE /api/activities/:id - Delete activity
 * - GET /api/activities/emissions/total - Get total emissions
 * 
 * @class ActivitiesController
 */
@Controller('api/activities')
@ApiTags('Activities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  /**
   * Create a new activity for the authenticated user
   * 
   * Records a new activity (e.g., drive, meal, energy usage) and
   * automatically calculates the CO2 emissions based on activity type and value.
   * 
   * @param {Object} user - Authenticated user object from JWT token
   * @param {string} user.sub - User ID
   * @param {CreateActivityDto} createActivityDto - Activity data
   * @returns {Promise<ActivityResponseDto>} Created activity with calculated emissions
   * 
   * @throws {BadRequestException} If activity data is invalid
   * @throws {UnauthorizedException} If user not authenticated
   * 
   * HTTP Status Codes:
   * - 201: Activity created successfully
   * - 400: Validation error
   * - 401: Unauthorized - Invalid or missing token
   * 
   * @example
   * POST /api/activities
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * {
   *   "type": "transport",
   *   "value": 15.5,
   *   "unit": "km",
   *   "date": "2026-04-05T10:30:00Z"
   * }
   * 
   * Response: {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "userId": "550e8401-e29b-41d4-a716-446655440001",
   *   "type": "transport",
   *   "value": 15.5,
   *   "unit": "km",
   *   "co2Emitted": 3.57,
   *   "date": "2026-04-05T10:30:00.000Z",
   *   "createdAt": "2026-04-05T14:22:15.000Z"
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new activity' })
  @ApiResponse({
    status: 201,
    description: 'Activity created successfully',
    type: ActivityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @GetUser() user: any,
    @Body() createActivityDto: CreateActivityDto,
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.create(user.sub, createActivityDto);
  }

  /**
   * Get all activities for the authenticated user
   * 
   * Retrieves a paginated list of user's activities, sorted by date (newest first).
   * Supports pagination through query parameters.
   * 
   * @param {Object} user - Authenticated user object
   * @param {string} user.sub - User ID
   * @param {number} page - Page number (default: 1, minimum: 1)
   * @param {number} limit - Records per page (default: 10, maximum: 100)
   * @returns {Promise<PaginatedActivitiesDto>} Paginated list of activities
   * 
   * @throws {BadRequestException} If pagination parameters are invalid
   * @throws {UnauthorizedException} If user not authenticated
   * 
   * HTTP Status Codes:
   * - 200: Activities retrieved successfully
   * - 400: Invalid pagination parameters
   * - 401: Unauthorized
   * 
   * @example
   * GET /api/activities?page=1&limit=10
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * 
   * Response: {
   *   "data": [...],
   *   "total": 42,
   *   "page": 1,
   *   "limit": 10,
   *   "totalPages": 5
   * }
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user activities with pagination' })
  @ApiQuery({ name: 'page', type: 'number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: 'number', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Activities retrieved successfully',
    type: PaginatedActivitiesDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid pagination parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @GetUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedActivitiesDto> {
    return this.activitiesService.findAll(user.sub, page, limit);
  }

  /**
   * Get a specific activity by ID
   * 
   * Retrieves detailed information about a single activity.
   * Users can only access their own activities.
   * 
   * @param {Object} user - Authenticated user object
   * @param {string} user.sub - User ID
   * @param {string} id - Activity UUID
   * @returns {Promise<ActivityResponseDto>} Activity details
   * 
   * @throws {NotFoundException} If activity not found or user doesn't own it
   * @throws {UnauthorizedException} If user not authenticated
   * 
   * HTTP Status Codes:
   * - 200: Activity retrieved successfully
   * - 401: Unauthorized
   * - 404: Activity not found
   * 
   * @example
   * GET /api/activities/550e8400-e29b-41d4-a716-446655440000
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiResponse({
    status: 200,
    description: 'Activity retrieved successfully',
    type: ActivityResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async findOne(@GetUser() user: any, @Param('id') id: string): Promise<ActivityResponseDto> {
    return this.activitiesService.findOne(user.sub, id);
  }

  /**
   * Update an activity
   * 
   * Allows partial or complete updates to activity records.
   * If value or type changes, CO2 emissions are automatically recalculated.
   * 
   * @param {Object} user - Authenticated user object
   * @param {string} user.sub - User ID
   * @param {string} id - Activity UUID
   * @param {UpdateActivityDto} updateActivityDto - Fields to update
   * @returns {Promise<ActivityResponseDto>} Updated activity
   * 
   * @throws {BadRequestException} If update data is invalid
   * @throws {NotFoundException} If activity not found
   * @throws {UnauthorizedException} If user not authenticated
   * 
   * HTTP Status Codes:
   * - 200: Activity updated successfully
   * - 400: Validation error
   * - 401: Unauthorized
   * - 404: Activity not found
   * 
   * @example
   * PUT /api/activities/550e8400-e29b-41d4-a716-446655440000
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * {
   *   "value": 20.5,
   *   "description": "Updated distance"
   * }
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update activity' })
  @ApiResponse({
    status: 200,
    description: 'Activity updated successfully',
    type: ActivityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async update(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.update(user.sub, id, updateActivityDto);
  }

  /**
   * Delete an activity
   * 
   * Permanently removes an activity record from the database.
   * Users can only delete their own activities.
   * 
   * @param {Object} user - Authenticated user object
   * @param {string} user.sub - User ID
   * @param {string} id - Activity UUID
   * @returns {Promise<void>}
   * 
   * @throws {NotFoundException} If activity not found
   * @throws {UnauthorizedException} If user not authenticated
   * 
   * HTTP Status Codes:
   * - 204: Activity deleted successfully
   * - 401: Unauthorized
   * - 404: Activity not found
   * 
   * @example
   * DELETE /api/activities/550e8400-e29b-41d4-a716-446655440000
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete activity' })
  @ApiResponse({ status: 204, description: 'Activity deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async remove(@GetUser() user: any, @Param('id') id: string): Promise<void> {
    return this.activitiesService.remove(user.sub, id);
  }
}
