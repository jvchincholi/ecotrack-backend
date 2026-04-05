import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Activity Entity
 * 
 * Represents a user's carbon-emitting activity (e.g., driving, eating, energy usage).
 * Stores activity details and calculated CO2 emissions.
 * 
 * @entity activities
 */
@Entity('activities')
export class Activity {
  /**
   * Unique UUID identifier
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Owner of the activity
   */
  @Column()
  userId: string;

  /**
   * Relationship to user
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * Activity type/category
   * @example 'transport', 'food', 'energy'
   */
  @Column()
  type: string;

  /**
   * Numerical value of the activity
   * @example 15.5 (for 15.5 km)
   */
  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  /**
   * Unit of measurement
   * @example 'km', 'kg', 'kWh'
   */
  @Column()
  unit: string;

  /**
   * Calculated CO2 emissions in kg
   */
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  co2Emitted?: number;

  /**
   * When the activity occurred
   */
  @Column({ type: 'timestamp' })
  date: Date;

  /**
   * Optional description or notes
   */
  @Column({ nullable: true })
  description?: string;

  /**
   * When the record was created
   */
  @CreateDateColumn()
  createdAt: Date;
}