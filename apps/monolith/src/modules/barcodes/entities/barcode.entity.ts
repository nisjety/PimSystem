import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BarcodeType } from '../enums/barcode-type.enum';
import { BarcodeStatus } from '../enums/barcode-status.enum';

@Entity('barcodes')
export class Barcode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  value: string;

  @Column({
    type: 'enum',
    enum: BarcodeType,
  })
  type: BarcodeType;

  @Column('uuid')
  productId: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: BarcodeStatus,
    default: BarcodeStatus.ACTIVE,
  })
  status: BarcodeStatus;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<Barcode>) {
    Object.assign(this, partial);
  }
} 