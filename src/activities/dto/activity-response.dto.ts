import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for activity API responses
 * 
 * Represents the complete activity data returned from API endpoints.
 * Includes calculated CO2 emissions and metadata.
 * 
 * @class ActivityResponseDto
 */
export class ActivityResponseDto {
  /**
   * Unique UUID identifier for the activity
   * @example '550e8400-e29b-41d4-a716-446655440000'
   */
  @ApiProperty({
    description: 'Unique activity identifier',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  /**
   * User ID who created/owns this activity
   * @example '550e8401-e29b-41d4-a716-446655440001'
   */
  @ApiProperty({
    description: 'UUID of the user who created the activity',
    format: 'uuid',
    example: '550e8401-e29b-41d4-a716-446655440001',
  })
  userId: string;

  /**
   * Activity type/category
   * @example 'transport'
   */
  @ApiProperty({
    description: 'Activity category',
    enum: ['transport', 'food', 'energy', 'waste', 'other'],
    example: 'transport',
  })
  type: string;

  /**
   * Numerical value of the activity
   * @example 15.5
   */
  @ApiProperty({
    description: 'Activity value (e.g., 15.5 kilometers)',
    type: 'number',
    example: 15.5,
  })
  value: number;

  /**
   * Unit of measurement
   * @example 'km'
   */
  @ApiProperty({
    description: 'Unit of measurement',
    example: 'km',
  })
  unit: string;

  /**
   * Calculated CO2 emissions in kg
   * @example 3.5
   */
  @ApiProperty({
    description: 'Calculated CO2 emissions in kilograms',
    type: 'number',
    example: 3.5,
    nullable: true,
  })
  co2Emitted: number | null;

  /**
   * Date when the activity occurred
   * @example '2026-04-05T10:30:00.000Z'
   */
  @ApiProperty({
    description: 'Activity date and time',
    format: 'date-time',
    example: '2026-04-05T10:30:00.000Z',
  })
  date: Date;

  /**
   * Timestamp when the activity was created in the system
   * @example '2026-04-05T14:22:15.000Z'
   */
  @ApiProperty({
    description: 'Record creation timestamp',
    format: 'date-time',
    example: '2026-04-05T14:22:15.000Z',
  })
  createdAt: Date;

  /**
   * Optional description or notes about the activity
   * @example 'Drove to office'
   */
  @ApiProperty({
    description: 'Optional activity description',
    example: 'Drove to office',
    nullable: true,
  })
  description?: string;
}

/**
 * Paginated list of activities response
 * 
 * Used for list endpoints to provide activities with pagination metadata.
 * 
 * @class PaginatedActivitiesDto
 */
export class PaginatedActivitiesDto {
  /**
   * Array of activity records
   */
  @ApiProperty({
    description: 'Array of activities',
    type: [ActivityResponseDto],
  })
  data: ActivityResponseDto[];

  /**
   * Total number of activities matching the query
   * @example 42
   */
  @ApiProperty({
    description: 'Total count of activities',
    example: 42,
  })
  total: number;

  /**
   * Current page number (1-based indexing)
   * @example 1
   */
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  /**
   * Number of records per page
   * @example 10
   */
  @ApiProperty({
    description: 'Number of records per page',
    example: 10,
  })
  limit: number;

  /**
   * Total number of pages available
   * @example 5
   */
  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;
}
