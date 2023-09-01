import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Item } from '../item/item.entity';
import { User } from '../user/user.entity';

@Entity()
export class Bid {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.bids)
  user: User;

  @ManyToOne(() => Item, item => item.bids)
  item: Item;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  amount: number;
}
