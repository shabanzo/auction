import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Bid } from '../bid/bid.entity';
import { Item } from '../item/item.entity';

@Entity()
@Index('unique_email', ['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn() id: number;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false, })
  password: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  walletBalance: number;

  @OneToMany(() => Item, item => item.user)
  items: Item[];

  @OneToMany(() => Bid, bid => bid.user)
  bids: Bid[];
}
