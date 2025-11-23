import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { EventHistoryType } from './enums/event-history-type.enum';
import { StolenItem } from '../clan-war/entities/stolen-item.entity';

@Entity()
export class EventHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EventHistoryType,
  })
  type: EventHistoryType;

  @Column({ type: 'int' })
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => StolenItem)
  @JoinTable({
    name: 'event_history_stolen_items',
    joinColumn: { name: 'event_history_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'stolen_item_id', referencedColumnName: 'id' },
  })
  stolen_items: StolenItem[];

  @CreateDateColumn()
  created_at: Date;
}
