import { IsString, IsNumber, IsISO8601, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ActivityType } from './create-activity.dto';

/**
 * Data Transfer Object for updating an existing activity
 * 
 * Extends CreateActivityDto but makes all fields optional,
 * allowing partial updates of activity records.
 * 
 * @class UpdateActivityDto
 */
export class UpdateActivityDto {
  /**
   * Updated activity type/category
   * @example 'transport'
   */
  @ApiProperty({
    description: 'Activity type/category',
    enum: ActivityType,
    example: 'transport',
    required: false,
  })
  @IsOptional()
  @IsEnum(ActivityType, { message: 'Activity type must be a valid category' })
  type?: ActivityType;

  /**
   * Updated numerical value
   * @example 20.5
   */
  @ApiProperty({
    description: 'Numerical value (e.g., 20.5 for kilometers)',
    example: 20.5,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Value must be a number' })
  value?: number;

  /**
   * Updated unit of measurement
   * @example 'km'
   */
  @ApiProperty({
    description: 'Unit of measurement',
    example: 'km',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Unit must be a string' })
  unit?: string;

  /**
   * Updated activity date
   * @example '2026-04-05T11:00:00Z'
   */
  @ApiProperty({
    description: 'Activity date in ISO 8601 format',
    example: '2026-04-05T11:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsISO8601({}, { message: 'Date must be in ISO 8601 format' })
  date?: string;

  /**
   * Updated description or notes
   * @example 'Updated: Drove to office with colleague'
   */
  @ApiProperty({
    description: 'Optional notes or description',
    example: 'Updated: Drove to office with colleague',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
