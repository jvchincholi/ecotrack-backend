import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('emission_factors')
export class EmissionFactor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string; // e.g., 'transport', 'food'

  @Column()
  subcategory: string; // e.g., 'car', 'beef'

  @Column('decimal', { precision: 10, scale: 4 })
  factor: number; // CO2 per unit

  @Column()
  unit: string; // e.g., 'kg_co2_per_km'

  @Column({ nullable: true })
  source?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}