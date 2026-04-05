import { IsString, IsNumber, IsISO8601, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Activity types supported by EcoTrack
 */
export enum ActivityType {
  TRANSPORT = 'transport',
  FOOD = 'food',
  ENERGY = 'energy',
  WASTE = 'waste',
  OTHER = 'other',
}

/**
 * Data Transfer Object for creating a new activity
 * 
 * Validates activity input data and provides type safety
 * for activity creation requests.
 * 
 * @class CreateActivityDto
 */
export class CreateActivityDto {
  /**
   * Category of the activity
   * @example 'transport'
   */
  @ApiProperty({
    description: 'Activity type/category',
    enum: ActivityType,
    example: 'transport',
  })
  @IsEnum(ActivityType, { message: 'Activity type must be a valid category' })
  type: ActivityType;

  /**
   * Numerical value of the activity
   * @example 15.5 (for 15.5 km driven)
   */
  @ApiProperty({
    description: 'Numerical value (e.g., 15.5 for kilometers)',
    example: 15.5,
    type: 'number',
  })
  @IsNumber({}, { message: 'Value must be a number' })
  value: number;

  /**
   * Unit of measurement for the value
   * @example 'km'
   */
  @ApiProperty({
    description: 'Unit of measurement',
    example: 'km',
  })
  @IsString({ message: 'Unit must be a string' })
  unit: string;

  /**
   * ISO 8601 date string for when the activity occurred
   * @example '2026-04-05T10:30:00Z'
   */
  @ApiProperty({
    description: 'Activity date in ISO 8601 format',
    example: '2026-04-05T10:30:00Z',
  })
  @IsISO8601({}, { message: 'Date must be in ISO 8601 format' })
  date: string;

  /**
   * Optional description or notes about the activity
   * @example 'Drove to office and back'
   */
  @ApiProperty({
    description: 'Optional notes or description',
    example: 'Drove to office and back',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
