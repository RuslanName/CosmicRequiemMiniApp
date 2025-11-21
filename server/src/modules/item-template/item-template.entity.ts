import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ItemTemplateType } from './enums/item-template-type.enum';

@Entity()
export class ItemTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({
    type: 'enum',
    enum: ItemTemplateType,
  })
  type: ItemTemplateType;

  @Column({ type: 'varchar' })
  value: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
