import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { StolenItemType } from '../enums/stolen-item-type.enum';
import { ClanWar } from './clan-war.entity';

@Entity()
@Index(['thief_id'])
@Index(['victim_id'])
@Index(['clan_war_id'])
export class StolenItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: StolenItemType,
  })
  type: StolenItemType;

  @Column({ type: 'varchar' })
  value: string;

  @Column({ type: 'int', nullable: true })
  thief_id: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'thief_id' })
  thief: User;

  @Column({ type: 'int', nullable: true })
  victim_id: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'victim_id' })
  victim: User;

  @Column({ type: 'int', nullable: true })
  clan_war_id: number | null;

  @ManyToOne(() => ClanWar, (clanWar) => clanWar.stolen_items, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'clan_war_id' })
  clan_war?: ClanWar | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
