import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  type: string; // e.g., 'transport', 'food', 'energy'

  @Column('decimal', { precision: 10, scale: 2 })
  value: number; // e.g., distance in km, kg of food

  @Column()
  unit: string; // e.g., 'km', 'kg'

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  co2Emitted?: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;
}