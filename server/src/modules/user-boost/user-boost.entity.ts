import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { UserBoostType } from './enums/user-boost-type.enum';

@Entity()
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

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
