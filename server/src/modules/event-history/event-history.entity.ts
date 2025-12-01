import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
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
@Index(['user_id', 'created_at'])
@Index(['opponent_id'])
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

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', nullable: true })
  opponent_id: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'opponent_id' })
  opponent: User | null;

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
