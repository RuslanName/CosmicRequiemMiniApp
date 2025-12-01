import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { UserBoostType } from './enums/user-boost-type.enum';

@Entity()
@Index(['user_id', 'type', 'end_time'])
@Index(['user_id', 'end_time'])
export class UserBoost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: UserBoostType,
  })
  type: UserBoostType;

  @Column({ type: 'timestamp', nullable: true })
  end_time?: Date;

  @Column({ type: 'int' })
  user_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
