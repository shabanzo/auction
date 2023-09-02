import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Bid } from '../bid/bid.entity';
import { User } from '../user/user.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  startingPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  currentPrice: number;

  @Column({ type: 'int' })
  timeWindowHours: number;

  @Column({ type: 'timestamptz', default: null })
  publishedAt: Date;

  @ManyToOne(() => User, (user) => user.items)
  user: User;

  @OneToMany(() => Bid, (bid) => bid.user)
  bids: Bid[];
}
