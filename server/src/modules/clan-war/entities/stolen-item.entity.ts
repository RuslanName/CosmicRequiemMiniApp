import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { StolenItemType } from '../enums/stolen-item-type.enum';
import { ClanWar } from './clan-war.entity';

@Entity()
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

  @ManyToOne(() => User)
  thief: User;

  @ManyToOne(() => User)
  victim: User;

  @Column({ type: 'int', nullable: true })
  clan_war_id: number | null;

  @ManyToOne(() => ClanWar, (clanWar) => clanWar.stolen_items, {
    nullable: true,
  })
  @JoinColumn({ name: 'clan_war_id' })
  clan_war?: ClanWar | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
